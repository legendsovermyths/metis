use async_trait::async_trait;
use serde::Serialize;
use serde_json::Value;

use crate::{app::journey::dialogue::Dialogue, error::Result, logs::EventHistory};

pub mod advisor;
pub mod handler;
pub mod narrator;
pub mod onboarder;

#[async_trait]
pub trait Agent: Send + Sync {
    async fn generate(&mut self, message: Option<String>) -> Result<AgentResponse>;
    async fn get_event_history(&mut self) -> EventHistory;
}

#[derive(Serialize)]
struct ChatMessage {
    message: String,
}

impl ChatMessage {
    fn new(message: String) -> Self {
        ChatMessage { message }
    }
}

#[derive(Serialize)]
pub struct AgentResponse {
    pub content: Value,
    pub message_type: MessageType,
}

#[derive(Serialize)]
pub enum MessageType {
    Chat,
    Dialogue,
}

impl AgentResponse {
    pub fn with(message: String) -> Result<Self> {
        Ok(Self {
            content: serde_json::to_value(ChatMessage::new(message))?,
            message_type: MessageType::Chat,
        })
    }

    pub fn dialogue(dialogue: Dialogue) -> Result<Self> {
        Ok(Self {
            content: serde_json::to_value(dialogue)?,
            message_type: MessageType::Dialogue,
        })
    }
}
