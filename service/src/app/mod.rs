use std::sync::{Arc, OnceLock};

use serde::{Deserialize, Serialize, Serializer};
use serde_json::Value;
use tokio::sync::Mutex;

use crate::agent::handler::AgentHandler;
use crate::api::request::handler::ServiceHandler;
use crate::api::request::Request;
use crate::api::ApiType;
use crate::app::state::{MetisPhase, TeachingContext};
use crate::db::repo::appdata::AppDataRepo;
use crate::error::{MetisError, Result};
use crate::logs::EventHistory;
use crate::utils::cmd::ensure_venv;
pub mod book;
pub mod journey;
pub mod state;

static APP_CONTEXT: OnceLock<AppContext> = OnceLock::new();

pub fn init_context() -> Result<&'static AppContext> {
    let ctx = AppContext::init()?;
    APP_CONTEXT
        .set(ctx)
        .map_err(|_| MetisError::OnceLockError("Already initialised".into()))?;
    Ok(APP_CONTEXT.get().unwrap())
}
pub struct App<'a> {
    request_handler: ServiceHandler<'a>,
    agent_handler: AgentHandler<'a>,
    pub context: &'a AppContext
}

impl App<'_> {
    pub fn new(context: &'static AppContext) -> Result<Self> {
        ensure_venv()?;
        Ok(Self {
            request_handler: ServiceHandler::with(context),
            agent_handler: AgentHandler::with(context),
            context
        })
    }

    pub async fn handle_request(&self, request: Request) -> Result<Value> {
        match request.api_type {
            ApiType::Service => {
                let request_type = request.request_type.ok_or(MetisError::RequestTypeMissing)?;
                self.request_handler
                    .handle(request_type, request.params)
                    .await
            }
            ApiType::UserMessage => self.agent_handler.handle(request.params).await,
        }
    }
}

pub struct AppContext {
    pub session: Arc<Mutex<SessionContext>>,
    pub chat: Arc<Mutex<ChatContext>>,
    pub teaching: Arc<Mutex<TeachingContext>>,
}

#[derive(Serialize, Deserialize)]
pub struct AppContextValue {
    pub session: SessionContext,
    pub chat: ChatContext,
    pub teaching: TeachingContext,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct SessionContext {
    pub chapter_title: String,
    pub book_id: Option<i64>,
}

impl SessionContext {
    fn new() -> Self {
        Self {
            chapter_title: String::new(),
            book_id: None,
        }
    }
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ChatContext {
    pub phase: MetisPhase,
    pub notes: Option<String>,
    pub is_done: bool,
    pub event_history: EventHistory,
}

impl ChatContext {
    pub fn with(phase: MetisPhase) -> Self {
        Self {
            phase,
            notes: None,
            is_done: false,
            event_history: EventHistory::new(),
        }
    }
    pub fn set_done(&mut self) {
        self.is_done = true;
    }
}

impl AppContext {
    pub fn init() -> Result<Self> {
        let onboarded = if let Some(_val) = AppDataRepo::get("user_profile")? {
            true
        } else {
            false
        };
        Ok(Self {
            chat: Arc::new(Mutex::new(ChatContext::with(if onboarded {
                MetisPhase::Advising
            } else {
                MetisPhase::Onboarding
            }))),
            session: Arc::new(Mutex::new(SessionContext::new())),
            teaching: Arc::new(Mutex::new(TeachingContext::new())),
        })
    }

    pub async fn value(&self) -> Result<AppContextValue> {
        let chat = self.chat.lock().await.clone();
        let session = self.session.lock().await.clone();
        let teaching = self.teaching.lock().await.clone();
        Ok(AppContextValue {
            session,
            chat,
            teaching,
        })
    }
}
