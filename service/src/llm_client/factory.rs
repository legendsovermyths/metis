use crate::{
    app::AppContext,
    llm_client::{
        clients::{
            claude::{chat::ClaudeChat, client::ClaudeClient},
            gemini::{chat::GeminiChat, client::GeminiClient},
            openai::{chat::OpenAiChat, client::OpenAiClient},
        },
        llm_client::{LLMChatClient, LLMClient},
    },
};

pub struct LLMClientFactory;

const FLASH: &str = "gemini-3.5-flash";
const PRO: &str = "gemini-3.1-pro-preview";
const CLAUDE_OPUS: &str = "us.anthropic.claude-opus-5";
const OPENAI_TERRA: &str = "gpt-5.6-terra";
const OPENAI_SOL: &str = "gpt-5.6-sol";
const OPENAI_ASTRA: &str = "gpt-6-astra";

pub enum ClientType {
    GeminiFlash,
    GeminiPro,
    ClaudeOpus,
    OpenAiTerra,
    OpenAiSol,
    OpenAiAstra,
}


impl LLMClientFactory {
    pub fn get_client(client_type: ClientType) -> Box<dyn LLMClient> {
        match client_type {
            ClientType::GeminiFlash => Box::new(GeminiClient::with_model(FLASH)),
            ClientType::GeminiPro => Box::new(GeminiClient::with_model(PRO)),
            ClientType::ClaudeOpus => Box::new(ClaudeClient::with_model(CLAUDE_OPUS)),
            ClientType::OpenAiTerra => Box::new(OpenAiClient::with_model(OPENAI_TERRA)),
            ClientType::OpenAiSol => Box::new(OpenAiClient::with_model(OPENAI_SOL)),
            ClientType::OpenAiAstra => Box::new(OpenAiClient::with_model(OPENAI_ASTRA)),
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
            ClientType::OpenAiTerra => Box::new(OpenAiChat::with_model(OPENAI_TERRA, context)),
            ClientType::OpenAiSol => Box::new(OpenAiChat::with_model(OPENAI_SOL, context)),
            ClientType::OpenAiAstra => Box::new(OpenAiChat::with_model(OPENAI_ASTRA, context)),
        }
    }
}
