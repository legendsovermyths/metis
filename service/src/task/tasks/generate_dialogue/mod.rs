use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{
    app::dialogue::{Dialogue, DialogueReference, ReferenceKind},
    db::repo::{dialogue::DialoguesRepo, task::TasksRepo},
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

pub fn generate_dialogues(context: TaskContext) -> TaskFuture {
    Box::pin(async move {
        let params: GenerationParams = serde_json::from_value(context.params)?;
        let mut checkpoint: GenerationCheckpoint = serde_json::from_value(context.checkpoint)?;
        let mut generator = DialgoueGenerator::new();
        let count = checkpoint.count;
        for _ in count..params.num_dialogues {
            let dialogue: Dialogue = generator.generate(&params).await?;
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
