//! Single source of truth for which model backs each client. Construct clients
//! through `LLMClientFactory` rather than instantiating provider clients directly.
use crate::{
    app::AppContext,
    llm_client::{
        clients::{
            claude::{chat::ClaudeChat, client::ClaudeClient},
            gemini::{chat::GeminiChat, client::GeminiClient},
            openai::{ReasoningEffort, chat::OpenAiChat, client::OpenAiClient},
        },
        llm_client::{LLMChatClient, LLMClient},
    },
};

pub struct LLMClientFactory;

pub const GEMINI_FLASH: &str = "gemini-3.7-flash";
pub const GEMINI_FLASH_LITE: &str = "gemini-3.1-flash-lite";
pub const GEMINI_PRO: &str = "gemini-4-argon";
pub const GEMINI_TTS: &str = "gemini-3.1-flash-tts-preview";
const CLAUDE_OPUS: &str = "us.anthropic.claude-opus-5";
const OPENAI_TERRA: &str = "gpt-5.6-terra";
const OPENAI_SOL: &str = "gpt-5.6-sol";
const OPENAI_ASTRA: &str = "gpt-6-astra";
/// API default is `medium`; supported: none, low, medium, high, xhigh, max.
const OPENAI_EFFORT: ReasoningEffort = ReasoningEffort::High;

pub enum ClientType {
    GeminiFlash,
    GeminiFlashLite,
    GeminiPro,
    /// Kept for rollback; Bedrock Claude is currently unavailable.
    #[allow(dead_code)]
    ClaudeOpus,
    #[allow(dead_code)]
    OpenAiTerra,
    OpenAiSol,
    #[allow(dead_code)]
    OpenAiAstra,
}

/// Gemini models, for callers that need Gemini-only features (file input, TTS).
pub enum GeminiModel {
    Flash,
    FlashLite,
    Pro,
    Tts,
}

impl GeminiModel {
    fn id(&self) -> &'static str {
        match self {
            GeminiModel::Flash => GEMINI_FLASH,
            GeminiModel::FlashLite => GEMINI_FLASH_LITE,
            GeminiModel::Pro => GEMINI_PRO,
            GeminiModel::Tts => GEMINI_TTS,
        }
    }
}

impl LLMClientFactory {
    pub fn get_client(client_type: ClientType) -> Box<dyn LLMClient> {
        match client_type {
            ClientType::GeminiFlash => Box::new(Self::get_gemini_client(GeminiModel::Flash)),
            ClientType::GeminiFlashLite => {
                Box::new(Self::get_gemini_client(GeminiModel::FlashLite))
            }
            ClientType::GeminiPro => Box::new(Self::get_gemini_client(GeminiModel::Pro)),
            ClientType::ClaudeOpus => Box::new(ClaudeClient::with_model(CLAUDE_OPUS)),
            ClientType::OpenAiTerra => Box::new(OpenAiClient::with_model(OPENAI_TERRA, OPENAI_EFFORT)),
            ClientType::OpenAiSol => Box::new(OpenAiClient::with_model(OPENAI_SOL, OPENAI_EFFORT)),
            ClientType::OpenAiAstra => Box::new(OpenAiClient::with_model(OPENAI_ASTRA, OPENAI_EFFORT)),
        }
    }

    pub fn get_gemini_client(model: GeminiModel) -> GeminiClient {
        GeminiClient::with_model(model.id())
    }

    pub fn get_chat_client<'a>(
        client_type: ClientType,
        context: &'a AppContext,
    ) -> Box<dyn LLMChatClient + 'a> {
        match client_type {
            ClientType::GeminiFlash => Box::new(GeminiChat::with_model(GEMINI_FLASH, context)),
            ClientType::GeminiFlashLite => {
                Box::new(GeminiChat::with_model(GEMINI_FLASH_LITE, context))
            }
            ClientType::GeminiPro => Box::new(GeminiChat::with_model(GEMINI_PRO, context)),
            ClientType::ClaudeOpus => Box::new(ClaudeChat::with_model(CLAUDE_OPUS, context)),
            ClientType::OpenAiTerra => {
                Box::new(OpenAiChat::with_model(OPENAI_TERRA, OPENAI_EFFORT, context))
            }
            ClientType::OpenAiSol => {
                Box::new(OpenAiChat::with_model(OPENAI_SOL, OPENAI_EFFORT, context))
            }
            ClientType::OpenAiAstra => {
                Box::new(OpenAiChat::with_model(OPENAI_ASTRA, OPENAI_EFFORT, context))
            }
        }
    }
}
