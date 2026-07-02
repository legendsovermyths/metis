use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{notes::Anchor, AppContext},
    db::repo::notes::NotesRepo,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct CreateNoteParams {
    title: String,
    content: String,
    anchor: Option<Anchor>,
    folder_id: Option<i64>,
}

pub fn create_note(params: CreateNoteParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let id = NotesRepo::insert(
            &params.title,
            &params.content,
            params.anchor.as_ref(),
            params.folder_id,
        )?;
        Ok(json!({ "id": id }).into())
    })
}
