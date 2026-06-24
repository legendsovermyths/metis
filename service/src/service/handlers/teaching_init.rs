use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    app::{
        dialogue::ReferenceKind,
        state::{MetisPhase, TeachingContext},
        AppContext,
    },
    db::{
        repo::{
            dialogue::DialoguesRepo, dialogue_events::DialogueEventsRepo, journeys::JourneysRepo,
        },
    },
    logs::EventHistory,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct TeachingInitParams {
    pub artifact_id: i64,
    pub artifact_kind: ReferenceKind,
}

pub fn teaching_init(params: TeachingInitParams, context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let teaching_state = TeachingContext {
            artifact_kind: Some(params.artifact_kind),
            artifact_id: Some(params.artifact_id),
        };

        let mut ctx = context.teaching.lock().await;
        *ctx = teaching_state;

        let dialogues = DialoguesRepo::get_for_parent(params.artifact_kind, params.artifact_id)?;
        let last = dialogues.iter().rfind(|d| d.visible);
        let (dialogue_id, event_history) = match last {
            Some(d) => (
                Some(d.id.unwrap()),
                DialogueEventsRepo::get_for_dialogue(d.id.unwrap())?,
            ),
            None => (None, EventHistory::new()),
        };

        let mut ctx = context.chat.lock().await;
        ctx.phase = MetisPhase::Teaching;
        ctx.is_done = false;
        ctx.dialogue_id = dialogue_id;
        ctx.event_history = event_history;

        Ok(json!({ "success": true }).into())
    })
}
