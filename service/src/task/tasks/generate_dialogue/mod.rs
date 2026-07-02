use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{
    app::dialogue::{Dialogue, DialogueReference, ReferenceKind},
    db::repo::{
        dialogue::DialoguesRepo, explanations::ExplanationsRepo, journeys::JourneysRepo,
        task::TasksRepo,
    },
    error::Result,
    task::{
        context::TaskContext,
        gaurd::TaskGaurd,
        manager::TaskFuture,
        progress::{TaskProgress, TaskStatus},
        tasks::generate_dialogue::generator::DialgoueGenerator,
    },
};

pub mod annotation;
pub mod curator;
pub mod enhancer;
pub mod generator;
pub mod illustrator;
pub mod layout;
pub mod narrator;
pub mod templates;
pub mod audio_renderer;

#[derive(Deserialize, Serialize)]
pub struct GenerationParams {
    parent_id: i64,
    dialogue_reference: DialogueReference,
    num_dialogues: usize,
}

#[derive(Serialize, Deserialize)]
pub struct GenerationCheckpoint {
    count: usize,
}

fn refresh_reference(reference: &DialogueReference) -> Result<Option<DialogueReference>> {
    match reference {
        DialogueReference::Explanation { explanation_id, .. } => {
            let progress = ExplanationsRepo::get_artifacts(*explanation_id)?.progress;
            if progress.is_complete {
                Ok(None)
            } else {
                Ok(Some(DialogueReference::Explanation {
                    explanation_id: *explanation_id,
                    step_idx: progress.step_idx,
                }))
            }
        }
        DialogueReference::Journey { journey_id, .. } => {
            let progress = JourneysRepo::get_artifacts(*journey_id)?.progress;
            if progress.is_journey_complete {
                Ok(None)
            } else {
                Ok(Some(DialogueReference::Journey {
                    journey_id: *journey_id,
                    arc_idx: progress.arc_idx,
                    topic_idx: progress.topic_idx,
                }))
            }
        }
        DialogueReference::None => Ok(None),
    }
}

pub fn generate_dialogues(context: TaskContext) -> TaskFuture {
    Box::pin(async move {
        let params: GenerationParams = serde_json::from_value(context.params)?;
        let mut checkpoint: GenerationCheckpoint = serde_json::from_value(context.checkpoint)?;
        let mut generator = DialgoueGenerator::new();
        let mut dialogue_reference = params.dialogue_reference.clone();
        let count = checkpoint.count;
        for _ in count..params.num_dialogues {
            let iteration_params = GenerationParams {
                parent_id: params.parent_id,
                dialogue_reference: dialogue_reference.clone(),
                num_dialogues: params.num_dialogues,
            };
            let dialogue: Dialogue = generator.generate(&iteration_params).await?;
            checkpoint.count += 1;
            DialoguesRepo::insert(&dialogue)?;
            let _ = context
                .progress_tx
                .send(TaskProgress {
                    task_id: context.id.clone(),
                    message: format!("Dialgoue generate for journey: {}", params.parent_id),
                    checkpoint: serde_json::to_value(&checkpoint)?,
                    status: TaskStatus::Running,
                })
                .await;

            match refresh_reference(&dialogue_reference)? {
                Some(next) => dialogue_reference = next,
                None => break,
            }
        }
        Ok(json!({}))
    })
}

impl Default for GenerationCheckpoint {
    fn default() -> Self {
        Self { count: 0 }
    }
}

impl TaskGaurd for GenerationParams {
    fn identity(&self) -> Option<String> {
        Some(format!("GenerateDialogues:{}:{}", self.parent_id, self.dialogue_reference.kind().as_str()))
    }
}
