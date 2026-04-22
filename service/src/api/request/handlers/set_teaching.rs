use serde_json::json;

use crate::{
    api::request::handler::BoxFuture,
    app::{state::TeachingContext, AppContext},
};

pub fn set_teaching(teaching: TeachingContext, context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        *context.teaching.lock().await = teaching;
        Ok(json!({"success" : true}))
    })
}
