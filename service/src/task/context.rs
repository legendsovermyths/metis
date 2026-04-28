use serde_json::Value;
use tokio::sync::mpsc;

use crate::task::progress::TaskProgress;


pub struct TaskContext{
    pub id: String,
    pub params: Value,
    pub checkpoint: Value,
    pub progress_tx: mpsc::Sender<TaskProgress>
}
