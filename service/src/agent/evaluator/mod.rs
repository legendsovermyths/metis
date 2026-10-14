pub mod tools;

use async_trait::async_trait;

use crate::{
    agent::{
        evaluator::tools::{ConcludeQuaestioTool, FetchArcMaterialTool},
        tutor::tools::ReadTutorNotesTool,
        Agent, AgentResponse,
    },
    app::{
        dialogue::{Dialogue, DialogueReference},
        events::EventHistory,
        journey::artifact,
        AppContext,
    },
    db::repo::{dialogue_events::DialogueEventsRepo, Repository},
    error::{MetisError, Result},
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMChatClient,
        tool::Tool,
    },
    prompts::get_prompt_provider,
};

pub struct Evaluator<'a> {
    client: Box<dyn LLMChatClient + 'a>,
    context: &'a AppContext,
}

impl<'a> Evaluator<'a> {
    pub fn new(context: &'a AppContext) -> Self {
        let mut client = LLMClientFactory::get_chat_client(ClientType::OpenAiSol, context);
        for tool in Self::tools() {
            client.add_tool(tool);
        }
        Self { client, context }
    }

    fn tools() -> Vec<Box<dyn Tool>> {
        vec![
            Box::new(ReadTutorNotesTool),
            Box::new(FetchArcMaterialTool),
            Box::new(ConcludeQuaestioTool),
        ]
    }

    async fn build_system_prompt(&self, dialogue_id: i64) -> Result<String> {
        let dialogue = Repository::<Dialogue>::find_by_id(&dialogue_id)?;
        let dialogue = dialogue.read();

        let DialogueReference::Journey {
            journey_id,
            arc_idx,
            ..
        } = dialogue.reference
        else {
            return Err(MetisError::InternalDataError(format!(
                "evaluator requires a journey question dialogue, got {}",
                dialogue_id
            )));
        };

        let artifact = Repository::<artifact::JourneyArtifacts>::find_by_id(&journey_id)?;
        let artifact = artifact.read();
        let arc_title = artifact
            .get_arc(arc_idx)
            .ok_or(MetisError::InternalDataError(
                "Referenced arc does not exist".to_string(),
            ))?
            .arc_title
            .clone();

        Ok(get_prompt_provider().get_evaluator_system_prompt(
            &artifact.chapter_title,
            &arc_title,
            &dialogue.content,
        ))
    }
}

#[async_trait]
impl<'a> Agent for Evaluator<'a> {
    async fn generate(&mut self, message: Option<String>) -> Result<AgentResponse> {
        let message = message.ok_or_else(|| {
            MetisError::AgentError("Message is required for evaluator agent".to_string())
        })?;

        let dialogue_id = {
            let chat = self.context.chat.lock().await;
            chat.dialogue_id.ok_or(MetisError::AppContextError(
                "App context doesn't contain a dialogue id for evaluator".to_string(),
            ))?
        };

        let history = DialogueEventsRepo::get_for_dialogue(dialogue_id)?;
        let pre_count = history.events.len();

        let prompt = self.build_system_prompt(dialogue_id).await?;
        self.client.set_system_prompt(prompt);
        self.client.set_event_history(history);

        let response = self.client.generate(message).await?.text();

        let full = self.client.get_event_history();
        let new_events: Vec<_> = full.events.iter().skip(pre_count).cloned().collect();
        let dialogue = Repository::<Dialogue>::find_by_id(&dialogue_id)?;
        let dialogue = dialogue.read();
        DialogueEventsRepo::insert_events(dialogue.reference.parent_id(), dialogue_id, &new_events)?;
        AgentResponse::with(response)
    }

    async fn get_event_history(&mut self) -> EventHistory {
        self.client.get_event_history()
    }
    async fn set_event_history(&mut self, _history: EventHistory) {}
}
