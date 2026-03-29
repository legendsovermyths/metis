use std::env::VarError;

use thiserror::Error;

pub type Result<T> = std::result::Result<T, MetisError>;

#[derive(Error, Debug)]
pub enum MetisError{
    #[error("Environment variable is not set")]
    EnvironmentVariableError(#[from] VarError),
    #[error("Request error, some error came in making a request: {0}")]
    RequestError(#[from] reqwest::Error),
    #[error("JSON key not found: {0}")]
    JsonError(String),
    #[error("HTTP Error: {0}")]
    HttpError(String),
    #[error("Tool Error: {0}")]
    ToolError(String),
    #[error("File read error: {0}")]
    FileReadError(String),
    #[error("Value parse error: {0}")]
    ValueParseError(String),
    #[error("Database error: {0}")]
    DatabaseError(#[from] rusqlite::Error),
    #[error("File not found")]
    FileNotFound,
    #[error("Json cannot be converted to this payload: {0}")]
    JsonConversionError(#[from] serde_json::Error),
    #[error("Utils error: {0}")]
    UtilsError(String),
    #[error("Agent errror: {0}")]
    AgentError(String),
    #[error("Invaid Request: the request type doesn't exist")]
    InvalidRequest,
    #[error("Request type not found")]
    RequestTypeMissing
}
