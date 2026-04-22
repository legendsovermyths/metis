use crate::{
    app::AppContext,
    llm_client::{
        clients::{
            claude::{chat::ClaudeChat, client::ClaudeClient},
            gemini::{chat::GeminiChat, client::GeminiClient},
        },
        llm_client::{LLMChatClient, LLMClient},
    },
};

pub struct LLMClientFactory;

const FLASH: &str = "gemini-3-flash-preview";
const PRO: &str = "gemini-3.1-pro-preview";
const CLAUDE_OPUS: &str = "us.anthropic.claude-opus-4-6-v1";

pub enum ClientType {
    GeminiFlash,
    GeminiPro,
    ClaudeOpus,
}

impl LLMClientFactory {
    pub fn get_client(client_type: ClientType) -> Box<dyn LLMClient> {
        match client_type {
            ClientType::GeminiFlash => Box::new(GeminiClient::with_model(FLASH)),
            ClientType::GeminiPro => Box::new(GeminiClient::with_model(PRO)),
            ClientType::ClaudeOpus => Box::new(ClaudeClient::with_model(CLAUDE_OPUS)),
        }
    }

    pub fn get_chat_client<'a>(
        client_type: ClientType,
        context: &'a AppContext,
    ) -> Box<dyn LLMChatClient + 'a> {
        match client_type {
            ClientType::GeminiFlash => Box::new(GeminiChat::with_model(FLASH, context)),
            ClientType::GeminiPro => Box::new(GeminiChat::with_model(PRO, context)),
            ClientType::ClaudeOpus => Box::new(ClaudeChat::with_model(CLAUDE_OPUS, context)),
        }
    }
}
