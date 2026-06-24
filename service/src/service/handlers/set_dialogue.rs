use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    app::{state::MetisPhase, AppContext},
    db::repo::{dialogue::DialoguesRepo, dialogue_events::DialogueEventsRepo},
    error::{MetisError, Result},
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct SetDialogueParams {
    pub dialogue_id: i64,
}

pub fn set_dialogue(params: SetDialogueParams, context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let phase = context.chat.lock().await.phase;
        if phase != MetisPhase::Teaching {
            return Err(MetisError::InvalidRequest);
        }

        let history = DialogueEventsRepo::get_for_dialogue(params.dialogue_id)?;

        let mut chat = context.chat.lock().await;
        chat.dialogue_id = Some(params.dialogue_id);
        chat.event_history = history;

        Ok(json!({ "success": true }).into())
    })
}
