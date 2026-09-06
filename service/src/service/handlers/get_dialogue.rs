use serde::Deserialize;

use crate::{
    app::{dialogue::Dialogue, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetDialogueParams {
    pub dialogue_id: i64,
}

pub fn get_dialogue(params: GetDialogueParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let dialogue = Repository::<Dialogue>::find_by_id(&params.dialogue_id)?;
        Ok(serde_json::to_value(dialogue.read())?.into())
    })
}
