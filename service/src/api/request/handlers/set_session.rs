
use serde_json::json;

use crate::{
    api::request::handler::BoxFuture,
    app::{AppContext, SessionContext},
};

pub fn set_session(session: SessionContext, context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        *context.session.lock().await = session;
        Ok(json!({"success" : true}))
    })
}
