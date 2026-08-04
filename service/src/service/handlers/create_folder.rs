use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{folder::Folder, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct CreateFolderParams {
    name: String,
    parent_id: Option<i64>,
    #[serde(default = "default_scope")]
    scope: String,
}

fn default_scope() -> String {
    "study".to_string()
}

pub fn create_folder(params: CreateFolderParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let folder = Repository::<Folder>::create(Folder {
            id: 0,
            name: params.name,
            parent_id: params.parent_id,
            scope: params.scope,
            created_at: now,
        })?;
        Ok(json!({ "id": folder.read().id }).into())
    })
}
