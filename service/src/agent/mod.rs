use serde::Serialize;

use crate::{error::Result, logs::EventHistory};

pub mod advisor;
pub mod handler;
pub mod narrator;
pub mod onboarder;

pub trait Agent: Send + Sync {
    fn generate(&mut self, message: Option<String>) -> Result<AgentResponse>;
    fn get_event_history(&mut self) -> EventHistory;
}

#[derive(Serialize)]
pub struct AgentResponse {
    pub message: String,
    pub message_type: MessageType,
}

#[derive(Serialize)]
pub enum MessageType {
    Chat,
    Dialogue,
}

impl AgentResponse {
    pub fn with(message: String) -> Self {
        Self {
            message,
            message_type: MessageType::Chat,
        }
    }

    pub fn dialogue(message: String) -> Self {
        Self {
            message,
            message_type: MessageType::Dialogue,
        }
    }
}
