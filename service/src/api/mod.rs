use serde::Deserialize;

pub mod response;
pub mod request;

#[derive(Deserialize)]
pub enum ApiType{
    UserMessage,
    Service,
    Task
}


