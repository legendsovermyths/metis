use std::{
    fs,
    path::Path,
};

use serde::Deserialize;

use crate::{
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
    utils::{
        cmd::{execute_latex, execute_python},
        format::{fix_json_escapes, fix_mathtext_shorthands, strip_json_block},
    },
};

use super::NarratorOutput;

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

pub struct Illustrator {
    client: Box<dyn LLMClient>,
}

impl Illustrator {
    pub fn with() -> Self {
        let client = LLMClientFactory::get_client(ClientType::GeminiPro);
        Self { client }
    }

    pub async fn from(
        &mut self,
        narration: &NarratorOutput,
        previous: &Blackboard,
        artifact: &JourneyArtifacts,
        topic: &ArcTopic,
    ) -> Result<IllustrationResult> {
        match &narration.blackboard_instructions {
            BlackboardInstructions::Clear => Ok(IllustrationResult {
                blackboard: Blackboard::empty(),
                source_code: None,
                library: None,
            }),
            BlackboardInstructions::Persist => Ok(IllustrationResult {
                blackboard: previous.clone(),
                source_code: None,
                library: None,
            }),
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

                self.client.set_system_prompt(prompt);
                self.client.set_json_mode(true);
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
                        return Ok(IllustrationResult {
                            blackboard: Blackboard::empty(),
                            source_code: None,
                            library: None,
                        });
                    }
                };

                let library = parsed.library.clone();

                let executed_code: String;
                let exec_result = match parsed.library.as_str() {
                    "tikz" => {
                        log::info!("[illustrator] rendering TikZ figure");
                        executed_code = parsed.code.clone();
                        execute_latex(&parsed.code, &output_path)
                    }
                    _ => {
                        let code = fix_mathtext_shorthands(&parsed.code)
                            .replace("{output_path}", &output_path);
                        executed_code = code.clone();
                        execute_python(&code)
                    }
                };

                match exec_result {
                    Ok(()) => {
                        if Path::new(&output_path).exists() {
                            log::info!("[illustrator] figure saved to {output_path}");
                            Ok(IllustrationResult {
                                blackboard: Blackboard::new(instructions.into(), Some(output_path)),
                                source_code: Some(executed_code),
                                library: Some(library),
                            })
                        } else {
                            log::error!("[illustrator] ran but no file at {output_path}");
                            Ok(IllustrationResult {
                                blackboard: Blackboard::empty(),
                                source_code: None,
                                library: None,
                            })
                        }
                    }
                    Err(e) => {
                        log::error!("[illustrator] execution failed: {e}");
                        Ok(IllustrationResult {
                            blackboard: Blackboard::empty(),
                            source_code: None,
                            library: None,
                        })
                    }
                }
            }
        }
    }
}
