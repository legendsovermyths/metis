use std::sync::{Arc, Mutex};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};

use crate::{app::AppContext, error::Result};

#[derive(Deserialize)]
pub struct SetContextParams {
    context: AppContext,
}

pub fn set_context(context_params: SetContextParams, context: Arc<Mutex<AppContext>>) -> Result<Value> {
    let mut gaurd = context.lock().unwrap();
    *gaurd = context_params.context;
    Ok(json!({}))
}
