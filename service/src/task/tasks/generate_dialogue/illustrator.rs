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
const MAX_RETRIES: usize = 5;

#[derive(Deserialize)]
pub struct IllustratorOutput {
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

struct RenderFailure {
    library: String,
    code: String,
    error: String,
}

impl<'a> Illustrator {
    pub fn new() -> Self {
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

    fn try_render(
        &self,
        output: IllustratorOutput,
        request: &IllustrationRequest,
    ) -> std::result::Result<IllustrationResult, RenderFailure> {
        let output_path = match self.get_output_path(request) {
            Ok(p) => p,
            Err(e) => {
                return Err(RenderFailure {
                    library: output.library,
                    code: output.code,
                    error: e.to_string(),
                });
            }
        };
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
            Ok(()) if Path::new(&output_path).exists() => {
                log::info!("[illustrator] figure saved to {output_path}");
                Ok(IllustrationResult {
                    blackboard: Blackboard::new(request.instruction.into(), Some(output_path)),
                    source_code: Some(executed_code),
                    library: Some(library),
                })
            }
            Ok(()) => {
                log::error!("[illustrator] ran but no file at {output_path}");
                Err(RenderFailure {
                    library,
                    code: executed_code,
                    error: format!("execution succeeded but no file at {output_path}"),
                })
            }
            Err(e) => {
                log::error!("[illustrator] execution failed: {e}");
                Err(RenderFailure {
                    library,
                    code: executed_code,
                    error: e.to_string(),
                })
            }
        }
    }

    pub async fn illustrate(
        &mut self,
        request: IllustrationRequest<'a>,
    ) -> Result<IllustrationResult> {
        self.client.set_system_prompt(self.prepare_prompt(&request));

        let mut user_message = "Produce the figure code.".to_string();
        let mut last_failure: Option<RenderFailure> = None;

        for attempt in 0..=MAX_RETRIES {
            if attempt > 0 {
                log::info!(
                    "[illustrator] retry {attempt}/{MAX_RETRIES} after previous render failure"
                );
            }

            let response = self.client.generate(user_message.clone()).await?;
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

            match self.try_render(parsed, &request) {
                Ok(result) => return Ok(result),
                Err(failure) => {
                    user_message = Illustrator::build_retry_message(&failure);
                    last_failure = Some(failure);
                }
            }
        }

        if let Some(failure) = last_failure {
            log::error!(
                "[illustrator] giving up after {MAX_RETRIES} retries; last error: {}",
                failure.error
            );
        }
        Ok(IllustrationResult::empty())
    }
    fn build_retry_message(failure: &RenderFailure) -> String {
        format!(
        "Your previous {library} attempt failed when executed. Read the error, fix the issue, and respond with a corrected JSON block (same schema). Do not repeat the same mistake.\n\n\
         ## Previous code\n\
         ```{library}\n{code}\n```\n\n\
         ## Execution error\n\
         ```\n{error}\n```\n\n\
         Produce the corrected figure code now.",
        library = failure.library,
        code = failure.code,
        error = failure.error,
    )
    }
}
