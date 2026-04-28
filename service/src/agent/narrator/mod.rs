pub mod curator;
pub mod illustrator;

use async_trait::async_trait;
use serde::Deserialize;

use crate::{
    agent::{
        narrator::{
            curator::{Curator, CuratorRequest},
            illustrator::{IllustrationRequest, IllustrationResult, Illustrator},
        },
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

pub struct NarrateRequest<'a> {
    pub profile: &'a str,
    pub arc: &'a str,
    pub dialogue_so_far: &'a str,
    pub reference_material: &'a str,
    pub blackboard_state: &'a str,
}

pub struct Narrator<'a> {
    client: Box<dyn LLMClient>,
    context: &'a AppContext,
    illustrator: Illustrator,
    curator: Curator,
}

impl<'a> Narrator<'a> {
    pub fn new(context: &'a AppContext) -> Self {
        let mut client = LLMClientFactory::get_client(ClientType::GeminiPro);
        client.set_json_mode(true);
        let illustrator = Illustrator::with();
        let curator = Curator::with();
        Self {
            client,
            context,
            illustrator,
            curator,
        }
    }

    pub async fn narrate(&mut self, request: NarrateRequest<'_>) -> Result<NarratorOutput> {
        let prompt = get_prompt_provider().get_narrator_prompt(
            request.profile,
            request.arc,
            request.dialogue_so_far,
            request.reference_material,
            request.blackboard_state,
        );
        self.client.set_system_prompt(prompt);

        let response = self
            .client
            .generate("Generate the next dialogue chunk.".to_string())
            .await?;

        let raw = response.text();
        let json_str = strip_json_block(&raw);
        let fixed = fix_json_escapes(json_str);
        Ok(serde_json::from_str(&fixed)?)
    }

    async fn illustrate(
        &mut self,
        narration: &NarratorOutput,
        dialogue: &str,
        previous: &Blackboard,
        chapter_dir: &str,
        topic: &str,
        parts: &[ElementDescriptor],
    ) -> Result<IllustrationResult> {
        let instruction = match &narration.blackboard_instructions {
            BlackboardInstructions::Clear => return Ok(IllustrationResult::empty()),
            BlackboardInstructions::Detailed(s) => s.as_str(),
        };
        self.illustrator
            .illustrate(IllustrationRequest {
                dialogue,
                instruction,
                previous_instruction: &previous.description,
                chapter_dir,
                topic,
                parts,
            })
            .await
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
            MetisError::AgentError("Cannot generate dialogue for finished artifact".into()),
        )?;

        let arc_json =
            serde_json::to_string_pretty(arc).map_err(|e| MetisError::JsonError(e.to_string()))?;
        let dialogue_so_far = build_dialogue_so_far(&artifacts);
        let profile = AppDataRepo::get("user_profile")?.unwrap_or_default();
        let reference_material = load_topic_content(&artifacts.chapter_dir, &topic.name);

        let narration = self
            .narrate(NarrateRequest {
                profile: &profile,
                arc: &arc_json,
                dialogue_so_far: &dialogue_so_far,
                reference_material: &reference_material,
                blackboard_state: &blackboard.description,
            })
            .await?;

        let instruction = match &narration.blackboard_instructions {
            BlackboardInstructions::Detailed(s) => s.as_str(),
            BlackboardInstructions::Clear => "",
        };

        let curated = self
            .curator
            .curate(CuratorRequest {
                dialogue: &narration.dialogue,
                instruction,
                topic: &topic.name,
                previous_image_url: blackboard.image_url.as_deref(),
            })
            .await?;

        let illustration = self
            .illustrate(
                &narration,
                &curated.dialogue,
                &blackboard,
                &artifacts.chapter_dir,
                &topic.name,
                &curated.parts,
            )
            .await?;

        let (final_parts, final_segments) =
            finalize_parts_and_segments(curated.parts, curated.segments, &illustration.blackboard);

        let dialogue = Dialogue::build(
            &artifacts,
            curated.dialogue,
            illustration.blackboard,
            narration.topic_complete,
        );
        {
            let mut artifacts = artifacts_guard.write();
            artifacts.push_dialogue(dialogue.clone(), narration.topic_complete);
        }
        self.context.teaching.lock().await.artifacts = Some(artifacts_guard);

        Ok(AgentResponse::animated_dialogue(
            dialogue,
            final_parts,
            final_segments,
        )?)
    }

    async fn get_event_history(&mut self) -> EventHistory {
        EventHistory::new()
    }
}

fn build_dialogue_so_far(artifacts: &crate::app::journey::artifact::JourneyArtifacts) -> String {
    let recent = artifacts.recent_dialogues(DIALOGUE_CONTEXT_SIZE);
    if recent.is_empty() {
        "(No dialogue yet for this arc — this is the first chunk.)".to_string()
    } else {
        recent
            .iter()
            .map(|d| d.content.clone())
            .collect::<Vec<String>>()
            .join("\n\n---\n\n")
    }
}

/// If no figure was produced (Clear or illustrator failure), strip parts and replace
/// segments with a single un-animated segment so the frontend has nothing to address.
fn finalize_parts_and_segments(
    parts: Vec<ElementDescriptor>,
    segments: Vec<Segment>,
    blackboard: &Blackboard,
) -> (Vec<ElementDescriptor>, Vec<Segment>) {
    if blackboard.image_url.is_some() {
        return (parts, segments);
    }
    let joined_text = segments
        .iter()
        .map(|s| s.text.as_str())
        .collect::<Vec<_>>()
        .join("");
    let fallback = vec![Segment {
        text: joined_text,
        actions: Vec::new(),
    }];
    (Vec::new(), fallback)
}
