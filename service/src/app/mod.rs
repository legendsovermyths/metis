use std::sync::{Arc, Mutex};

use serde_json::Value;

use crate::agent::handler::AgentHandler;
use crate::api::request::handler::ServiceHandler;
use crate::api::request::Request;
use crate::api::ApiType;
use crate::app::journey::Journey;
use crate::app::state::MetisPhase;
use crate::db::repo::appdata::AppDataRepo;
use crate::error::{MetisError, Result};
pub mod book;
pub mod journey;
pub mod state;

pub struct App {
    context: Arc<Mutex<AppContext>>,
    request_handler: ServiceHandler,
    agent_handler: AgentHandler,
}

impl App {
    pub fn new() -> Result<Self> {
        let context = Arc::new(Mutex::new(AppContext::init()?));
        Ok(Self {
            request_handler: ServiceHandler::new(),
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
            ApiType::UserMessage => {
                self.agent_handler.handle(request.params)
            }
        }
    }
}

pub struct AppContext {
    pub user_profile: Option<String>,
    pub chapter_title: String,
    pub journey_artifacts: Option<Journey>,
    pub chapter_content_dir: Option<String>,
    pub advisor_notes: Option<String>,
    pub active_phase: MetisPhase,
}

impl AppContext {
    pub fn init() -> Result<Self> {
        let user_profile = AppDataRepo::get("user_profile")?;
        Ok(Self {
            user_profile,
            chapter_title: String::new(),
            active_phase: MetisPhase::Onboarding,
            journey_artifacts: None,
            chapter_content_dir: None,
            advisor_notes: None,
        })
    }
}
