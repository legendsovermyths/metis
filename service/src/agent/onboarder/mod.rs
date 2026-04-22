pub mod tools;

use async_trait::async_trait;

use crate::{
    agent::{
        onboarder::tools::{GetNotesTool, SetDoneTool, SetNotesTool},
        Agent, AgentResponse,
    },
    app::AppContext,
    error::Result,
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMChatClient,
        tool::Tool,
    },
    prompts::get_prompt_provider,
};

pub struct Onboarder<'a> {
    client: Box<dyn LLMChatClient + 'a>,
}

impl<'a> Onboarder<'a> {
    pub fn new(context: &'a AppContext) -> Self {
        let mut client = LLMClientFactory::get_chat_client(ClientType::GeminiFlash, context);
        for tool in Self::tools() {
            client.add_tool(tool);
        }
        client.set_system_prompt(get_prompt_provider().get_onboarder_system_prompt());
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

#[async_trait]
impl<'a> Agent for Onboarder<'a> {
    async fn generate(&mut self, message: Option<String>) -> Result<AgentResponse> {
        if let Some(message) = message {
            let response = self.client.generate(message).await?.text();
            return Ok(AgentResponse::with(response)?);
        }
        return Err(crate::error::MetisError::AgentError(
            "Message is required for onboarding agent".to_string(),
        ));
    }
    async fn get_event_history(&mut self) -> crate::logs::EventHistory {
        self.client.get_event_history()
    }
}
