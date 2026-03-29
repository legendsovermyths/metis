use serde::Deserialize;

pub mod request;
pub mod response;

#[derive(Deserialize)]
pub enum ApiType{
    UserMessage,
    Service
}


