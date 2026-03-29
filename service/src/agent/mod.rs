use crate::error::Result;

pub mod onboarder;
pub mod advisor;
pub mod handler;

pub trait Agent: Send + Sync {
    fn generate(&mut self, message: Option<String>) -> Result<String>;
}

