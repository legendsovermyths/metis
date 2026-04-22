use std::{collections::HashMap, future::Future, pin::Pin};

use serde::de::DeserializeOwned;
use serde_json::Value;

use crate::{
    api::request::{
        handlers::{
            analyse_book::analyse_book_handler, generate_course::generate_course_handler,
            get_all_books::get_all_books, get_all_journeys::get_all_journeys,
            get_context::get_context, get_journey::get_journey, set_chat::set_chat,
            set_session::set_session, set_teaching::set_teaching, teaching_init::teaching_init,
        },
        RequestType,
    },
    app::AppContext,
    error::{MetisError, Result},
};

pub type BoxFuture<'a> = Pin<Box<dyn Future<Output = Result<Value>> + Send + 'a>>;
type HandlerFn = Box<dyn for<'a> Fn(Value, &'a AppContext) -> BoxFuture<'a> + Send + Sync>;

pub struct ServiceHandler<'a> {
    handlers: HashMap<RequestType, HandlerFn>,
    context: &'a AppContext,
}

impl<'a> ServiceHandler<'a> {
    pub fn with(context: &'a AppContext) -> Self {
        let mut handler = Self {
            handlers: HashMap::new(),
            context,
        };

        handler.register(RequestType::AnalyseBook, analyse_book_handler);
        handler.register(RequestType::GenerateCourse, generate_course_handler);
        handler.register(RequestType::GetAllBooks, get_all_books);
        handler.register(RequestType::GetAllJourneys, get_all_journeys);
        handler.register(RequestType::GetJourney, get_journey);
        handler.register(RequestType::GetContext, get_context);
        handler.register(RequestType::TeachingInit, teaching_init);
        handler.register(RequestType::SetChat, set_chat);
        handler.register(RequestType::SetSession, set_session);
        handler.register(RequestType::SetTeaching, set_teaching);
        handler
    }
    fn register<T, F>(&mut self, request: RequestType, func: F)
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

    pub async fn handle(&self, request: RequestType, params: Value) -> Result<Value> {
        let handler = self
            .handlers
            .get(&request)
            .ok_or(MetisError::InvalidRequest)?;
        Ok(handler(params, &self.context).await?)
    }
}
