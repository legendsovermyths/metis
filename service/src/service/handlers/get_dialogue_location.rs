use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{dialogue::Dialogue, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetDialogueLocationParams {
    dialogue_id: i64,
}

pub fn get_dialogue_location(params: GetDialogueLocationParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let dialogue = Repository::<Dialogue>::find_by_id(&params.dialogue_id)?;
        let reference = dialogue.read().reference.clone();
        Ok(json!({
            "artifact_kind": reference.kind(),
            "artifact_id": reference.parent_id(),
        })
        .into())
    })
}
