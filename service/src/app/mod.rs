use std::sync::{Arc, Mutex};

use serde::{Deserialize, Serialize};
use serde_json::Value;

use crate::agent::handler::AgentHandler;
use crate::api::request::handler::ServiceHandler;
use crate::api::request::Request;
use crate::api::ApiType;
use crate::app::journey::JourneyArtifacts;
use crate::app::state::{MetisPhase, TeachingState};
use crate::db::repo::appdata::AppDataRepo;
use crate::error::{MetisError, Result};
use crate::logs::EventHistory;
pub mod book;
pub mod journey;
pub mod state;

pub struct App {
    pub context: Arc<Mutex<AppContext>>,
    request_handler: ServiceHandler,
    agent_handler: AgentHandler,
}

impl App {
    pub fn new() -> Result<Self> {
        let context = Arc::new(Mutex::new(AppContext::init()?));
        Ok(Self {
            request_handler: ServiceHandler::with(Arc::clone(&context)),
            agent_handler: AgentHandler::with(Arc::clone(&context)),
            context,
        })
    }
    pub fn handle_request(&mut self, request: Request) -> Result<Value> {
        match request.api_type {
            ApiType::Service => {
                let request_type = request.request_type.ok_or(MetisError::RequestTypeMissing)?;
                self.request_handler.handle(request_type, request.params)
            }
            ApiType::UserMessage => self.agent_handler.handle(request.params),
        }
    }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct ChatState {
    pub phase: MetisPhase,
    pub notes: Option<String>,
    pub is_done: bool,
    pub event_history: EventHistory,
}

impl ChatState {
    pub fn with(phase: MetisPhase) -> Self {
        ChatState {
            phase,
            notes: None,
            is_done: false,
            event_history: EventHistory::new(),
        }
    }
    pub fn set_done(&mut self){
        self.is_done = true;
    }
}

#[derive(Clone, Serialize, Deserialize)]
pub struct AppContext {
    pub chapter_title: String,
    pub selected_book_id: Option<i64>,
    pub chapter_content_dir: Option<String>,
    pub onboarded: bool,
    pub chat_state: ChatState,
    pub teaching_state: Option<TeachingState>,
}

impl AppContext {
    pub fn init() -> Result<Self> {
        let onboarded = if let Some(_val) = AppDataRepo::get("user_profile")? {
            true
        } else {
            false
        };
        Ok(Self {
            chat_state: ChatState {
                phase: MetisPhase::Idle,
                notes: Some(String::new()),
                is_done: false,
                event_history: EventHistory::new()
            },
            chapter_title: String::new(),
            selected_book_id: None,
            chapter_content_dir: None,
            onboarded,
            teaching_state: None,
        })
    }
}
