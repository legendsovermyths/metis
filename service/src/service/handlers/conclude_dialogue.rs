use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{dialogue::Dialogue, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct ConcludeDialogueParams {
    pub dialogue_id: i64,
}

pub fn conclude_dialogue(params: ConcludeDialogueParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let mut dialogue = Repository::<Dialogue>::find_by_id(&params.dialogue_id)?;
        dialogue.write().concluded = true;
        Ok(json!({ "success": true }).into())
    })
}
