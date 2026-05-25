use serde_json::Value;

use crate::task::{progress::TaskStatus, task_type::TaskType};

pub mod context;
pub mod gaurd;
pub mod manager;
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

pub struct TaskRequest {
    pub task_type: TaskType,
    pub params: Value,
}
