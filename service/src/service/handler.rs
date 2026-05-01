use std::{collections::HashMap, future::Future, pin::Pin};

use serde::de::DeserializeOwned;
use serde_json::Value;

use crate::{
    api::request::ServiceRequestType,
    app::AppContext,
    error::{MetisError, Result},
    service::handlers::{
        get_all_books::get_all_books, get_all_dialogues::get_all_dialogues,
        get_all_journeys::get_all_journeys, get_context::get_context,
        get_journey::get_journey, get_next_dialogue::get_next_dialogue,
        list_tasks::list_tasks, set_chat::set_chat, set_session::set_session,
        set_teaching::set_teaching, teaching_init::teaching_init,
    },
    task::{task_type::TaskType, TaskRequest},
};

pub type BoxFuture<'a> = Pin<Box<dyn Future<Output = Result<ServiceResponse>> + Send + 'a>>;
type HandlerFn = Box<dyn for<'a> Fn(Value, &'a AppContext) -> BoxFuture<'a> + Send + Sync>;

pub struct ServiceHandler<'a> {
    handlers: HashMap<ServiceRequestType, HandlerFn>,
    context: &'a AppContext,
}

pub struct ServiceResponse {
    pub response: Value,
    pub task_request: Option<Vec<TaskRequest>>,
}

impl<'a> ServiceHandler<'a> {
    pub fn with(context: &'a AppContext) -> Self {
        let mut handler = Self {
            handlers: HashMap::new(),
            context,
        };

        handler.register(ServiceRequestType::GetAllBooks, get_all_books);
        handler.register(ServiceRequestType::GetAllDialogues, get_all_dialogues);
        handler.register(ServiceRequestType::GetAllJourneys, get_all_journeys);
        handler.register(ServiceRequestType::GetJourney, get_journey);
        handler.register(ServiceRequestType::GetNextDialogue, get_next_dialogue);
        handler.register(ServiceRequestType::GetContext, get_context);
        handler.register(ServiceRequestType::ListTasks, list_tasks);
        handler.register(ServiceRequestType::TeachingInit, teaching_init);
        handler.register(ServiceRequestType::SetChat, set_chat);
        handler.register(ServiceRequestType::SetSession, set_session);
        handler.register(ServiceRequestType::SetTeaching, set_teaching);
        handler
    }
    fn register<T, F>(&mut self, request: ServiceRequestType, func: F)
    where
        F: for<'b> Fn(T, &'b AppContext) -> BoxFuture<'b> + Send + Sync + 'static,
        T: DeserializeOwned + 'static,
    {
        let handler: Box<dyn for<'b> Fn(Value, &'b AppContext) -> BoxFuture<'b> + Send + Sync> =
            Box::new(move |value: Value, context: &AppContext| {
                let parsed: T = serde_json::from_value(value).unwrap();
                func(parsed, context)
            });
        self.handlers.insert(request, handler);
    }

    pub async fn handle(&self, request: ServiceRequestType, params: Value) -> Result<ServiceResponse> {
        let handler = self
            .handlers
            .get(&request)
            .ok_or(MetisError::InvalidRequest)?;
        Ok(handler(params, &self.context).await?)
    }
}

impl Into<ServiceResponse> for Value {
    fn into(self) -> ServiceResponse {
        ServiceResponse {
            response: self,
            task_request: None,
        }
    }
}
