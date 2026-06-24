use serde::Deserialize;
use serde_json::json;

use crate::{app::AppContext, db::repo::folders::FoldersRepo, service::handler::BoxFuture};

#[derive(Deserialize)]
pub struct DeleteFolderParams {
    id: i64,
}

pub fn delete_folder(params: DeleteFolderParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        FoldersRepo::delete(params.id)?;
        Ok(json!({ "success": true }).into())
    })
}
