use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    app::{
        state::{MetisPhase, TeachingContext},
        AppContext,
    },
    db::{
        persistence::Persistent,
        repo::{dialogue::DialoguesRepo, dialogue_events::DialogueEventsRepo, journeys::JourneysRepo},
    },
    error::{MetisError, Result},
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct TeachingInitParams {
    pub journey_id: i64,
}

pub fn teaching_init(params: TeachingInitParams, context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let artifacts = JourneysRepo::get_artifacts(params.journey_id)?.ok_or(
            MetisError::NotFound(format!("journey artifacts {}", params.journey_id)),
        )?;

        let teaching_state = TeachingContext {
            artifacts: Some(Persistent::new(artifacts)),
        };

        let mut ctx = context.teaching.lock().await;
        *ctx = teaching_state;

        let last = DialoguesRepo::get_last_for_journey(params.journey_id)?;
        let (dialogue_id, event_history) = match last {
            Some(d) => {
                let id = d.id.unwrap();
                let history = DialogueEventsRepo::get_for_dialogue(id)?;
                (Some(id), history)
            }
            None => (None, crate::logs::EventHistory::new()),
        };

        let mut ctx = context.chat.lock().await;
        ctx.phase = MetisPhase::Teaching;
        ctx.is_done = false;
        ctx.dialogue_id = dialogue_id;
        ctx.event_history = event_history;

        Ok(json!({ "success": true }).into())
    })
}
