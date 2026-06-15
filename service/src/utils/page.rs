use crate::{
    error::Result,
    llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient},
};

const SMALL_PAGE_THRESHOLD: usize = 1000;

const PAGE_CHECK_PROMPT: &str = "You judge whether text extracted from a web page is the page's real content or a useless capture (a bot-check/CAPTCHA wall, a security-verification interstitial, an error or access-denied page, or essentially empty). Reply with exactly USABLE if it is real content, or UNUSABLE otherwise. Reply with one word only.";

pub async fn is_usable_page(markdown: &str) -> Result<bool> {
    if markdown.trim().len() >= SMALL_PAGE_THRESHOLD {
        return Ok(true);
    }
    let mut client = GeminiClient::with_model("gemini-3.1-flash-lite");
    client.set_system_prompt(PAGE_CHECK_PROMPT.to_string());
    let verdict = client.generate(markdown.to_string()).await?.text();
    Ok(verdict.trim().to_uppercase().starts_with("USABLE"))
}
