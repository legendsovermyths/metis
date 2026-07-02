use crate::{
    error::Result,
    llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient},
    prompts::{get_prompt_provider, PromptProvider},
};

pub async fn convert_image_to_markdown(image_path: &str, mime: &str) -> Result<String> {
    let mut convertor_client = GeminiClient::new();
    convertor_client.set_file_mime_type(mime);
    let system_prompt = get_prompt_provider().get_image_to_markdown();

    convertor_client.set_system_prompt(system_prompt.to_string());

    let content = convertor_client
        .generate_with_file(String::from("Convert this file to markdown"), image_path)
        .await?
        .text();

    Ok(content)
}
