use serde::Serialize;
use serde_json::Value;

use crate::app::AppContextValue;


#[derive(Serialize)]
pub struct Response {
    response: Option<Value>,
    status: Status,
    pub context: Option<AppContextValue>,
}

#[derive(Serialize)]
pub enum Status {
    Success,
    Error(String),
}

impl Response {
    pub fn ok(value: Value) -> Self {
        Response {
            response: Some(value),
            status: Status::Success,
            context: None,
        }
    }
    pub fn err(value: String) -> Self {
        Response {
            response: None,
            status: Status::Error(value),
            context: None,
        }
    }
}
