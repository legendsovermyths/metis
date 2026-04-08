use std::sync::{Arc, Mutex};

use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    app::{
        journey::{ArcProgress, JourneyArtifacts},
        state::{MetisPhase, TeachingState},
        AppContext,
    },
    db::repo::journeys::JourneysRepo,
    error::{MetisError, Result},
};

#[derive(Deserialize)]
pub struct TeachingInitParams {
    pub journey_id: i64,
}

pub fn teaching_init(params: TeachingInitParams, context: Arc<Mutex<AppContext>>) -> Result<Value> {
    let row = JourneysRepo::get(params.journey_id)?
        .ok_or(MetisError::MetisError("Journey not found".into()))?;

    let mut progress = row.progress;

    while progress.arcs.len() < row.journey.arcs.len() {
        progress.arcs.push(ArcProgress::default());
    }

    if row.journey.arcs.get(progress.arc_idx).is_none() {
        return Err(MetisError::MetisError("Journey already complete".into()));
    }

    let artifacts = JourneyArtifacts {
        id: Some(row.id),
        chapter_title: row.chapter_title,
        chapter_dir: row.chapter_dir,
        journey: row.journey,
        advisor_notes: row.advisor_notes,
    };

    let teaching_state = TeachingState {
        journey: artifacts,
        progress,
    };

    {
        let mut ctx = context.lock().unwrap();
        ctx.teaching_state = Some(teaching_state);
        ctx.chat_state.phase = MetisPhase::Teaching;
        ctx.chat_state.is_done = false;
    }

    Ok(json!({ "ok": true }))
}
