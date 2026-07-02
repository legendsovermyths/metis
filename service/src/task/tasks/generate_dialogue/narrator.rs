use serde::Deserialize;

use crate::{
    app::{
        dialogue::{
            blackboard::BlackboardInstructions, Dialogue, DialogueReference, ReferenceKind,
        },
        journey::artifact,
    },
    db::repo::{
        appdata::AppDataRepo, dialogue::DialoguesRepo, explanations::ExplanationsRepo,
        journeys::JourneysRepo,
    },
    error::{MetisError, Result},
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMClient,
    },
    prompts::get_prompt_provider,
    utils::{
        format::sanitize_json,
        narrator::{load_explanation_material, load_topic_content},
    },
};

#[derive(Deserialize)]
pub struct NarratorOutput {
    pub title: String,
    pub dialogue: String,
    pub topic_complete: bool,
    pub blackboard_instructions: BlackboardInstructions,
}

pub struct NarrateRequest {
    pub parent_id: i64,
    pub dialogue_reference: DialogueReference,
}

pub struct Narrator {
    client: Box<dyn LLMClient>,
}

impl Narrator {
    pub fn new() -> Self {
        let mut client = LLMClientFactory::get_client(ClientType::GeminiPro);
        client.set_json_mode(true);
        Self { client }
    }

    pub async fn narrate(&mut self, request: NarrateRequest) -> Result<NarratorOutput> {
        let profile = AppDataRepo::get("user_profile")?.unwrap_or_default();
        let dialogues =
            DialoguesRepo::get_for_parent(request.dialogue_reference.kind(), request.parent_id)?;
        let recent_dialogues = &dialogues[dialogues.len().saturating_sub(10)..];
        let recent_dialogue_content = recent_dialogues
            .iter()
            .map(|dialogue| dialogue.content.clone())
            .collect::<Vec<String>>()
            .join("\n\n---\n\n");
        let blackboard_state = dialogues
            .last()
            .unwrap_or(&Dialogue::default())
            .blackboard
            .description
            .clone();

        let prompt = match request.dialogue_reference {
            DialogueReference::Journey {
                journey_id,
                arc_idx,
                topic_idx,
            } => {
                let artifact = JourneysRepo::get_artifacts(journey_id)?;
                let arc = artifact.get_arc(arc_idx);
                let arc_json = serde_json::to_string_pretty(&arc)
                    .map_err(|e| MetisError::JsonError(e.to_string()))?;
                let topic =
                    artifact
                        .get_topic(arc_idx, topic_idx)
                        .ok_or(MetisError::ParamsError(
                            "invalid arc index or topic index for the journey reference"
                                .to_string(),
                        ))?;
                let current_topic_json = serde_json::to_string_pretty(&topic)
                    .map_err(|e| MetisError::JsonError(e.to_string()))?;
                let reference_material = load_topic_content(&artifact.chapter_dir, &topic.name);
                get_prompt_provider().get_journey_narrator_prompt(
                    &profile,
                    &arc_json,
                    &current_topic_json,
                    &recent_dialogue_content,
                    &reference_material,
                    &blackboard_state,
                )
            }
            DialogueReference::Explanation { step_idx, .. } => {
                let artifact = ExplanationsRepo::get_artifacts(request.parent_id)?;
                let plan = serde_json::to_string_pretty(&artifact.explanation)
                    .map_err(|e| MetisError::JsonError(e.to_string()))?;

                let step = artifact.get_step(step_idx).ok_or(MetisError::ParamsError(
                    "invalid step index for explanation reference".to_string(),
                ))?;
                let current_step_string = serde_json::to_string_pretty(step)
                    .map_err(|err| MetisError::JsonError(err.to_string()))?;

                let reference_material = load_explanation_material(&artifact.explanation_directory);

                get_prompt_provider().get_explainer_narrator_prompt(
                    &profile,
                    &plan,
                    &current_step_string,
                    &recent_dialogue_content,
                    &reference_material,
                    &blackboard_state,
                )
            }
            DialogueReference::None => {
                return Err(MetisError::ParamsError(
                    "dialogue reference is none for the dialgoue that needs to be generated"
                        .to_string(),
                ));
            }
        };
        self.client.set_system_prompt(prompt);

        let response = self
            .client
            .generate("Generate the next dialogue chunk.".to_string())
            .await?;

        let raw = response.text();
        let fixed = sanitize_json(&raw);
        Ok(serde_json::from_str(&fixed)?)
    }
}
