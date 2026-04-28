use std::{future::Future, pin::Pin};

use serde::Serialize;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;

use crate::{
    db::repo::task::TasksRepo,
    error::Result,
    task::{
        context::TaskContext,
        progress::{TaskProgress, TaskStatus},
        task_type::TaskType,
        tasks::create_journey::{create_journey, CreateJourneyCheckpoint},
        Task,
    },
};

pub struct TaskMangager {
    pub app_handle: AppHandle,
}

pub type TaskFuture = Pin<Box<dyn Future<Output = Result<Value>> + Send>>;

impl TaskMangager {
    pub fn new(app_handle: AppHandle) -> Self {
        Self { app_handle }
    }

    pub async fn spawn<F, T>(&self, runner: F, name: &str, params: Value) -> Result<String>
    where
        F: Fn(TaskContext) -> TaskFuture + Send + 'static,
        T: Default + Serialize,
    {
        let task_id = uuid::Uuid::new_v4().to_string();
        let (tx, mut rx) = mpsc::channel::<TaskProgress>(100);
        let context = TaskContext {
            id: task_id.clone(),
            params: params.clone(),
            progress_tx: tx,
            checkpoint: serde_json::to_value(T::default())?,
        };
        let task = Task {
            name: name.into(),
            id: task_id.clone(),
            params,
            checkpoint: serde_json::to_value(T::default())?,
            status: TaskStatus::Pending,
            error: String::new(),
        };
        TasksRepo::insert(&task)?;
        let app_handle = self.app_handle.clone();
        tokio::spawn(async move {
            while let Some(progress) = rx.recv().await {
                let _ = TasksRepo::update(&progress);
                let _ = app_handle.emit("task:progress", progress);
            }
        });
        let task_id_value = task_id.clone();
        let app_handle = self.app_handle.clone();
        tokio::spawn(async move {
            match runner(context).await {
                Ok(val) => {
                    let _ = TasksRepo::mark_complete(&task_id_value);
                    let _ = app_handle.emit("task:done", val);
                }
                Err(err) => {
                    let progress = TaskProgress {
                        task_id: task_id_value.clone(),
                        checkpoint: json!({}),
                        message: err.to_string(),
                        status: TaskStatus::Failed,
                    };
                    let _ = TasksRepo::update(&progress);
                    let _ = app_handle.emit("task:error", task_id_value);
                }
            }
        });
        Ok(task_id.to_string())
    }

    pub async fn dispatch(&self, task: TaskType, params: Value) -> Result<String> {
        match task {
            TaskType::CreateJourney => {
                self.spawn::<_, CreateJourneyCheckpoint>(create_journey, "create_journey", params)
                    .await
            }
        }
    }
}
