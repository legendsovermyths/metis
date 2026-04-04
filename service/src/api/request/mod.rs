use serde::Deserialize;
use serde_json::Value;

use crate::api::ApiType;

pub mod handler;
pub mod handlers;

#[derive(PartialEq, Eq, Hash, Deserialize)]
pub enum RequestType {
    AnalyseBook,
    GenerateCourse,
    GetAllBooks,
    GetAllJourneys,
    GetContext,
    GetJourney,
    SetContext,
}

impl std::fmt::Display for RequestType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        let variant = match self {
            RequestType::AnalyseBook => "analyse_book",
            RequestType::GenerateCourse => "generate_course",
            RequestType::GetAllBooks => "get_all_books",
            RequestType::GetAllJourneys => "get_all_journeys",
            RequestType::GetContext => "get_context",
            RequestType::GetJourney => "get_journey",
            RequestType::SetContext => "set_context",
        };
        write!(f, "{}", variant)
    }
}

#[derive(Deserialize)]
pub struct Request {
    pub api_type: ApiType,
    pub request_type: Option<RequestType>,
    pub params: Value,
}
