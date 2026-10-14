use std::sync::{Arc, OnceLock};

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::AppHandle;
use tokio::sync::Mutex;

use crate::agent::handler::AgentHandler;
use crate::agent::AgentResponseInstruction;
use crate::api::request::Request;
use crate::app::events::EventHistory;
use crate::app::state::{MetisPhase, TeachingContext};
use crate::db::repo::appdata::AppDataRepo;
use crate::error::{MetisError, Result};
use crate::service::handler::ServiceHandler;
use crate::task::manager::TaskMangager;
use crate::task::TaskRequest;
use crate::utils::python::ensure_venv;
pub mod dialogue;
pub mod events;
pub mod explanation;
pub mod folder;
pub mod journey;
pub mod notes;
pub mod resource;
pub mod state;
pub mod user_input;
pub mod evaluation;

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
    task_manager: Arc<TaskMangager>,
    pub context: &'a AppContext,
}

impl App<'_> {
    pub fn new(context: &'static AppContext, app_handle: AppHandle) -> Result<Self> {
        ensure_venv()?;
        let task_manager = TaskMangager::new(app_handle);
        Ok(Self {
            request_handler: ServiceHandler::with(context),
            agent_handler: AgentHandler::with(context),
            task_manager,
            context,
        })
    }

    pub async fn handle_request(&self, request: Request) -> Result<Value> {
        match request {
            Request::Service {
                request_type,
                params,
            } => {
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

    pub async fn resume(&self) -> Result<()> {
        self.task_manager.resume().await
    }
}

pub struct AppContext {
    pub chat: Arc<Mutex<ChatContext>>,
    pub teaching: Arc<Mutex<TeachingContext>>,
}

#[derive(Serialize, Deserialize)]
pub struct AppContextValue {
    pub chat: ChatContext,
    pub teaching: TeachingContext,
}

#[derive(Serialize, Deserialize, Clone)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum PendingAction {
    Explainer {
        problem_resource_id: i64,
        solution_resource_id: i64,
        notes: String,
    },
    Journey {
        resource_id: i64,
        instruction: AgentResponseInstruction,
        notes: String,
    },
}

#[derive(Serialize, Deserialize, Clone)]
pub struct ChatContext {
    pub phase: MetisPhase,
    pub notes: Option<String>,
    pub is_done: bool,
    pub event_history: EventHistory,
    pub dialogue_id: Option<i64>,
    pub pending_action: Option<PendingAction>,
}

impl ChatContext {
    pub fn with(phase: MetisPhase) -> Self {
        Self {
            phase,
            notes: None,
            is_done: false,
            event_history: EventHistory::new(),
            dialogue_id: None,
            pending_action: None,
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
        let teaching = match AppDataRepo::get("last_study")? {
            Some(raw) => serde_json::from_str(&raw).unwrap_or_default(),
            None => TeachingContext::default(),
        };
        Ok(Self {
            chat: Arc::new(Mutex::new(ChatContext::with(if onboarded {
                MetisPhase::Advising
            } else {
                MetisPhase::Onboarding
            }))),
            teaching: Arc::new(Mutex::new(teaching)),
        })
    }

    pub async fn value(&self) -> Result<AppContextValue> {
        let chat = self.chat.lock().await.clone();
        let teaching = self.teaching.lock().await.clone();
        Ok(AppContextValue { chat, teaching })
    }
}
