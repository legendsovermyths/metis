use serde_json::Value;

use crate::{app::AppContext, db::repo::notes::NotesRepo, service::handler::BoxFuture};

pub fn get_all_notes(_: Value, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let notes = NotesRepo::get_all()?;
        Ok(serde_json::to_value(notes)?.into())
    })
}
