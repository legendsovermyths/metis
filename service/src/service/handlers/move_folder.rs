use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{folder::Folder, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct MoveFolderParams {
    id: i64,
    parent_id: Option<i64>,
}

pub fn move_folder(params: MoveFolderParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let mut folder = Repository::<Folder>::find_by_id(&params.id)?;
        folder.write().parent_id = params.parent_id;
        Ok(json!({ "success": true }).into())
    })
}
