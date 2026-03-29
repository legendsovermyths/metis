use std::{
    collections::HashMap,
    sync::{Arc, Mutex, OnceLock},
};

use serde::{de::DeserializeOwned, Deserialize};
use serde_json::Value;
use tokio::runtime::Runtime;

static RUNTIME: OnceLock<Runtime> = OnceLock::new();

pub fn runtime() -> &'static Runtime {
    RUNTIME.get_or_init(|| Runtime::new().unwrap())
}

use crate::{
    api::request::{
        handlers::{analyse_book::analyse_book_handler, get_all_books::get_all_books},
        RequestType,
    },
    error::{MetisError, Result},
    logs::{Event, EventType},
};

pub struct ServiceHandler {
    handlers: HashMap<RequestType, Box<dyn RequestHandler>>,
}

struct TypedHandler<T> {
    func: fn(T) -> Result<Value>,
}

trait RequestHandler: Send + Sync {
    fn handle(&self, params: Value) -> Result<Value>;
}

impl<T: DeserializeOwned> RequestHandler for TypedHandler<T> {
    fn handle(&self, params: Value) -> Result<Value> {
        let parsed: T = serde_json::from_value(params)
            .map_err(|err| MetisError::ValueParseError(err.to_string()))?;
        (self.func)(parsed)
    }
}

impl<T> TypedHandler<T> {
    fn make_handler(func: fn(T) -> Result<Value>) -> Self {
        TypedHandler { func }
    }
}

impl ServiceHandler {
    pub fn new() -> Self {
        let mut handler = Self {
            handlers: HashMap::new(),
        };
        handler.register(
            RequestType::AnalyseBook,
            Box::new(TypedHandler::make_handler(analyse_book_handler)),
        );
        handler.register(
            RequestType::GetAllBooks,
            Box::new(TypedHandler::make_handler(get_all_books)),
        );
        handler
    }
    pub fn handle(&mut self, request: RequestType, params: Value) -> Result<Value> {
        let maybe_handler = self.handlers.get(&request);
        Self::create_event(&request, &params);
        if let Some(handler) = maybe_handler {
            handler.handle(params)
        } else {
            Err(MetisError::InvalidRequest)
        }
    }
    fn register(&mut self, request: RequestType, handler: Box<dyn RequestHandler>) {
        self.handlers.insert(request, handler);
    }
    fn create_event(request: &RequestType, params: &Value) -> Event {
        Event::new(
            request.to_string(),
            EventType::UserRequest,
            params.to_string(),
        )
    }
}
