use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{explanation::folder::Folder, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct RenameFolderParams {
    id: i64,
    name: String,
}

pub fn rename_folder(params: RenameFolderParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let mut folder = Repository::<Folder>::find_by_id(&params.id)?;
        folder.write().name = params.name;
        Ok(json!({ "success": true }).into())
    })
}
