pub mod tools;

use std::sync::{Arc, Mutex};

use async_trait::async_trait;

use crate::{
    agent::{
        advisor::tools::{
            GetAvailableBooksTool, GetBookInfoTool, GetNotesTool, GetStudentProfileTool,
            SetChapterTool, SetDoneTool, SetNotesTool,
        },
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

pub struct Advisor {
    client: Arc<tokio::sync::Mutex<dyn LLMChatClient>>,
}

impl Advisor {
    pub fn new(context: Arc<Mutex<AppContext>>) -> Self {
        let client = LLMClientFactory::get_chat_client(ClientType::GEMINI, context);
        let mut guard = client.blocking_lock();
        let tools = Self::tools();
        for tool in tools {
            guard.add_tool(tool);
        }
        guard.set_system_prompt(get_prompt_provider().get_advisor_system_prompt());
        drop(guard);
        Self { client }
    }

    fn tools() -> Vec<Box<dyn Tool>> {
        vec![
            Box::new(GetStudentProfileTool),
            Box::new(GetAvailableBooksTool),
            Box::new(GetBookInfoTool),
            Box::new(SetChapterTool),
            Box::new(SetNotesTool),
            Box::new(GetNotesTool),
            Box::new(SetDoneTool),
        ]
    }
}

impl Agent for Advisor {
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
