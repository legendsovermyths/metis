use std::time::{SystemTime, UNIX_EPOCH};

use serde_json::Value;

use crate::{
    db::get_database,
    error::{MetisError, Result},
    task::{
        progress::{TaskProgress, TaskStatus},
        Task,
    },
};

pub struct TasksRepo;

fn now_secs() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

fn value_from_json_col(raw: Option<String>) -> Result<Value> {
    match raw {
        None => Ok(Value::Null),
        Some(s) if s.is_empty() => Ok(Value::Null),
        Some(s) => Ok(serde_json::from_str(&s)?),
    }
}

impl TasksRepo {
    pub fn insert(task: &Task) -> Result<()> {
        let params_json = serde_json::to_string(&task.params)?;
        let checkpoint_json = serde_json::to_string(&task.checkpoint)?;
        let status_str = match task.status {
            TaskStatus::Pending => "pending",
            TaskStatus::Running => "running",
            TaskStatus::Completed => "completed",
            TaskStatus::Failed => "failed",
        };
        let ts = now_secs();
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "INSERT INTO background_tasks (id, name, status, params, checkpoint, error, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            rusqlite::params![
                task.id,
                task.name,
                status_str,
                params_json,
                checkpoint_json,
                task.error,
                ts,
                ts,
            ],
        )?;
        Ok(())
    }

    pub fn get(id: &str) -> Result<Option<Task>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, name, status, params, checkpoint, error
             FROM background_tasks WHERE id = ?1",
        )?;
        let mut rows = stmt.query(rusqlite::params![id])?;
        if let Some(row) = rows.next()? {
            let status_str: String = row.get(2)?;
            let status = match status_str.as_str() {
                "pending" => TaskStatus::Pending,
                "running" => TaskStatus::Running,
                "completed" => TaskStatus::Completed,
                "failed" => TaskStatus::Failed,
                other => {
                    return Err(MetisError::ValueParseError(format!(
                        "unknown background_tasks.status: {other}"
                    )));
                }
            };
            Ok(Some(Task {
                id: row.get(0)?,
                name: row.get(1)?,
                status,
                params: value_from_json_col(row.get(3)?)?,
                checkpoint: value_from_json_col(row.get(4)?)?,
                error: row.get::<_, Option<String>>(5)?.unwrap_or_default(),
            }))
        } else {
            Ok(None)
        }
    }

    pub fn update(progress: &TaskProgress) -> Result<()> {
        let checkpoint_json = serde_json::to_string(&progress.checkpoint)?;
        let updated_at = now_secs();
        let conn = get_database().conn.lock().unwrap();
        let rows_affected = conn.execute(
            "UPDATE background_tasks
             SET checkpoint = ?2,
                 status = ?3,
                 error = ?4,
                 updated_at = ?5
             WHERE id = ?1",
            rusqlite::params![
                progress.task_id,
                checkpoint_json,
                match progress.status {
                    TaskStatus::Pending => "pending",
                    TaskStatus::Running => "running",
                    TaskStatus::Completed => "completed",
                    TaskStatus::Failed => "failed",
                },
                progress.message,
                updated_at,
            ],
        )?;
        if rows_affected == 0 {
            return Err(MetisError::NotFound(format!(
                "background task {} — update affected zero rows",
                progress.task_id
            )));
        }
        Ok(())
    }

    pub fn mark_complete(id: &str) -> Result<()> {
        let updated_at = now_secs();
        let conn = get_database().conn.lock().unwrap();
        let rows_affected = conn.execute(
            "UPDATE background_tasks
             SET status = ?2,
                 updated_at = ?3
             WHERE id = ?1",
            rusqlite::params![id, "completed", updated_at],
        )?;
        if rows_affected == 0 {
            return Err(MetisError::NotFound(format!(
                "background task {id} — mark_complete affected zero rows"
            )));
        }
        Ok(())
    }
}
