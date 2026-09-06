use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{dialogue::Dialogue, state::MetisPhase, AppContext},
    db::repo::{dialogue_events::DialogueEventsRepo, Repository},
    error::MetisError,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct SetDialogueParams {
    pub dialogue_id: i64,
}

pub fn set_dialogue(params: SetDialogueParams, context: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let phase = context.chat.lock().await.phase;
        if phase != MetisPhase::Teaching && phase != MetisPhase::Evaluating {
            return Err(MetisError::InvalidRequest);
        }

        let kind = Repository::<Dialogue>::find_by_id(&params.dialogue_id)?
            .read()
            .kind;
        let history = DialogueEventsRepo::get_for_dialogue(params.dialogue_id)?;

        let mut chat = context.chat.lock().await;
        chat.phase = MetisPhase::for_dialogue_kind(kind);
        chat.dialogue_id = Some(params.dialogue_id);
        chat.event_history = history;

        Ok(json!({ "success": true }).into())
    })
}
