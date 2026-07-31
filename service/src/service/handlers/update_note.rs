use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{notes::Note, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct UpdateNoteParams {
    id: i64,
    title: String,
    content: String,
}

pub fn update_note(params: UpdateNoteParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let now = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let mut note = Repository::<Note>::find_by_id(&params.id)?;
        {
            let mut w = note.write();
            w.title = params.title;
            w.content = params.content;
            w.updated_at = now;
        }
        Ok(json!({ "ok": true }).into())
    })
}
