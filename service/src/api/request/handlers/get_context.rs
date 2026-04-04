use std::sync::{Arc, Mutex};

use serde::Deserialize;
use serde_json::Value;

use crate::{app::AppContext, error::Result};

#[derive(Deserialize)]
pub struct GetContextParams;

pub fn get_context(_: GetContextParams, context: Arc<Mutex<AppContext>>) -> Result<Value> {
    let app_context = context.lock().unwrap().clone();
    Ok(serde_json::to_value(app_context)?)
}
