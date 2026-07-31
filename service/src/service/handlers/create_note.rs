use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{
        notes::{Anchor, Note},
        AppContext,
    },
    db::repo::Repository,
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
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let note = Repository::<Note>::create(Note {
            id: None,
            title: params.title,
            content: params.content,
            anchor: params.anchor,
            folder_id: params.folder_id,
            created_at: now,
            updated_at: now,
        })?;
        Ok(json!({ "id": note.read().id }).into())
    })
}
