use std::sync::{Arc, OnceLock};

use serde::{Deserialize, Serialize, Serializer};
use serde_json::{json, Value};
use tauri::AppHandle;
use tokio::sync::Mutex;

use crate::agent::handler::AgentHandler;
use crate::api::request::Request;
use crate::app::state::{MetisPhase, TeachingContext};
use crate::db::repo::appdata::AppDataRepo;
use crate::error::{MetisError, Result};
use crate::logs::EventHistory;
use crate::service::handler::ServiceHandler;
use crate::task::manager::TaskMangager;
use crate::task::TaskRequest;
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
    task_manager: TaskMangager,
    pub context: &'a AppContext,
}

impl App<'_> {
    pub fn new(context: &'static AppContext, app_handle: AppHandle) -> Result<Self> {
        ensure_venv()?;
        let task_manager = TaskMangager::new(app_handle);
        task_manager.resume();
        Ok(Self {
            request_handler: ServiceHandler::with(context),
            agent_handler: AgentHandler::with(context),
            task_manager,
            context,
        })
    }

    pub async fn handle_request(&self, request: Request) -> Result<Value> {
        match request {
            Request::Service { request_type, params } => {
                let service_response = self.request_handler.handle(request_type, params).await?;
                let _ = self.dispatch_tasks(service_response.task_request).await;
                Ok(service_response.response)
            }
            Request::UserMessage { params } => self.agent_handler.handle(params).await,
            Request::Task { task_type, params } => {
                let task_id = self.task_manager.dispatch(task_type, params).await?;
                Ok(json!({ "task_id": task_id }))
            }
        }
    }
    pub async fn dispatch_tasks(&self, tasks: Option<Vec<TaskRequest>>) -> Result<()> {
        if let Some(task_requests) = tasks {
            for task_request in task_requests.iter() {
                let _id = self
                    .task_manager
                    .dispatch(task_request.task_type, task_request.params.clone())
                    .await?;
            }
        }
        Ok(())
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
