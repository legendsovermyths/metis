use serde::Deserialize;
use serde_json::json;

use crate::{app::AppContext, db::repo::notes::NotesRepo, service::handler::BoxFuture};

#[derive(Deserialize)]
pub struct MoveNoteParams {
    id: i64,
    folder_id: Option<i64>,
}

pub fn move_note(params: MoveNoteParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        NotesRepo::set_folder(params.id, params.folder_id)?;
        Ok(json!({ "success": true }).into())
    })
}
