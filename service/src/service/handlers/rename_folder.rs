use serde::Deserialize;
use serde_json::json;

use crate::{app::AppContext, db::repo::folders::FoldersRepo, service::handler::BoxFuture};

#[derive(Deserialize)]
pub struct RenameFolderParams {
    id: i64,
    name: String,
}

pub fn rename_folder(params: RenameFolderParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        FoldersRepo::rename(params.id, &params.name)?;
        Ok(json!({ "success": true }).into())
    })
}
