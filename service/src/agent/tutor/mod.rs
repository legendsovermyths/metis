pub mod tools;

use async_trait::async_trait;

use crate::{
    agent::{
        tutor::tools::{
            FetchMoreDialoguesTool, FetchReferenceMaterialTool, ReadTutorNotesTool,
            SetTutorNotesTool,
        },
        Agent, AgentResponse,
    },
    app::{journey::dialogue::Dialogue, AppContext},
    db::repo::{dialogue::DialoguesRepo, dialogue_events::DialogueEventsRepo},
    error::{MetisError, Result},
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMChatClient,
        tool::Tool,
    },
    logs::EventHistory,
    prompts::get_prompt_provider,
    utils::dialogue::format_dialogues,
};

pub struct Tutor<'a> {
    client: Box<dyn LLMChatClient + 'a>,
    context: &'a AppContext,
}

impl<'a> Tutor<'a> {
    pub fn new(context: &'a AppContext) -> Self {
        let mut client = LLMClientFactory::get_chat_client(ClientType::ClaudeOpus, context);
        for tool in Self::tools() {
            client.add_tool(tool);
        }
        Self { client, context }
    }

    fn tools() -> Vec<Box<dyn Tool>> {
        vec![
            Box::new(FetchMoreDialoguesTool),
            Box::new(FetchReferenceMaterialTool),
            Box::new(ReadTutorNotesTool),
            Box::new(SetTutorNotesTool),
        ]
    }

    async fn build_system_prompt(&self, dialogue_id: Option<i64>) -> Result<String> {
        let teaching = self.context.teaching.lock().await;
        let artifacts = teaching
            .artifacts
            .as_ref()
            .ok_or_else(|| MetisError::AgentError("No journey loaded for tutor.".into()))?
            .read()
            .clone();
        drop(teaching);

        let (arc_title, topic_title) = match dialogue_id {
            Some(id) => {
                if let Some(d) = DialoguesRepo::get_by_id(id)? {
                    let arc = artifacts
                        .journey
                        .arcs
                        .get(d.arc_idx)
                        .map(|a| a.arc_title.clone())
                        .unwrap_or_default();
                    let topic = artifacts
                        .journey
                        .arcs
                        .get(d.arc_idx)
                        .and_then(|a| a.topics.get(d.topic_idx))
                        .map(|t| t.name.clone())
                        .unwrap_or_default();
                    (arc, topic)
                } else {
                    (String::new(), String::new())
                }
            }
            None => (String::new(), String::new()),
        };

        let last_dialogues: Vec<Dialogue> = match dialogue_id {
            Some(id) => DialoguesRepo::get_before_dialogue(id, 10, true)?,
            None => Vec::new(),
        };

        let formatted = format_dialogues(&last_dialogues);
        Ok(get_prompt_provider().get_tutor_system_prompt(
            &artifacts.chapter_title,
            &arc_title,
            &topic_title,
            &formatted,
        ))
    }
}

#[async_trait]
impl<'a> Agent for Tutor<'a> {
    async fn generate(&mut self, message: Option<String>) -> Result<AgentResponse> {
        let message = message.ok_or_else(|| {
            MetisError::AgentError("Message is required for tutor agent".to_string())
        })?;

        let (dialogue_id, fallback_history) = {
            let chat = self.context.chat.lock().await;
            (chat.dialogue_id, chat.event_history.clone())
        };

        let history = match dialogue_id {
            Some(id) => DialogueEventsRepo::get_for_dialogue(id)?,
            None => fallback_history,
        };
        let pre_count = history.events.len();

        let prompt = self.build_system_prompt(dialogue_id).await?;
        self.client.set_system_prompt(prompt);
        self.client.set_event_history(history);

        let response = self.client.generate(message).await?.text();

        if let Some(id) = dialogue_id {
            let full = self.client.get_event_history();
            let new_events: Vec<_> = full.events.iter().skip(pre_count).cloned().collect();
            let journey_id = {
                let teaching = self.context.teaching.lock().await;
                teaching.artifacts.as_ref().and_then(|a| a.read().id)
            };
            DialogueEventsRepo::insert_events(journey_id, Some(id), &new_events)?;
        }

        AgentResponse::with(response)
    }

    async fn get_event_history(&mut self) -> EventHistory {
        self.client.get_event_history()
    }
}
