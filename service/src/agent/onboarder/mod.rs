pub mod tools;

use std::sync::{Arc, Mutex};

use async_trait::async_trait;

use crate::{
    agent::{
        onboarder::tools::{GetNotesTool, SetDoneTool, SetNotesTool},
        Agent, AgentResponse,
    },
    api::request::handler::runtime,
    app::AppContext,
    error::Result,
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMChatClient,
        tool::Tool,
    },
    prompts::get_prompt_provider,
};

pub struct Onboarder {
    client: Arc<tokio::sync::Mutex<dyn LLMChatClient>>,
}

impl Onboarder {
    pub fn new(context: Arc<Mutex<AppContext>>) -> Self {
        let client = LLMClientFactory::get_chat_client(ClientType::GEMINI, context);
        let mut gaurd = client.blocking_lock();
        let tools = Self::tools();
        for tool in tools {
            gaurd.add_tool(tool);
        }
        gaurd.set_system_prompt(get_prompt_provider().get_onboarder_system_prompt());
        drop(gaurd);
        Self { client }
    }

    fn tools() -> Vec<Box<dyn Tool>> {
        vec![
            Box::new(SetNotesTool),
            Box::new(GetNotesTool),
            Box::new(SetDoneTool),
        ]
    }
}

impl Agent for Onboarder {
    fn generate(&mut self, message: Option<String>) -> Result<AgentResponse> {
        runtime().block_on(async {
            if let Some(message) = message {
                let response = self.client.lock().await.generate(message).await?.text();
                return Ok(AgentResponse::with(response));
            }
            return Err(crate::error::MetisError::AgentError(
                "Message is required for onboarding agent".to_string(),
            ));
        })
    }
}
