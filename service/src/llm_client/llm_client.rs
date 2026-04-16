use crate::{error::Result, llm_client::tool::Tool, logs::EventHistory};
use async_trait::async_trait;


#[async_trait]
pub trait LLMClient: Send + Sync{
    async fn generate(&self, prompt: String) -> Result<LLMResponse>;
    fn set_system_prompt(&mut self, prompt: String);
}

#[async_trait]
pub trait LLMChatClient: Send + Sync {
    async fn generate(&mut self, message: String) -> Result<LLMResponse>;
    fn set_system_prompt(&mut self, prompt: String);
    fn add_tool(&mut self, tool: Box<dyn Tool>);
    fn get_event_history(&self)->EventHistory;
}

pub struct LLMResponse {
    response: String,
}

impl<T: ToString> From<T> for LLMResponse {
    fn from(value: T) -> Self {
        Self {
            response: value.to_string(),
        }
    }
}

impl LLMResponse {
    pub fn text(&self) -> String {
        self.response.clone()
    }
}

