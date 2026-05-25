use serde_json::json;

use crate::{
    app::{state::MetisPhase, AppContext, ChatContext}, service::handler::BoxFuture,
};

pub fn set_chat(mut chat: ChatContext, context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        if chat.phase != MetisPhase::Teaching {
            chat.dialogue_id = None;
        }
        *context.chat.lock().await = chat;
        Ok(json!({"success" : true}).into())
    })
}
