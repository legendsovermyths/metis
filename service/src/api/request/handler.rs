use std::{
    collections::HashMap,
    sync::{Arc, Mutex, OnceLock},
};

use serde::de::DeserializeOwned;
use serde_json::Value;
use tokio::runtime::Runtime;

static RUNTIME: OnceLock<Runtime> = OnceLock::new();

pub fn runtime() -> &'static Runtime {
    RUNTIME.get_or_init(|| Runtime::new().unwrap())
}

use crate::{
    api::request::{
        handlers::{
            analyse_book::analyse_book_handler,
            generate_course::generate_course_handler,
            get_all_books::get_all_books,
            get_all_journeys::get_all_journeys,
            get_context::{self, get_context},
            get_journey::get_journey,
            set_context::{self, set_context},
        },
        RequestType,
    },
    app::AppContext,
    error::{MetisError, Result},
    logs::{Event, EventType},
};

pub struct ServiceHandler {
    handlers: HashMap<RequestType, Box<dyn RequestHandler>>,
    context: Arc<Mutex<AppContext>>,
}

struct TypedHandler<T> {
    func: fn(T, Arc<Mutex<AppContext>>) -> Result<Value>,
}

trait RequestHandler: Send + Sync {
    fn handle(&self, params: Value, context: Arc<Mutex<AppContext>>) -> Result<Value>;
}

impl<T: DeserializeOwned> RequestHandler for TypedHandler<T> {
    fn handle(&self, params: Value, context: Arc<Mutex<AppContext>>) -> Result<Value> {
        let parsed: T = serde_json::from_value(params)
            .map_err(|err| MetisError::ValueParseError(err.to_string()))?;
        (self.func)(parsed, context)
    }
}

impl<T> TypedHandler<T> {
    fn make_handler(func: fn(T, Arc<Mutex<AppContext>>) -> Result<Value>) -> Self {
        TypedHandler { func }
    }
}

impl ServiceHandler {
    pub fn with(context: Arc<Mutex<AppContext>>) -> Self {
        let mut handler = Self {
            handlers: HashMap::new(),
            context,
        };
        handler.register(
            RequestType::AnalyseBook,
            Box::new(TypedHandler::make_handler(analyse_book_handler)),
        );
        handler.register(
            RequestType::GenerateCourse,
            Box::new(TypedHandler::make_handler(generate_course_handler)),
        );
        handler.register(
            RequestType::GetAllBooks,
            Box::new(TypedHandler::make_handler(get_all_books)),
        );
        handler.register(
            RequestType::GetAllJourneys,
            Box::new(TypedHandler::make_handler(get_all_journeys)),
        );
        handler.register(
            RequestType::GetJourney,
            Box::new(TypedHandler::make_handler(get_journey)),
        );
        handler.register(
            RequestType::GetContext,
            Box::new(TypedHandler::make_handler(get_context)),
        );
        handler.register(
            RequestType::SetContext,
            Box::new(TypedHandler::make_handler(set_context)),
        );
        handler
    }
    pub fn handle(&mut self, request: RequestType, params: Value) -> Result<Value> {
        let maybe_handler = self.handlers.get(&request);
        Self::create_event(&request, &params);
        if let Some(handler) = maybe_handler {
            handler.handle(params, Arc::clone(&self.context))
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
