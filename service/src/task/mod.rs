use serde_json::Value;

use crate::task::progress::TaskStatus;

pub mod context;
pub mod manager;
pub mod progress;
pub mod tasks;
pub mod task_type;

pub struct Task {
    pub id: String,
    pub name: String,
    pub params: Value,
    pub checkpoint: Value,
    pub status: TaskStatus,
    pub error: String,
}
