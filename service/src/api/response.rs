use serde::Serialize;
use serde_json::Value;

use crate::{
    app::AppContextValue,
    logs::{self, Level, Loggable},
};

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

impl Loggable for Response {
    fn log_target(&self) -> &'static str {
        "response"
    }

    fn log_level(&self) -> Level {
        match self.status {
            Status::Error(_) => Level::Error,
            Status::Success => Level::Info,
        }
    }

    fn log_summary(&self) -> String {
        match &self.status {
            Status::Success => {
                let body = self
                    .response
                    .as_ref()
                    .map(|v| v.to_string())
                    .unwrap_or_default();
                format!("ok {}", logs::preview(&body))
            }
            Status::Error(e) => format!("error {e}"),
        }
    }
}
