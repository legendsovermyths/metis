use serde::Deserialize;
use serde_json::json;

use crate::{app::AppContext, db::repo::folders::FoldersRepo, service::handler::BoxFuture};

#[derive(Deserialize)]
pub struct MoveFolderParams {
    id: i64,
    parent_id: Option<i64>,
}

pub fn move_folder(params: MoveFolderParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        FoldersRepo::set_parent(params.id, params.parent_id)?;
        Ok(json!({ "success": true }).into())
    })
}
