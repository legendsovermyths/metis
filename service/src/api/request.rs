use serde::Deserialize;
use serde_json::Value;

use crate::{api::ApiType, task::task_type::TaskType};


#[derive(Deserialize)]
pub struct Request {
    pub api_type: ApiType,
    pub request_type: Option<RequestType>,
    pub params: Value,
}


#[derive(PartialEq, Eq, Hash, Deserialize)]
pub enum RequestType {
    AnalyseBook,
    CreateJourney,
    GetAllBooks,
    GetAllDialogues,
    GetAllJourneys,
    GenerateDialgues,
    GetContext,
    GetJourney,
    GetNextDialogue,
    TeachingInit,
    SetTeaching,
    SetSession,
    SetChat,
}

impl std::fmt::Display for RequestType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let variant = match self {
            RequestType::AnalyseBook => "analyse_book",
            RequestType::GenerateDialgues => "generate_dialogues",
            RequestType::GetAllBooks => "get_all_books",
            RequestType::GetAllDialogues => "get_all_dialogues",
            RequestType::GetAllJourneys => "get_all_journeys",
            RequestType::GetContext => "get_context",
            RequestType::GetJourney => "get_journey",
            RequestType::GetNextDialogue => "get_next_dialogue",
            RequestType::TeachingInit => "teaching_init",
            RequestType::SetChat => "set_chat",
            RequestType::SetSession => "set_session",
            RequestType::SetTeaching => "set_teaching",
            RequestType::CreateJourney => "create_journey"
        };
        write!(f, "{}", variant)
    }
}

impl Into<TaskType> for RequestType{
    fn into(self) -> TaskType {
        match self {
            Self::AnalyseBook => TaskType::AnalyseBook,
            Self::CreateJourney => TaskType::CreateJourney,
            Self::GenerateDialgues => TaskType::GenerateDialogues,
            _=>TaskType::InvalidTask
            
        }
    }
}
