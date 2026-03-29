use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::{Path, PathBuf};
use std::sync::{LazyLock, Mutex};

use chrono::Local;

const LOG_DIR: &str = "../metis_logs";

static LOGGER: LazyLock<Mutex<Logger>> = LazyLock::new(|| Mutex::new(Logger::new()));

pub type Events = Vec<Event>;

#[derive(Debug)]
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

pub struct Event {
    pub name: String,
    pub event_type: EventType,
    pub content: String,
    pub timestamp: String,
}

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

impl Event {
    pub fn new(name: impl Into<String>, event_type: EventType, content: impl Into<String>) -> Self {
        let event = Self {
            name: name.into(),
            event_type,
            content: content.into(),
            timestamp: Local::now().format("%Y-%m-%d %H:%M:%S").to_string(),
        };
        LOGGER.lock().expect("logger lock poisoned").log(&event);
        event
    }
}

struct Logger {
    log_file: PathBuf,
}

impl Logger {
    fn new() -> Self {
        let log_dir = Path::new(LOG_DIR);
        fs::create_dir_all(log_dir).expect("Failed to create metis_logs directory");

        let session_ts = Local::now().format("%Y-%m-%d_%H-%M-%S");
        let log_file = log_dir.join(format!("session_{session_ts}.log"));

        let header = format!("METIS V2 - Session Log\nStarted at {session_ts}\n\n");

        let mut file = fs::File::create(&log_file).expect("Failed to create log file");
        file.write_all(header.as_bytes())
            .expect("Failed to write log header");

        Self { log_file }
    }

    fn log(&self, event: &Event) {
        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_file)
            .expect("Failed to open log file");

        let content = if event.content.len() > 500 {
            format!("{}...", &event.content[..500])
        } else {
            event.content.clone()
        };

        let entry = format!(
            "[{timestamp}] {event_type} ({name})\n{content}\n\n",
            timestamp = event.timestamp,
            event_type = event.event_type,
            name = event.name,
            content = content,
        );

        file.write_all(entry.as_bytes())
            .expect("Failed to write event to log");
    }
}
