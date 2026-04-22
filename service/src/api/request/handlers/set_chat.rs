use serde_json::json;

use crate::{
    api::request::handler::BoxFuture,
    app::{AppContext, ChatContext},
};

pub fn set_chat(chat: ChatContext, context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        *context.chat.lock().await = chat;
        Ok(json!({"success" : true}))
    })
}
