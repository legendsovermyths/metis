use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
    sync::{Arc, Mutex, Once},
};

use serde::Deserialize;

use crate::{
    api::request::handler::runtime,
    app::{journey::Dialogue, AppContext},
    error::{MetisError, Result},
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMClient,
    },
    prompts::get_prompt_provider,
    utils::format::strip_json_block,
};

use super::NarratorOutput;

const VENV_DIR: &str = "../data/blackboard_venv";
const REQUIRED_PACKAGES: &[&str] = &["matplotlib", "numpy", "seaborn"];

static VENV_INIT: Once = Once::new();

#[derive(Deserialize)]
struct BlackboardOutput {
    code: String,
}

fn venv_python() -> PathBuf {
    Path::new(VENV_DIR).join("bin/python3")
}

fn ensure_venv() {
    VENV_INIT.call_once(|| {
        let python = venv_python();
        if python.exists() {
            log::info!("[illustrator] Blackboard venv already exists");
            return;
        }

        log::info!("[illustrator] Creating blackboard venv at {}", VENV_DIR);
        let create = Command::new("python3")
            .args(["-m", "venv", VENV_DIR])
            .output();

        match create {
            Ok(out) if out.status.success() => {
                log::info!("[illustrator] Venv created, installing packages...");
                let pip = Path::new(VENV_DIR).join("bin/pip");
                let install = Command::new(pip)
                    .arg("install")
                    .args(REQUIRED_PACKAGES)
                    .output();

                match install {
                    Ok(out) if out.status.success() => {
                        log::info!("[illustrator] Packages installed successfully");
                    }
                    Ok(out) => {
                        let stderr = String::from_utf8_lossy(&out.stderr);
                        log::error!("[illustrator] pip install failed: {}", stderr);
                    }
                    Err(e) => log::error!("[illustrator] Failed to run pip: {}", e),
                }
            }
            Ok(out) => {
                let stderr = String::from_utf8_lossy(&out.stderr);
                log::error!("[illustrator] Failed to create venv: {}", stderr);
            }
            Err(e) => log::error!("[illustrator] Failed to run python3 -m venv: {}", e),
        }
    });
}

pub struct Illustrator {
    client: Arc<tokio::sync::Mutex<dyn LLMClient>>,
    context: Arc<Mutex<AppContext>>,
}

impl Illustrator {
    pub fn with(context: Arc<Mutex<AppContext>>) -> Self {
        let client = LLMClientFactory::get_client(ClientType::GEMINI);
        Self { client, context }
    }

    pub(crate) fn generate(&self, output: &NarratorOutput) -> Result<Dialogue> {
        let blackboard = match &output.blackboard {
            Some(bb) if bb != "clear" => bb.clone(),
            _ => {
                return Ok(Dialogue {
                    content: output.dialogue.clone(),
                    image_url: None,
                });
            }
        };

        let (chapter_dir, topic_name) = {
            let ctx = self.context.lock().unwrap();
            let ts = ctx.teaching_state.as_ref()
                .ok_or(MetisError::AgentError("No teaching state".into()))?;
            let topic = ts.journey.journey
                .get_topic(ts.progress.arc_idx, ts.progress.arcs[ts.progress.arc_idx].topic_idx)
                .map(|t| t.name.clone())
                .unwrap_or_default();
            (ts.journey.chapter_dir.clone(), topic)
        };

        let illustrations_dir = Path::new(&chapter_dir).join("illustrations");
        fs::create_dir_all(&illustrations_dir).map_err(|e|
            MetisError::AgentError(format!("Failed to create illustrations dir: {}", e))
        )?;
        let illustrations_dir = fs::canonicalize(&illustrations_dir).map_err(|e|
            MetisError::AgentError(format!("Failed to resolve illustrations path: {}", e))
        )?;

        let filename = format!("fig_{}.svg", chrono::Utc::now().format("%Y%m%d_%H%M%S_%3f"));
        let output_path = illustrations_dir.join(&filename);
        let output_path = output_path.to_string_lossy().to_string();

        let prompt = get_prompt_provider().get_blackboard_prompt(&blackboard, &topic_name);

        let response = runtime().block_on(async {
            let mut client = self.client.lock().await;
            client.set_system_prompt(prompt);
            client.generate("Produce the figure code.".to_string()).await
        })?;

        let raw = response.text();
        let json_str = strip_json_block(&raw);
        let parsed: BlackboardOutput = match serde_json::from_str(json_str) {
            Ok(v) => v,
            Err(e) => {
                log::warn!("[illustrator] Failed to parse blackboard output: {}", e);
                return Ok(Dialogue {
                    content: output.dialogue.clone(),
                    image_url: None,
                });
            }
        };

        let code = parsed.code.replace("{output_path}", &output_path);

        match self.execute_python(&code) {
            Ok(_) => {
                if Path::new(&output_path).exists() {
                    log::info!("[illustrator] Generated figure: {}", output_path);
                    Ok(Dialogue {
                        content: output.dialogue.clone(),
                        image_url: Some(output_path),
                    })
                } else {
                    log::warn!("[illustrator] Python ran but no output file produced");
                    Ok(Dialogue {
                        content: output.dialogue.clone(),
                        image_url: None,
                    })
                }
            }
            Err(e) => {
                log::warn!("[illustrator] Python execution failed: {}", e);
                Ok(Dialogue {
                    content: output.dialogue.clone(),
                    image_url: None,
                })
            }
        }
    }

    fn execute_python(&self, code: &str) -> Result<()> {
        ensure_venv();

        let python = venv_python();
        if !python.exists() {
            return Err(MetisError::AgentError(
                "Blackboard venv not available. Check logs for setup errors.".into()
            ));
        }

        let result = Command::new(python)
            .arg("-c")
            .arg(code)
            .output()
            .map_err(|e| MetisError::AgentError(format!("Failed to run python: {}", e)))?;

        if !result.status.success() {
            let stderr = String::from_utf8_lossy(&result.stderr);
            return Err(MetisError::AgentError(format!("Python error: {}", stderr)));
        }
        Ok(())
    }
}
