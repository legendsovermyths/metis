use std::sync::{Arc, Mutex};

use serde::Deserialize;
use serde_json::Value;

use crate::{
    api::request::handler::BoxFuture,
    app::AppContext,
    db::repo::journeys::JourneysRepo,
    error::{MetisError, Result},
};

#[derive(Deserialize)]
pub struct GetJourneyParams {
    id: i64,
}

pub fn get_journey(params: GetJourneyParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let row = JourneysRepo::get(params.id)?
            .ok_or_else(|| MetisError::NotFound(format!("journey {}", params.id)))?;
        Ok(serde_json::to_value(row)?)
    })
}
