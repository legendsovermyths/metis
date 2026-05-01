use std::{future::Future, pin::Pin};

use serde::{de::DeserializeOwned, Serialize};
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};
use tokio::sync::mpsc;

use crate::{
    db::repo::task::TasksRepo,
    error::Result,
    task::{
        context::TaskContext,
        gaurd::TaskGaurd,
        progress::{TaskProgress, TaskStatus},
        task_type::TaskType,
        tasks::{
            analyse_book::{analyse_book, AnalyseBookCheckpoint, AnalyseBookParams},
            create_journey::{create_journey, CreateJourneyCheckpoint, CreateJourneyParams},
            generate_dialogue::{generate_dialogues, GenerationCheckpoint, GenerationParams},
        },
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

    pub async fn spawn<F, T, K>(
        &self,
        runner: F,
        task_type: TaskType,
        params: Value,
    ) -> Result<String>
    where
        F: Fn(TaskContext) -> TaskFuture + Send + 'static,
        T: Default + Serialize,
        K: DeserializeOwned + TaskGaurd,
    {
        let guard: K = serde_json::from_value(params.clone())?;
        let identity = guard.identity();
        if let Some(val) = identity.as_ref() {
            if !TasksRepo::dedup(val)? {
                return Ok(String::new());
            }
        }

        let task_id = uuid::Uuid::new_v4().to_string();
        let (tx, mut rx) = mpsc::channel::<TaskProgress>(100);
        let context = TaskContext {
            id: task_id.clone(),
            task_type: task_type.clone(),
            params: params.clone(),
            progress_tx: tx,
            checkpoint: serde_json::to_value(T::default())?,
        };

        let task = Task {
            name: task_type.into(),
            id: task_id.clone(),
            params,
            checkpoint: serde_json::to_value(T::default())?,
            status: TaskStatus::Pending,
            error: String::new(),
            identity,
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
                    let _ = app_handle.emit("task:done", json!({ "task_id": task_id_value, "result": val }));
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
                self.spawn::<_, CreateJourneyCheckpoint, CreateJourneyParams>(
                    create_journey,
                    TaskType::CreateJourney,
                    params,
                )
                .await
            }
            TaskType::AnalyseBook => {
                self.spawn::<_, AnalyseBookCheckpoint, AnalyseBookParams>(
                    analyse_book,
                    TaskType::AnalyseBook,
                    params,
                )
                .await
            }
            TaskType::GenerateDialogues => {
                self.spawn::<_, GenerationCheckpoint, GenerationParams>(
                    generate_dialogues,
                    TaskType::GenerateDialogues,
                    params,
                )
                .await
            }
        }
    }

    pub fn resume(&self) -> Result<()> {
        let active = TasksRepo::list_active()?;
        for task in active {
            let task_type: TaskType = match task.name.as_str().try_into() {
                Ok(t) => t,
                Err(_) => continue,
            };
            let runner: fn(TaskContext) -> TaskFuture = match task_type {
                TaskType::CreateJourney => create_journey,
                TaskType::AnalyseBook => analyse_book,
                TaskType::GenerateDialogues => generate_dialogues,
            };

            let (tx, mut rx) = mpsc::channel::<TaskProgress>(100);
            let context = TaskContext {
                id: task.id.clone(),
                task_type: task_type.clone(),
                params: task.params,
                progress_tx: tx,
                checkpoint: task.checkpoint,
            };

            let app_handle = self.app_handle.clone();
            tokio::spawn(async move {
                while let Some(progress) = rx.recv().await {
                    let _ = TasksRepo::update(&progress);
                    let _ = app_handle.emit("task:progress", progress);
                }
            });
            let task_id_value = task.id.clone();
            let app_handle = self.app_handle.clone();
            tokio::spawn(async move {
                match runner(context).await {
                    Ok(val) => {
                        let _ = TasksRepo::mark_complete(&task_id_value);
                        let _ = app_handle.emit("task:done", json!({ "task_id": task_id_value, "result": val }));
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
        }
        Ok(())
    }
}
