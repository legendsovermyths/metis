use std::sync::Arc;

use serde_json::json;
use tokio::{
    sync::{mpsc, Mutex},
    task::JoinHandle,
};

use crate::{
    db::repo::task::TasksRepo,
    task::{
        context::TaskContext,
        progress::{TaskProgress, TaskStatus},
        Task, TaskRequest,
    },
};

pub struct TaskPool {
    sender: mpsc::Sender<Task>,
    handles: Vec<JoinHandle<()>>,
}

impl TaskPool {
    pub fn new(size: usize, task_request_tx: mpsc::Sender<TaskRequest>) -> Self {
        let (tx, rx) = mpsc::channel(2048);
        let rx = Arc::new(Mutex::new(rx));
        let mut handles = Vec::new();
        for _ in 0..size {
            let handle = TaskWorker::new(Arc::clone(&rx), task_request_tx.clone());
            handles.push(handle);
        }
        Self {
            sender: tx,
            handles,
        }
    }

    pub async fn execute(&self, task: Task) {
        let _ = self.sender.send(task).await;
    }
}

struct TaskWorker;

impl TaskWorker {
    fn new(rx: Arc<Mutex<tokio::sync::mpsc::Receiver<Task>>>, task_request_tx: mpsc::Sender<TaskRequest>) -> JoinHandle<()> {
        let handle = tokio::spawn(async move {
            loop {
                let task = { rx.lock().await.recv().await };
                if let Some(task) = task {
                    let runner = task.get_runner();
                    match runner {
                        Ok(runner) => {
                            let (tx, mut rx) = mpsc::channel::<TaskProgress>(100);
                            tokio::spawn(async move {
                                while let Some(progress) = rx.recv().await {
                                    //We can do other things also here, like in some cases stream
                                    //the progress to frontend, so although this might now look that
                                    //important, it might just be, we should leave it as is
                                    let _ = TasksRepo::update(&progress);
                                }
                            });
                            let context = TaskContext {
                                id: task.id.clone(),
                                params: task.params.clone(),
                                progress_tx: tx,
                                checkpoint: task.checkpoint.clone(),
                                task_request_tx: task_request_tx.clone()
                            };
                            match runner(context).await {
                                Ok(_val) => {
                                    let _ = TasksRepo::mark_complete(&task.id);
                                }
                                Err(err) => {
                                    let progress = TaskProgress {
                                        task_id: task.id.clone(),
                                        checkpoint: json!({}),
                                        message: err.to_string(),
                                        status: TaskStatus::Failed,
                                    };
                                    let _ = TasksRepo::update(&progress);
                                }
                            }
                        }
                        Err(_err) => {
                            //This will be logged, once we have logging system in place
                        }
                    }
                } else {
                    break;
                }
            }
        });
        handle
    }
}
