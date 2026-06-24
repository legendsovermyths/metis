use serde::Deserialize;
use serde_json::json;

use crate::{app::AppContext, db::repo::folders::FoldersRepo, service::handler::BoxFuture};

#[derive(Deserialize)]
pub struct CreateFolderParams {
    name: String,
    parent_id: Option<i64>,
}

pub fn create_folder(params: CreateFolderParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let id = FoldersRepo::insert(&params.name, params.parent_id)?;
        Ok(json!({ "id": id }).into())
    })
}
