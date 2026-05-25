use async_trait::async_trait;
use serde_json::Value;

use crate::{app::AppContext, error::Result};

pub type Parameters = Vec<Parameter>;


pub struct Parameter {
    pub name: String,
    pub parameter_type: String,
    pub description: String,
}


#[async_trait]
pub trait Tool: Send + Sync {
    async fn execute(&self, value: Value, context: &AppContext) -> Result<Value>;
    fn name(&self) -> &str;
    fn description(&self) -> &str;
    fn parameters(&self) -> Parameters; 
}
