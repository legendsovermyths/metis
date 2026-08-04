use serde_json::Value;

use crate::{
    app::{notes::Note, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

pub fn get_all_notes(_: Value, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let mut notes = Repository::<Note>::all()?;
        notes.sort_by(|a, b| b.read().updated_at.cmp(&a.read().updated_at));
        Ok(serde_json::to_value(notes)?.into())
    })
}
