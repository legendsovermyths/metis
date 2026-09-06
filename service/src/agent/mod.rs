use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{
    app::events::EventHistory,
    error::Result,
};

pub mod director;
pub mod evaluator;
pub mod handler;
pub mod onboarder;
pub mod tutor;

#[async_trait]
pub trait Agent: Send + Sync {
    async fn generate(&mut self, message: Option<String>) -> Result<AgentResponse>;
    async fn get_event_history(&mut self) -> EventHistory;
    async fn set_event_history(&mut self, history: EventHistory);
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
}

#[derive(Deserialize, Serialize, Clone)]
pub enum AgentResponseInstruction {
    ChapterTitle(String),
    ArtifactGenerationInstructions(String),
    None,
}
