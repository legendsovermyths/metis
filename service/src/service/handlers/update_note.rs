use serde::Deserialize;
use serde_json::json;

use crate::{app::AppContext, db::repo::notes::NotesRepo, service::handler::BoxFuture};

#[derive(Deserialize)]
pub struct UpdateNoteParams {
    id: i64,
    title: String,
    content: String,
}

pub fn update_note(params: UpdateNoteParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        NotesRepo::update(params.id, &params.title, &params.content)?;
        Ok(json!({ "ok": true }).into())
    })
}
