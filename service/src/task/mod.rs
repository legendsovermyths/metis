use serde::Serialize;
use serde_json::Value;

use crate::{
    error::{MetisError, Result},
    task::{
        context::TaskContext,
        manager::TaskFuture,
        progress::TaskStatus,
        task_type::TaskType,
        tasks::{
            compose_explainer::compose_explainer, compose_question::compose_question,
            create_explainer::create_explanation, create_journey::create_journey,
            draft_dialogues::draft_dialogue,
        },
    },
};

pub mod context;
pub mod gaurd;
pub mod manager;
pub mod pool;
pub mod progress;
pub mod task_type;
pub mod tasks;

#[derive(Serialize, Clone)]
pub struct Task {
    pub id: String,
    pub name: String,
    pub params: Value,
    pub checkpoint: Value,
    pub status: TaskStatus,
    pub error: String,
    pub identity: Option<String>,
}

impl Task {
    fn get_runner(&self) -> Result<fn(TaskContext) -> TaskFuture> {
        let name: &str = &self.name;
        match TaskType::try_from(name).map_err(|_| {
            MetisError::InternalDataError("the task name does not match any task type".to_string())
        })? {
            TaskType::CreateJourney => Ok(create_journey),
            TaskType::CreateExplanation => Ok(create_explanation),
            TaskType::DraftDialogue => Ok(draft_dialogue),
            TaskType::ComposeExplainer => Ok(compose_explainer),
            TaskType::ComposeQuestion => Ok(compose_question),
        }
    }
}

pub struct TaskRequest {
    pub task_type: TaskType,
    pub params: Value,
}
