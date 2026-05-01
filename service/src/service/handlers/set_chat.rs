use serde_json::json;

use crate::{
    app::{AppContext, ChatContext}, service::handler::BoxFuture,
};

pub fn set_chat(chat: ChatContext, context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        *context.chat.lock().await = chat;
        Ok(json!({"success" : true}).into())
    })
}
