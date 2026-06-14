use async_trait::async_trait;

use crate::{
    agent::{
        director::tools::{
            CreateExplainerTool, CreateJourneyTool, GetAllResourcesTool, GetResourceContentTool,
            IngestResourceTool,
        },
        Agent, AgentResponse,
    },
    app::AppContext,
    error::Result,
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMChatClient,
        tool::Tool,
    },
    logs::EventHistory,
    prompts::get_prompt_provider,
};

pub mod tools;

pub struct Director<'a> {
    client: Box<dyn LLMChatClient + 'a>,
}

impl<'a> Director<'a> {
    pub fn new(context: &'a AppContext) -> Self {
        let mut client = LLMClientFactory::get_chat_client(ClientType::GeminiPro, context);
        for tool in Self::tools() {
            client.add_tool(tool);
        }
        client.set_system_prompt(get_prompt_provider().get_director_system_prompt());
        Self { client }
    }

    fn tools() -> Vec<Box<dyn Tool>> {
        vec![
            Box::new(IngestResourceTool),
            Box::new(GetAllResourcesTool),
            Box::new(GetResourceContentTool),
            Box::new(CreateJourneyTool),
            Box::new(CreateExplainerTool),
        ]
    }
}

#[async_trait]
impl<'a> Agent for Director<'a> {
    async fn generate(&mut self, message: Option<String>) -> Result<AgentResponse> {
        if let Some(message) = message {
            let response = self.client.generate(message).await?.text();
            return Ok(AgentResponse::with(response)?);
        }
        Err(crate::error::MetisError::AgentError(
            "Message is required for the director agent".to_string(),
        ))
    }
    async fn get_event_history(&mut self) -> EventHistory {
        self.client.get_event_history()
    }
}
