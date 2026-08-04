use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{notes::Note, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct MoveNoteParams {
    id: i64,
    folder_id: Option<i64>,
}

pub fn move_note(params: MoveNoteParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let mut note = Repository::<Note>::find_by_id(&params.id)?;
        note.write().folder_id = params.folder_id;
        Ok(json!({ "success": true }).into())
    })
}
