use std::hash::{Hash, Hasher};

use crate::{
    error::Result,
    llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient},
    prompts::get_prompt_provider,
};

pub fn short_hash(text: &str) -> String {
    let mut hasher = std::hash::DefaultHasher::new();
    text.hash(&mut hasher);
    format!("{:08x}", hasher.finish() as u32)
}

pub async fn convert_text_to_markdown(text: &str) -> Result<String> {
    let mut convertor_client = GeminiClient::new();

    let system_prompt = get_prompt_provider().get_text_to_markdown();
    convertor_client.set_system_prompt(system_prompt.to_string());

    let content = convertor_client.generate(text.to_string()).await?.text();

    Ok(content)
}
