use serde::Serialize;
use serde_json::Value;

#[derive(Serialize, Clone)]
pub struct TaskProgress {
    pub task_id: String,
    pub checkpoint: Value,
    pub status: TaskStatus,
    pub message: String,
}


#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize)]
pub enum TaskStatus {
    Pending,
    Running,
    Completed,
    Failed,
}
