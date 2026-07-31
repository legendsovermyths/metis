use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{explanation::folder::Folder, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct DeleteFolderParams {
    id: i64,
}

pub fn delete_folder(params: DeleteFolderParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        Repository::<Folder>::delete(&params.id)?;
        Ok(json!({ "success": true }).into())
    })
}
