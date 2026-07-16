use serde_json::Value;

use crate::{
    error::{MetisError, Result},
    task::{
        context::TaskContext,
        manager::TaskFuture,
        progress::TaskStatus,
        task_type::TaskType,
        tasks::{
            analyse_book::analyse_book, create_explainer::create_explanation,
            create_journey::create_journey, generate_dialogue::generate_dialogues,
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
            TaskType::AnalyseBook => Ok(analyse_book),
            TaskType::GenerateDialogues => Ok(generate_dialogues),
            TaskType::CreateExplanation => Ok(create_explanation),
        }
    }
}

pub struct TaskRequest {
    pub task_type: TaskType,
    pub params: Value,
}
