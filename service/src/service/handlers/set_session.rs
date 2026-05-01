use serde_json::json;

use crate::{
    app::{AppContext, SessionContext},
    service::handler::BoxFuture,
};

pub fn set_session(session: SessionContext, context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        *context.session.lock().await = session;
        Ok(json!({"success" : true}).into())
    })
}
