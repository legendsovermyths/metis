use serde_json::json;

use crate::{
    app::{state::MetisPhase, AppContext, ChatContext}, app::events::EventHistory, service::handler::BoxFuture,
};

pub fn set_chat(mut chat: ChatContext, context: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        if chat.phase != MetisPhase::Teaching {
            chat.dialogue_id = None;
        }
        let mut current = context.chat.lock().await;
        if chat.phase != current.phase {
            chat.event_history = EventHistory::new();
        }
        *current = chat;
        Ok(json!({"success" : true}).into())
    })
}
