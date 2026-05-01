use serde_json::json;

use crate::{
    app::{state::TeachingContext, AppContext}, service::handler::BoxFuture,
};

pub fn set_teaching(teaching: TeachingContext, context: &AppContext) -> BoxFuture{
    Box::pin(async move {
        *context.teaching.lock().await = teaching;
        Ok(json!({"success" : true}).into())
    })
}
