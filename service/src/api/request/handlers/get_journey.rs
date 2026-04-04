use std::sync::{Arc, Mutex};

use serde::Deserialize;
use serde_json::Value;

use crate::{
    app::AppContext,
    db::repo::journeys::JourneysRepo,
    error::{MetisError, Result},
};

#[derive(Deserialize)]
pub struct GetJourneyParams {
    id: i64,
}

pub fn get_journey(params: GetJourneyParams, _: Arc<Mutex<AppContext>>) -> Result<Value> {
    let row = JourneysRepo::get(params.id)?
        .ok_or_else(|| MetisError::MetisError("Journey not found".to_string()))?;
    Ok(serde_json::to_value(row)?)
}
