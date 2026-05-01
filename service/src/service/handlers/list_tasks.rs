use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::{
    app::AppContext,
    db::repo::task::TasksRepo,
    error::Result,
    service::handler::BoxFuture,
    task::progress::TaskStatus,
};

#[derive(Deserialize)]
pub struct ListTasksParams;

#[derive(Serialize)]
pub struct TaskView {
    pub id: String,
    pub name: String,
    pub status: TaskStatus,
    pub params: Value,
    pub checkpoint: Value,
    pub error: String,
    pub identity: Option<String>,
}

pub fn list_tasks(_: ListTasksParams, _context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let tasks: Vec<TaskView> = TasksRepo::list_active()?
            .into_iter()
            .map(|t| TaskView {
                id: t.id,
                name: t.name,
                status: t.status,
                params: t.params,
                checkpoint: t.checkpoint,
                error: t.error,
                identity: t.identity,
            })
            .collect();
        Ok(serde_json::to_value(tasks)?.into())
    })
}
