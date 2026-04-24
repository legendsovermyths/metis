pub mod annotator;
pub mod animator;
pub mod illustrator;

use async_trait::async_trait;
use serde::Deserialize;

use crate::{
    agent::{
        narrator::{animator::Animator, annotator::Annotator, illustrator::Illustrator},
        Agent, AgentResponse,
    },
    app::{
        journey::{
            blackboard::{Blackboard, BlackboardInstructions, ElementDescriptor, Segment},
            dialogue::Dialogue,
        },
        AppContext,
    },
    db::repo::appdata::AppDataRepo,
    error::{MetisError, Result},
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMClient,
    },
    logs::EventHistory,
    prompts::get_prompt_provider,
    utils::{
        format::{fix_json_escapes, strip_json_block},
        narrator::load_topic_content,
    },
};

const DIALOGUE_CONTEXT_SIZE: usize = 10;

#[derive(Deserialize)]
pub struct NarratorOutput {
    pub dialogue: String,
    pub topic_complete: bool,
    pub blackboard_instructions: BlackboardInstructions,
}

pub struct Narrator<'a> {
    client: Box<dyn LLMClient>,
    context: &'a AppContext,
    illustrator: Illustrator,
    annotator: Annotator,
    animator: Animator,
}

impl<'a> Narrator<'a> {
    pub fn new(context: &'a AppContext) -> Self {
        let client = LLMClientFactory::get_client(ClientType::GeminiPro);
        let illustrator = Illustrator::with();
        let annotator = Annotator::with();
        let animator = Animator::with();
        Self {
            client,
            context,
            illustrator,
            annotator,
            animator,
        }
    }
}

#[async_trait]
impl<'a> Agent for Narrator<'a> {
    async fn generate(&mut self, _message: Option<String>) -> Result<AgentResponse> {
        let mut artifacts_guard = self
            .context
            .teaching
            .lock()
            .await
            .artifacts
            .clone()
            .ok_or(MetisError::AgentError("No teaching state set".into()))?;
        let artifacts = artifacts_guard.read();
        let (arc, topic, blackboard) = artifacts.get_current_state().ok_or(
            MetisError::AgentError("Cannot generate dialgoue for finished artifact".into()),
        )?;

        let arc_json =
            serde_json::to_string_pretty(arc).map_err(|e| MetisError::JsonError(e.to_string()))?;

        let recent = artifacts.recent_dialogues(DIALOGUE_CONTEXT_SIZE);
        let dialogue_so_far = if recent.is_empty() {
            "(No dialogue yet for this arc — this is the first chunk.)".to_string()
        } else {
            recent
                .iter()
                .map(|dialogue| dialogue.content.clone())
                .collect::<Vec<String>>()
                .join("\n\n---\n\n")
        };

        let profile = AppDataRepo::get("user_profile")?.unwrap_or_default();

        let reference_material = load_topic_content(&artifacts.chapter_dir, &topic.name);

        let prompt = get_prompt_provider().get_narrator_prompt(
            &profile,
            &arc_json,
            &dialogue_so_far,
            &reference_material,
            &blackboard.description,
        );

        self.client.set_system_prompt(prompt);
        self.client.set_json_mode(true);
        let response = self
            .client
            .generate("Generate the next dialogue chunk.".to_string())
            .await?;

        let raw = response.text();
        let json_str = strip_json_block(&raw);
        let fixed = fix_json_escapes(json_str);
        let parsed: NarratorOutput = serde_json::from_str(&fixed)?;
        let illustration = self
            .illustrator
            .from(&parsed, &blackboard, &artifacts, &topic)
            .await?;

        let instruction = match &parsed.blackboard_instructions {
            BlackboardInstructions::Detailed(s) => s.clone(),
            _ => String::new(),
        };

        let (elements, segments) = self
            .enrich(
                &illustration.blackboard,
                illustration.source_code.as_deref(),
                illustration.library.as_deref(),
                &instruction,
                &parsed.dialogue,
            )
            .await;

        let dialogue = Dialogue::build(
            &artifacts,
            parsed.dialogue,
            illustration.blackboard,
            parsed.topic_complete,
        );
        {
            let mut artifacts = artifacts_guard.write();
            artifacts.push_dialogue(dialogue.clone(), parsed.topic_complete);
        }
        self.context.teaching.lock().await.artifacts = Some(artifacts_guard);

        Ok(AgentResponse::animated_dialogue(dialogue, elements, segments)?)
    }

    async fn get_event_history(&mut self) -> EventHistory {
        EventHistory::new()
    }
}

impl<'a> Narrator<'a> {
    async fn enrich(
        &mut self,
        blackboard: &Blackboard,
        source_code: Option<&str>,
        _library: Option<&str>,
        instruction: &str,
        dialogue: &str,
    ) -> (Vec<ElementDescriptor>, Vec<Segment>) {
        let Some(svg_path) = blackboard.image_url.as_deref() else {
            return (Vec::new(), Vec::new());
        };
        let Some(source_code) = source_code else {
            return (Vec::new(), Vec::new());
        };

        let elements = match self
            .annotator
            .annotate(svg_path, source_code, instruction, dialogue)
            .await
        {
            Ok(result) => result.elements,
            Err(e) => {
                log::error!("[narrator] annotator failed: {e}");
                Vec::new()
            }
        };

        let segments = match self.animator.animate(dialogue, &elements).await {
            Ok(s) => s,
            Err(e) => {
                log::error!("[narrator] animator failed: {e}");
                vec![Segment {
                    text: dialogue.to_string(),
                    reveals: Vec::new(),
                    focus: Vec::new(),
                }]
            }
        };

        (elements, segments)
    }
}
