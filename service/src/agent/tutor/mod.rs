pub mod tools;

use async_trait::async_trait;

use crate::{
    agent::{
        tutor::tools::{
            FetchMoreDialoguesTool, FetchReferenceMaterialTool, GetCurrentDialogueIdTool,
            ReadTutorNotesTool, SetTutorNotesTool,
        },
        Agent, AgentResponse,
    },
    app::{
        dialogue::{Dialogue, DialogueReference},
        journey::artifact,
        AppContext,
    },
    db::repo::{
        dialogue::DialoguesRepo, dialogue_events::DialogueEventsRepo,
        explanations::ExplanationsRepo, journeys::JourneysRepo,
    },
    error::{MetisError, Result},
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMChatClient,
        tool::Tool,
    },
    logs::EventHistory,
    prompts::get_prompt_provider,
    utils::dialogue::{format_dialogues, get_before_dialogue},
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
            Box::new(GetCurrentDialogueIdTool),
            Box::new(ReadTutorNotesTool),
            Box::new(SetTutorNotesTool),
        ]
    }

    async fn build_system_prompt(&self, dialogue_id: i64) -> Result<String> {
        let dialogue = DialoguesRepo::get_by_id(dialogue_id)?;

        let reference_kind = dialogue.reference.kind();

        match reference_kind {
            crate::app::dialogue::ReferenceKind::Journey => {
                let DialogueReference::Journey {
                    journey_id,
                    arc_idx,
                    topic_idx,
                } = dialogue.reference
                else {
                    return Err(MetisError::InternalDataError(format!(
                        "Reference kind and reference mismatch for dialogue {}",
                        dialogue_id
                    )));
                };
                let artifact = JourneysRepo::get_artifacts(journey_id)?;
                let (arc_title, topic_title) = (
                    artifact
                        .get_arc(arc_idx)
                        .ok_or(MetisError::InternalDataError(
                            "Referenced arc and topic indexes do not exist".to_string(),
                        ))?
                        .arc_title
                        .clone(),
                    artifact
                        .get_topic(arc_idx, topic_idx)
                        .ok_or(MetisError::InternalDataError(
                            "Referenced arc and topic indexes do not exist".to_string(),
                        ))?
                        .name
                        .clone(),
                );

                let last_dialgoues = get_before_dialogue(dialogue_id, 10, true)?;
                let formatted = format_dialogues(&last_dialgoues);

                return Ok(get_prompt_provider().get_tutor_system_prompt(
                    &artifact.chapter_title,
                    &arc_title,
                    &topic_title,
                    &formatted,
                ));
            }
            crate::app::dialogue::ReferenceKind::Explanation => {
                let DialogueReference::Explanation {
                    explanation_id,
                    step_idx,
                } = dialogue.reference
                else {
                    return Err(MetisError::InternalDataError(format!(
                        "Reference kind and reference mismatch for dialogue {}",
                        dialogue_id
                    )));
                };
                let artifact = ExplanationsRepo::get_artifacts(explanation_id)?;
                let step = artifact
                    .get_step(step_idx)
                    .ok_or(MetisError::InternalDataError(
                        "Referenced step index does not exist".to_string(),
                    ))?;

                let last_dialgoues = get_before_dialogue(dialogue_id, 10, true)?;
                let formatted = format_dialogues(&last_dialgoues);

                return Ok(get_prompt_provider().get_explainer_tutor_system_prompt(
                    &artifact.title,
                    &step.name,
                    step.label.as_str(),
                    &step.brief,
                    &formatted,
                ));
            }
            crate::app::dialogue::ReferenceKind::None => {
                return Err(MetisError::InternalDataError(format!(
                    "Dialogue {} has no reference kind",
                    dialogue_id
                )));
            }
        }
    }
}

#[async_trait]
impl<'a> Agent for Tutor<'a> {
    async fn generate(&mut self, message: Option<String>) -> Result<AgentResponse> {
        let message = message.ok_or_else(|| {
            MetisError::AgentError("Message is required for tutor agent".to_string())
        })?;

        let chat = self.context.chat.lock().await;
        let (dialogue_id, fallback_history) = (
            chat.dialogue_id.ok_or(MetisError::AppContextError(
                "App context doesn't contain a dialgoue id for tutor".to_string(),
            ))?,
            chat.event_history.clone(),
        );


        let history = DialogueEventsRepo::get_for_dialogue(dialogue_id)?;
        let pre_count = history.events.len();

        let prompt = self.build_system_prompt(dialogue_id).await?;
        self.client.set_system_prompt(prompt);
        self.client.set_event_history(history);

        let response = self.client.generate(message).await?.text();

        let full = self.client.get_event_history();
        let new_events: Vec<_> = full.events.iter().skip(pre_count).cloned().collect();
        let dialogue = DialoguesRepo::get_by_id(dialogue_id)?;
        DialogueEventsRepo::insert_events(dialogue.reference.parent_id(), dialogue_id, &new_events)?;
        AgentResponse::with(response)
    }

    async fn get_event_history(&mut self) -> EventHistory {
        self.client.get_event_history()
    }
}
