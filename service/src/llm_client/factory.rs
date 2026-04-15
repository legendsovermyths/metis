use std::sync::{Arc, Mutex};

use crate::{
    app::AppContext,
    llm_client::{
        clients::gemini::{chat::GeminiChat, client::GeminiClient},
        llm_client::{LLMChatClient, LLMClient},
    },
};

pub struct LLMClientFactory;

const FLASH: &str = "gemini-3-flash-preview";
const PRO: &str = "gemini-3.1-pro-preview";

pub enum ClientType {
    GeminiFlash,
    GeminiPro,
}

impl LLMClientFactory {
    pub fn get_client(client_type: ClientType) -> Arc<tokio::sync::Mutex<dyn LLMClient>> {
        match client_type {
            ClientType::GeminiFlash => {
                Arc::new(tokio::sync::Mutex::new(GeminiClient::with_model(FLASH)))
            }
            ClientType::GeminiPro => {
                Arc::new(tokio::sync::Mutex::new(GeminiClient::with_model(PRO)))
            }
        }
    }

    pub fn get_chat_client(
        client_type: ClientType,
        context: Arc<Mutex<AppContext>>,
    ) -> Arc<tokio::sync::Mutex<dyn LLMChatClient>> {
        match client_type {
            ClientType::GeminiFlash => {
                Arc::new(tokio::sync::Mutex::new(GeminiChat::with_model(FLASH, context)))
            }
            ClientType::GeminiPro => {
                Arc::new(tokio::sync::Mutex::new(GeminiChat::with_model(PRO, context)))
            }
        }
    }
}
