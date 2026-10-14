use serde::Deserialize;

use crate::{
    error::{MetisError, Result},
    llm_client::factory::{ClientType, LLMClientFactory},
    prompts::get_prompt_provider,
    utils::format::sanitize_json,
};

#[derive(Deserialize)]
struct TranscriptOutput {
    transcript: String,
}

pub async fn transcribe(content: &str) -> Result<String> {
    let mut client = LLMClientFactory::get_client(ClientType::GeminiFlash);
    client.set_system_prompt(get_prompt_provider().get_content_to_transcript_prompt());
    client.set_json_mode(true);
    let response = client
        .generate(format!(
            "Convert this segment to a spoken transcript:\n\n{content}"
        ))
        .await?;
    let sanitized = sanitize_json(&response.text());
    let output: TranscriptOutput =
        serde_json::from_str(&sanitized).map_err(|e| MetisError::JsonError(e.to_string()))?;
    Ok(output.transcript)
}
