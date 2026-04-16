use std::sync::{Arc, Mutex};

use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    app::{
        state::{MetisPhase, TeachingState},
        AppContext,
    },
    db::{persistence::Persistent, repo::journeys::JourneysRepo},
    error::{MetisError, Result},
};

#[derive(Deserialize)]
pub struct TeachingInitParams {
    pub journey_id: i64,
}

pub fn teaching_init(params: TeachingInitParams, context: Arc<Mutex<AppContext>>) -> Result<Value> {
    let artifacts = JourneysRepo::get_artifacts(params.journey_id)?.ok_or(
        MetisError::MetisError("Journey id was not found in the database".into()),
    )?;

    let teaching_state = TeachingState {
        artifacts: Persistent::new(artifacts),
    };

    let mut ctx = context.lock().unwrap();
    ctx.teaching_state = Some(teaching_state);
    ctx.chat_state.phase = MetisPhase::Teaching;
    ctx.chat_state.is_done = false;

    Ok(json!({ "ok": true }))
}
