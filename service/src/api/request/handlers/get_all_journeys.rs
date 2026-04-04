use std::sync::{Arc, Mutex};

use serde::Deserialize;
use serde_json::Value;

use crate::{
    app::AppContext,
    db::repo::journeys::JourneysRepo,
    error::Result,
};

#[derive(Deserialize)]
pub struct GetAllJourneysParams;

pub fn get_all_journeys(_: GetAllJourneysParams, _: Arc<Mutex<AppContext>>) -> Result<Value> {
    let rows = JourneysRepo::get_all()?;
    Ok(serde_json::to_value(rows)?)
}
