use std::sync::{Arc, Mutex};

use serde_json::Value;

use crate::{app::AppContext, error::Result};

pub type Parameters = Vec<Parameter>;


pub struct Parameter {
    pub name: String,
    pub parameter_type: String,
    pub description: String,
}


pub trait Tool: Send + Sync {
    fn execute(&self, value: Value, context: Arc<Mutex<AppContext>>) -> Result<Value>;
    fn name(&self) -> &str;
    fn description(&self) -> &str;
    fn parameters(&self) -> Parameters; 
}
