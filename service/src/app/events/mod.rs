use chrono::Local;
use serde::{Deserialize, Serialize};

use crate::logs::{self, Level, Loggable};

pub type Events = Vec<Event>;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub enum EventType {
    UserMessage,
    LlmMessage,
    FunctionCall,
    FunctionResponse,
    UserRequest,
}

impl std::fmt::Display for EventType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let label = match self {
            EventType::UserMessage => "user_message",
            EventType::LlmMessage => "llm_message",
            EventType::FunctionCall => "function_call",
            EventType::FunctionResponse => "function_response",
            EventType::UserRequest => "user_request",
        };
        write!(f, "{}", label)
    }
}

impl rusqlite::ToSql for EventType {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        Ok(rusqlite::types::ToSqlOutput::from(self.to_string()))
    }
}

impl rusqlite::types::FromSql for EventType {
    fn column_result(value: rusqlite::types::ValueRef<'_>) -> rusqlite::types::FromSqlResult<Self> {
        match value.as_str()? {
            "llm_message" => Ok(EventType::LlmMessage),
            "function_call" => Ok(EventType::FunctionCall),
            "function_response" => Ok(EventType::FunctionResponse),
            "user_request" => Ok(EventType::UserRequest),
            _ => Ok(EventType::UserMessage),
        }
    }
}

#[derive(Clone, Deserialize, Serialize)]
pub struct Event {
    pub name: String,
    pub event_type: EventType,
    pub content: String,
    pub timestamp: String,
}

impl Event {
    pub fn new(name: impl Into<String>, event_type: EventType, content: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            event_type,
            content: content.into(),
            timestamp: Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        }
    }
}

impl Loggable for Event {
    fn log_target(&self) -> &'static str {
        "event"
    }

    fn log_level(&self) -> Level {
        Level::Debug
    }

    fn log_summary(&self) -> String {
        format!(
            "{} ({}) {}",
            self.event_type,
            self.name,
            logs::preview(&self.content)
        )
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct EventHistory {
    pub events: Events,
}

impl EventHistory {
    pub fn new() -> Self {
        Self { events: vec![] }
    }

    pub fn add_event(&mut self, event: Event) {
        self.events.push(event);
    }
}
