use serde::Serialize;
use serde_json::Value;

#[derive(Serialize)]
pub struct Response {
    response: Option<Value>,
    status: Status,
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
        }
    }
    pub fn err(value: String) -> Self {
        Response {
            response: None,
            status: Status::Error(value),
        }
    }
}
