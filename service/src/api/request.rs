use serde::Deserialize;
use serde_json::Value;

use crate::{
    logs::{self, Loggable},
    task::task_type::TaskType,
};

#[derive(Deserialize)]
#[serde(tag = "api_type")]
pub enum Request {
    Service {
        request_type: ServiceRequestType,
        params: Value,
    },
    Task {
        task_type: TaskType,
        params: Value,
    },
    UserMessage {
        params: Value,
    },
}

impl Loggable for Request {
    fn log_target(&self) -> &'static str {
        "request"
    }

    fn log_summary(&self) -> String {
        match self {
            Request::Service {
                request_type,
                params,
            } => format!("service {request_type:?} {}", logs::preview(&params.to_string())),
            Request::Task { task_type, params } => {
                format!("task {task_type:?} {}", logs::preview(&params.to_string()))
            }
            Request::UserMessage { params } => {
                format!("user_message {}", logs::preview(&params.to_string()))
            }
        }
    }
}

#[derive(Debug, PartialEq, Eq, Hash, Deserialize)]
pub enum ServiceRequestType {
    GetAllResources,
    GetAllDialogues,
    GetAllJourneys,
    GetContext,
    GetJourney,
    GetNextDialogue,
    ListTasks,
    TeachingInit,
    SetTeaching,
    SetChat,
    SetDialogue,
    SubmitUserInput,
    CancelUserInput,
    DeleteJourney,
    GetArtifact,
    GetAllExplanations,
    GetExplanation,
    DeleteExplanation,
    MoveExplanation,
    MoveJourney,
    GetFolders,
    CreateFolder,
    RenameFolder,
    MoveFolder,
    DeleteFolder,
    CreateNote,
    GetAllNotes,
    UpdateNote,
    DeleteNote,
    MoveNote,
}
