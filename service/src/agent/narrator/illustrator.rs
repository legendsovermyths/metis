use std::{fs, path::Path};

use serde::Deserialize;

use crate::{
    app::journey::blackboard::{Blackboard, ElementDescriptor},
    error::{MetisError, Result},
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMClient,
    },
    prompts::get_prompt_provider,
    utils::{
        cmd::{execute_latex, execute_python},
        format::{fix_json_escapes, fix_mathtext_shorthands, strip_json_block},
    },
};

#[derive(Deserialize)]
struct IllustratorOutput {
    library: String,
    code: String,
}

pub struct IllustrationResult {
    pub blackboard: Blackboard,
    pub source_code: Option<String>,
    pub library: Option<String>,
}

impl IllustrationResult {
    pub fn empty() -> Self {
        Self {
            blackboard: Blackboard::empty(),
            source_code: None,
            library: None,
        }
    }
}

pub struct IllustrationRequest<'a> {
    pub dialogue: &'a str,
    pub instruction: &'a str,
    pub previous_instruction: &'a str,
    pub chapter_dir: &'a str,
    pub topic: &'a str,
    pub parts: &'a [ElementDescriptor],
}

pub struct Illustrator {
    client: Box<dyn LLMClient>,
}

impl<'a> Illustrator {
    pub fn with() -> Self {
        let mut client = LLMClientFactory::get_client(ClientType::GeminiPro);
        client.set_json_mode(true);
        Self { client }
    }

    fn prepare_prompt(&self, request: &IllustrationRequest) -> String {
        let parts_json = if request.parts.is_empty() {
            "(No parts were pre-designed — default to sensible semantic ids.)".to_string()
        } else {
            serde_json::to_string_pretty(request.parts).unwrap_or_else(|_| "[]".to_string())
        };

        get_prompt_provider().get_blackboard_prompt(
            request.instruction,
            request.topic,
            request.dialogue,
            request.previous_instruction,
            &parts_json,
        )
    }

    pub fn get_output_path(&self, request: &IllustrationRequest) -> Result<String> {
        let illustrations_dir = Path::new(request.chapter_dir).join("illustrations");
        fs::create_dir_all(&illustrations_dir).map_err(|e| {
            MetisError::AgentError(format!("Failed to create illustrations dir: {}", e))
        })?;
        let illustrations_dir = fs::canonicalize(&illustrations_dir).map_err(|e| {
            MetisError::AgentError(format!("Failed to resolve illustrations path: {}", e))
        })?;

        let filename = format!("fig_{}.svg", chrono::Utc::now().format("%Y%m%d_%H%M%S_%3f"));
        let output_path = illustrations_dir.join(&filename);
        let output_path = output_path.to_string_lossy().to_string();
        Ok(output_path)
    }

    pub fn execute_illustrator_output(
        &self,
        output: IllustratorOutput,
        request: &IllustrationRequest,
    ) -> Result<IllustrationResult> {
        let output_path = self.get_output_path(request)?;
        let library = output.library.clone();

        let executed_code: String;
        let exec_result = match output.library.as_str() {
            "tikz" => {
                log::info!("[illustrator] rendering TikZ figure");
                executed_code = output.code.clone();
                execute_latex(&output.code, &output_path)
            }
            _ => {
                let code =
                    fix_mathtext_shorthands(&output.code).replace("{output_path}", &output_path);
                executed_code = code.clone();
                execute_python(&code)
            }
        };

        match exec_result {
            Ok(()) => {
                if Path::new(&output_path).exists() {
                    log::info!("[illustrator] figure saved to {output_path}");
                    Ok(IllustrationResult {
                        blackboard: Blackboard::new(
                            request.instruction.into(),
                            Some(output_path),
                        ),
                        source_code: Some(executed_code),
                        library: Some(library),
                    })
                } else {
                    log::error!("[illustrator] ran but no file at {output_path}");
                    Ok(IllustrationResult::empty())
                }
            }
            Err(e) => {
                log::error!("[illustrator] execution failed: {e}");
                Ok(IllustrationResult::empty())
            }
        }
    }

    pub async fn illustrate(
        &mut self,
        request: IllustrationRequest<'a>,
    ) -> Result<IllustrationResult> {
        let prompt = self.prepare_prompt(&request);

        self.client.set_system_prompt(prompt);
        let response = self
            .client
            .generate("Produce the figure code.".to_string())
            .await?;

        let raw = response.text();
        let json_str = strip_json_block(&raw);
        let fixed = fix_json_escapes(json_str);
        let parsed: IllustratorOutput = match serde_json::from_str(&fixed) {
            Ok(v) => v,
            Err(e) => {
                log::error!("[illustrator] failed to parse LLM response: {e}\nRaw: {raw}");
                return Ok(IllustrationResult::empty());
            }
        };
        self.execute_illustrator_output(parsed, &request)
    }
}
