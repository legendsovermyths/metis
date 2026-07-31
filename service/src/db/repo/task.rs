use std::time::{SystemTime, UNIX_EPOCH};

use dborm::DbRow;
use serde_json::Value;

use crate::{
    db::{persistence::Persistent, object::FromDbRow, repo::Repository},
    error::Result,
    task::{
        progress::{TaskProgress, TaskStatus},
        Task,
    },
};

fn now_secs() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

#[derive(Debug, Clone, DbRow)]
#[db(table = "background_tasks")]
pub struct TaskRecord {
    #[db(id, assigned)]
    pub id: String,
    pub name: String,
    pub status: TaskStatus,
    #[db(json)]
    pub params: Value,
    #[db(json)]
    pub checkpoint: Value,
    pub error: Option<String>,
    pub identity: Option<String>,
    #[db(insert_only)]
    pub created_at: i64,
    pub updated_at: i64,
}

impl FromDbRow for Task {
    type DbRow = TaskRecord;

    fn from_row_type(record: TaskRecord) -> Result<Self> {
        Ok(Task {
            id: record.id,
            name: record.name,
            params: record.params,
            checkpoint: record.checkpoint,
            status: record.status,
            error: record.error.unwrap_or_default(),
            identity: record.identity,
        })
    }

    fn into_row_type(&self) -> TaskRecord {
        let ts = now_secs();
        TaskRecord {
            id: self.id.clone(),
            name: self.name.clone(),
            status: self.status,
            params: self.params.clone(),
            checkpoint: self.checkpoint.clone(),
            error: Some(self.error.clone()),
            identity: self.identity.clone(),
            created_at: ts,
            updated_at: ts,
        }
    }
}

pub struct TasksRepo;

impl TasksRepo {
    pub fn dedup(identity: &str) -> Result<bool> {
        if identity.is_empty() {
            return Ok(true);
        }
        Ok(!Repository::<Task>::exists(
            "identity = ?1 AND status IN ('pending', 'running')",
            rusqlite::params![identity],
        )?)
    }

    pub fn list_active() -> Result<Vec<Task>> {
        Ok(Repository::<Task>::query(
            "SELECT * FROM background_tasks
             WHERE status IN ('pending', 'running')
             ORDER BY created_at ASC",
            &[],
        )?
        .into_iter()
        .map(Persistent::escape)
        .collect())
    }

    pub fn update(progress: &TaskProgress) -> Result<()> {
        let mut task = Repository::<Task>::find_by_id(&progress.task_id)?;
        let mut writer = task.write();
        writer.checkpoint = progress.checkpoint.clone();
        writer.status = progress.status;
        writer.error = progress.message.clone();
        Ok(())
    }

    pub fn mark_complete(id: &str) -> Result<()> {
        let mut task = Repository::<Task>::find_by_id(&id.to_string())?;
        task.write().status = TaskStatus::Completed;
        Ok(())
    }
}
