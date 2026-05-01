use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{
    app::journey::dialogue::Dialogue,
    db::repo::{dialogue::DialoguesRepo, task::TasksRepo},
    task::{
        context::TaskContext,
        gaurd::TaskGaurd,
        manager::TaskFuture,
        progress::{TaskProgress, TaskStatus},
        tasks::generate_dialogue::generator::DialgoueGenerator,
    },
};

pub mod curator;
pub mod generator;
pub mod illustrator;
pub mod narrator;

#[derive(Deserialize, Serialize)]
pub struct GenerationParams {
    id: i64,
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
                    message: format!("Dialgoue generate for journey: {}", params.id),
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
        None
    }
}
