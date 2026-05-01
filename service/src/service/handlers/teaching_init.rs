use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    app::{
        state::{MetisPhase, TeachingContext},
        AppContext,
    },
    db::{persistence::Persistent, repo::journeys::JourneysRepo},
    error::{MetisError, Result}, service::handler::BoxFuture,
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
        let mut ctx = context.chat.lock().await;
        ctx.phase = MetisPhase::Teaching;
        ctx.is_done = false;

        Ok(json!({ "success": true }).into())
    })
}
