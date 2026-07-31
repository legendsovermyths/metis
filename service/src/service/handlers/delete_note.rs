use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{notes::Note, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct DeleteNoteParams {
    id: i64,
}

pub fn delete_note(params: DeleteNoteParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        Repository::<Note>::delete(&params.id)?;
        Ok(json!({ "ok": true }).into())
    })
}
