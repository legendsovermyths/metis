use std::{collections::HashMap, future::Future, pin::Pin};

use serde::de::DeserializeOwned;
use serde_json::Value;

use crate::{
    api::request::ServiceRequestType,
    app::AppContext,
    error::{MetisError, Result},
    service::handlers::{
        cancel_user_input::cancel_user_input, create_folder::create_folder, create_note::create_note, delete_explanation::delete_explanation, delete_folder::delete_folder, delete_journey::{self, delete_journey}, delete_note::delete_note, move_note::move_note, get_all_books::get_all_books, get_all_dialogues::get_all_dialogues, get_all_explanations::get_all_explanations, get_explanation::get_explanation, get_all_journeys::get_all_journeys, get_all_notes::get_all_notes, get_artifact::get_artifact, get_context::get_context, get_folders::get_folders, get_journey::get_journey, get_next_dialogue::get_next_dialogue, list_tasks::list_tasks, move_explanation::move_explanation, move_journey::move_journey, move_folder::move_folder, rename_folder::rename_folder, set_chat::set_chat, set_dialogue::set_dialogue, set_session::set_session, set_teaching::set_teaching, submit_user_input::submit_user_input, teaching_init::teaching_init, update_note::update_note
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
        handler.register(ServiceRequestType::SetDialogue, set_dialogue);
        handler.register(ServiceRequestType::SetSession, set_session);
        handler.register(ServiceRequestType::SetTeaching, set_teaching);
        handler.register(ServiceRequestType::DeleteJourney, delete_journey);
        handler.register(ServiceRequestType::SubmitUserInput, submit_user_input);
        handler.register(ServiceRequestType::CancelUserInput, cancel_user_input);
        handler.register(ServiceRequestType::GetArtifact, get_artifact);
        handler.register(ServiceRequestType::GetAllExplanations, get_all_explanations);
        handler.register(ServiceRequestType::GetExplanation, get_explanation);
        handler.register(ServiceRequestType::DeleteExplanation, delete_explanation);
        handler.register(ServiceRequestType::MoveExplanation, move_explanation);
        handler.register(ServiceRequestType::MoveJourney, move_journey);
        handler.register(ServiceRequestType::GetFolders, get_folders);
        handler.register(ServiceRequestType::CreateFolder, create_folder);
        handler.register(ServiceRequestType::RenameFolder, rename_folder);
        handler.register(ServiceRequestType::MoveFolder, move_folder);
        handler.register(ServiceRequestType::DeleteFolder, delete_folder);
        handler.register(ServiceRequestType::CreateNote, create_note);
        handler.register(ServiceRequestType::GetAllNotes, get_all_notes);
        handler.register(ServiceRequestType::UpdateNote, update_note);
        handler.register(ServiceRequestType::DeleteNote, delete_note);
        handler.register(ServiceRequestType::MoveNote, move_note);
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
