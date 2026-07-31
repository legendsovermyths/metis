use std::sync::Arc;

use serde_json::json;
use tauri::{async_runtime::JoinHandle, AppHandle, Emitter};
use tokio::sync::{mpsc, Mutex};

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
    pub fn new(
        size: usize,
        task_request_tx: mpsc::Sender<TaskRequest>,
        app_handle: AppHandle,
    ) -> Self {
        let (tx, rx) = mpsc::channel(2048);
        let rx = Arc::new(Mutex::new(rx));
        let mut handles = Vec::new();
        for _ in 0..size {
            let handle =
                TaskWorker::new(Arc::clone(&rx), task_request_tx.clone(), app_handle.clone());
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
    fn new(
        rx: Arc<Mutex<tokio::sync::mpsc::Receiver<Task>>>,
        task_request_tx: mpsc::Sender<TaskRequest>,
        app_handle: AppHandle,
    ) -> JoinHandle<()> {
        let handle = tauri::async_runtime::spawn(async move {
            loop {
                let task = { rx.lock().await.recv().await };
                if let Some(task) = task {
                    let runner = task.get_runner();
                    match runner {
                        Ok(runner) => {
                            let (tx, mut rx) = mpsc::channel::<TaskProgress>(100);
                            let progress_app = app_handle.clone();
                            tokio::spawn(async move {
                                while let Some(progress) = rx.recv().await {
                                    let _ = TasksRepo::update(&progress);
                                    let _ = progress_app.emit("task:progress", &progress);
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
                                Ok(val) => {
                                    let _ = TasksRepo::mark_complete(&task.id);
                                    let _ = app_handle.emit(
                                        "task:done",
                                        json!({ "task_id": task.id, "result": val }),
                                    );
                                }
                                Err(err) => {
                                    let progress = TaskProgress {
                                        task_id: task.id.clone(),
                                        checkpoint: json!({}),
                                        message: err.to_string(),
                                        status: TaskStatus::Failed,
                                    };
                                    let _ = TasksRepo::update(&progress);
                                    let _ = app_handle.emit("task:error", &task.id);
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
