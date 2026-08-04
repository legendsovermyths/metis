use std::hash::{Hash, Hasher};

use crate::{
    error::Result,
    llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient},
    prompts::get_prompt_provider,
    utils::chrome::chrome_convert_html_to_pdf,
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

pub fn text_to_pdf(text: &str) -> Result<String> {
    let escaped = text
        .replace('&', "&amp;")
        .replace('<', "&lt;")
        .replace('>', "&gt;");
    let html = format!(
        "<!DOCTYPE html><html><head><meta charset=\"utf-8\"><style>\
         @page {{ margin: 20mm; }} \
         body {{ font-family: Georgia, 'Times New Roman', serif; font-size: 12pt; line-height: 1.5; color: #111; }} \
         pre {{ white-space: pre-wrap; word-wrap: break-word; font-family: inherit; margin: 0; }}\
         </style></head><body><pre>{}</pre></body></html>",
        escaped
    );
    chrome_convert_html_to_pdf(&html)
}
