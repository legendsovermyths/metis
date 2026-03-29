use std::{cell::RefCell, rc::Rc, sync::{Arc, Mutex}};

use crate::{
    app::AppContext,
    llm_client::{
        clients::gemini::{chat::GeminiChat, client::GeminiClient},
        llm_client::{LLMChatClient, LLMClient},
    },
};

pub struct LLMClientFactory;

pub enum ClientType {
    GEMINI,
}

impl<'a> LLMClientFactory {
    pub fn get_client(client_type: ClientType) -> Rc<RefCell<dyn LLMClient>> {
        match client_type {
            ClientType::GEMINI => Rc::new(RefCell::new(GeminiClient::new())),
        }
    }

    pub fn get_chat_client(
        client_type: ClientType,
        context: Arc<Mutex<AppContext>>,
    ) -> Arc<tokio::sync::Mutex<dyn LLMChatClient>> {
        match client_type {
            ClientType::GEMINI => Arc::new(tokio::sync::Mutex::new(GeminiChat::new(context))),
        }
    }
}
