use serde::Deserialize;

use crate::{app::AppContext, db::repo::task::TasksRepo, service::handler::BoxFuture};

#[derive(Deserialize)]
pub struct ListTasksParams;

pub fn list_tasks(_: ListTasksParams, _context: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let tasks = TasksRepo::list_active()?;
        Ok(serde_json::to_value(tasks)?.into())
    })
}
