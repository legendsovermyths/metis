use std::{
    fs,
    path::{Path, PathBuf},
    sync::{Arc, Mutex, Once},
};

use serde::Deserialize;

use crate::{
    api::request::handler::runtime,
    app::journey::{
        artifact::JourneyArtifacts,
        blackboard::{Blackboard, BlackboardInstructions},
        ArcTopic,
    },
    error::{MetisError, Result},
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMClient,
    },
    prompts::get_prompt_provider,
    utils::{cmd::execute_python, format::{fix_json_escapes, strip_json_block}},
};

use super::NarratorOutput;

#[derive(Deserialize)]
struct IllustratorOutput {
    code: String,
}

pub struct Illustrator {
    client: Arc<tokio::sync::Mutex<dyn LLMClient>>,
}

impl Illustrator {
    pub fn with() -> Self {
        let client = LLMClientFactory::get_client(ClientType::GeminiPro);
        Self { client }
    }

    pub fn from(
        &self,
        narration: &NarratorOutput,
        previous: &Blackboard,
        artifact: &JourneyArtifacts,
        topic: &ArcTopic,
    ) -> Result<Blackboard> {
        match &narration.blackboard_instructions {
            BlackboardInstructions::Clear => Ok(Blackboard::empty()),
            BlackboardInstructions::Persist => Ok(previous.clone()),
            BlackboardInstructions::Detailed(instructions) => {
                let illustrations_dir = Path::new(&artifact.chapter_dir).join("illustrations");
                fs::create_dir_all(&illustrations_dir).map_err(|e| {
                    MetisError::AgentError(format!("Failed to create illustrations dir: {}", e))
                })?;
                let illustrations_dir = fs::canonicalize(&illustrations_dir).map_err(|e| {
                    MetisError::AgentError(format!("Failed to resolve illustrations path: {}", e))
                })?;
                let filename =
                    format!("fig_{}.svg", chrono::Utc::now().format("%Y%m%d_%H%M%S_%3f"));
                let output_path = illustrations_dir.join(&filename);
                let output_path = output_path.to_string_lossy().to_string();

                let prompt = get_prompt_provider().get_blackboard_prompt(
                    &instructions,
                    &topic.name,
                    &narration.dialogue,
                    &previous.description,
                );

                let response = runtime().block_on(async {
                    let mut client = self.client.lock().await;
                    client.set_system_prompt(prompt);
                    client
                        .generate("Produce the figure code.".to_string())
                        .await
                })?;

                let raw = response.text();
                let json_str = strip_json_block(&raw);
                let fixed = fix_json_escapes(json_str);
                let parsed: IllustratorOutput = match serde_json::from_str(&fixed) {
                    Ok(v) => v,
                    Err(e) => {
                        log::error!("[illustrator] failed to parse LLM response: {e}\nRaw: {raw}");
                        return Ok(Blackboard::empty());
                    }
                };

                let code = parsed.code.replace("{output_path}", &output_path);

                match execute_python(&code) {
                    Ok(()) => {
                        if Path::new(&output_path).exists() {
                            log::info!("[illustrator] figure saved to {output_path}");
                            Ok(Blackboard::new(instructions.into(), Some(output_path)))
                        } else {
                            log::error!("[illustrator] python ran but no file at {output_path}");
                            Ok(Blackboard::empty())
                        }
                    }
                    Err(e) => {
                        log::error!("[illustrator] python execution failed: {e}");
                        Ok(Blackboard::empty())
                    }
                }
            }
        }
    }
}
