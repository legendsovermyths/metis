use serde::Deserialize;
use serde_json::Value;

use crate::task::task_type::TaskType;

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

#[derive(PartialEq, Eq, Hash, Deserialize)]
pub enum ServiceRequestType {
    GetAllBooks,
    GetAllDialogues,
    GetAllJourneys,
    GetContext,
    GetJourney,
    GetNextDialogue,
    ListTasks,
    TeachingInit,
    SetTeaching,
    SetSession,
    SetChat,
}
