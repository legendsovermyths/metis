
use serde::Serialize;

use crate::error::Result;

pub mod advisor;
pub mod handler;
pub mod onboarder;

pub trait Agent: Send + Sync {
    fn generate(&mut self, message: Option<String>) -> Result<AgentResponse>;
}

#[derive(Serialize)]
struct AgentResponse {
    message: String,
}

impl AgentResponse{
    fn with(message: String)->Self{
       Self { message } 
    }
}
