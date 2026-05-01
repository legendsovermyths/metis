use serde_json::Value;
use tokio::sync::mpsc;

use crate::task::{progress::TaskProgress, task_type::TaskType};


pub struct TaskContext{
    pub id: String,
    pub params: Value,
    pub checkpoint: Value,
    pub task_type: TaskType,
    pub progress_tx: mpsc::Sender<TaskProgress>
}
