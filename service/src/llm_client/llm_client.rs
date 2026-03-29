use crate::{error::Result, llm_client::tool::Tool};
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
}

pub struct LLMResponse {
    response: String,
}

impl LLMResponse {
    pub fn from(str: impl ToString) -> Self {
        let str: String = str.to_string();
        Self { response: str }
    }
    pub fn text(&self) -> String {
        self.response.clone()
    }
}

