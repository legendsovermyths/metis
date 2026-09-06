use std::{future::Future, pin::Pin, sync::Arc};

use serde::{de::DeserializeOwned, Serialize};
use serde_json::Value;
use tauri::AppHandle;
use tokio::sync::mpsc;

use crate::{
    db::repo::{task::TasksRepo, Repository},
    error::Result,
    task::{
        gaurd::TaskGaurd,
        pool::TaskPool,
        progress::TaskStatus,
        task_type::TaskType,
        tasks::{
            compose_explainer::{ComposeExplainerCheckpoint, ComposeParam},
            compose_question::{ComposeQuestionCheckpoint, ComposeQuestionParam},
            create_explainer::{CreateExplanationCheckpoint, CreateExplanationParams},
            create_journey::{CreateJourneyCheckpoint, CreateJourneyParams},
            draft_dialogues::{DraftCheckpoint, DraftParams},
        },
        Task,
    },
};

const POOL_SIZE: usize = 25;

pub struct TaskMangager {
    pub app_handle: AppHandle,
    pub pool: TaskPool,
}

pub type TaskFuture = Pin<Box<dyn Future<Output = Result<Value>> + Send>>;

impl TaskMangager {
    pub fn new(app_handle: AppHandle) -> Arc<Self> {
        let (tx, mut rx) = mpsc::channel(2048);
        let pool = TaskPool::new(POOL_SIZE, tx, app_handle.clone());
        let manager = Arc::new(TaskMangager { app_handle, pool });

        let listener = Arc::clone(&manager);
        tauri::async_runtime::spawn(async move {
            while let Some(request) = rx.recv().await {
                let _ = listener.dispatch(request.task_type, request.params).await;
            }
        });
        manager
    }

    pub async fn queue<T, K>(&self, task_type: TaskType, params: Value) -> Result<String>
    where
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

        let task = Task {
            name: task_type.into(),
            id: task_id.clone(),
            params,
            checkpoint: serde_json::to_value(T::default())?,
            status: TaskStatus::Pending,
            error: String::new(),
            identity,
        };
        Repository::<Task>::insert(&task)?;

        self.pool.execute(task).await;
        Ok(task_id.to_string())
    }

    pub async fn dispatch(&self, task: TaskType, params: Value) -> Result<String> {
        match task {
            TaskType::CreateJourney => {
                self.queue::<CreateJourneyCheckpoint, CreateJourneyParams>(
                    TaskType::CreateJourney,
                    params,
                )
                .await
            }
            TaskType::CreateExplanation => {
                self.queue::<CreateExplanationCheckpoint, CreateExplanationParams>(
                    TaskType::CreateExplanation,
                    params,
                )
                .await
            }
            TaskType::DraftDialogue => {
                self.queue::<DraftCheckpoint, DraftParams>(TaskType::DraftDialogue, params)
                    .await
            },
            TaskType::ComposeExplainer => {
                self.queue::<ComposeExplainerCheckpoint, ComposeParam>(
                    TaskType::ComposeExplainer,
                    params,
                )
                .await
            }
            TaskType::ComposeQuestion => {
                self.queue::<ComposeQuestionCheckpoint, ComposeQuestionParam>(
                    TaskType::ComposeQuestion,
                    params,
                )
                .await
            }
        }
    }

    pub async fn resume(&self) -> Result<()> {
        let active = TasksRepo::list_active()?;
        for task in active {
            self.pool.execute(task).await;
        }
        Ok(())
    }
}
