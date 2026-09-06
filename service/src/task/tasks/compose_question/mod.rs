use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{
    app::dialogue::Dialogue,
    db::repo::Repository,
    task::{
        context::TaskContext,
        gaurd::TaskGaurd,
        manager::TaskFuture,
        progress::{TaskProgress, TaskStatus},
        tasks::compose_explainer::illustrator::{
            IllustrationRequest, IllustrationResult, Illustrator,
        },
    },
};

#[derive(Serialize, Deserialize)]
pub struct ComposeQuestionParam {
    dialogue_id: i64,
}

#[derive(Deserialize, Serialize)]
pub struct ComposeQuestionCheckpoint {
    illustration_output: Option<IllustrationResult>,
}

pub fn compose_question(context: TaskContext) -> TaskFuture {
    Box::pin(async move {
        let params: ComposeQuestionParam = serde_json::from_value(context.params)?;
        let mut dialogue = Repository::<Dialogue>::find_by_id(&params.dialogue_id)?;
        let mut checkpoint: ComposeQuestionCheckpoint = serde_json::from_value(context.checkpoint)?;

        let (content, instruction, directory) = {
            let d = dialogue.read();
            (
                d.content.clone(),
                d.blackboard.description.clone(),
                d.reference.get_directory()?,
            )
        };

        let needs_figure =
            !instruction.trim().is_empty() && !instruction.eq_ignore_ascii_case("clear");

        if needs_figure && checkpoint.illustration_output.is_none() {
            let mut illustrator = Illustrator::new();
            let illustration = illustrator
                .illustrate(IllustrationRequest {
                    dialogue: &content,
                    instruction: &instruction,
                    directory: &directory,
                    parts: &[],
                })
                .await?;
            checkpoint.illustration_output = Some(illustration);
            let _ = context
                .progress_tx
                .send(TaskProgress {
                    task_id: context.id.clone(),
                    message: format!("illustration generated for question: {}", params.dialogue_id),
                    checkpoint: serde_json::to_value(&checkpoint)?,
                    status: TaskStatus::Running,
                })
                .await;
        }

        {
            let mut d = dialogue.write();
            if let Some(illustration) = checkpoint.illustration_output.clone() {
                d.blackboard = illustration.blackboard;
            }
            d.is_ready = true;
        }

        Ok(json!({}))
    })
}

impl TaskGaurd for ComposeQuestionParam {
    fn identity(&self) -> Option<String> {
        Some(format!("ComposeQuestion:{}", self.dialogue_id))
    }
}

impl Default for ComposeQuestionCheckpoint {
    fn default() -> Self {
        ComposeQuestionCheckpoint {
            illustration_output: None,
        }
    }
}
