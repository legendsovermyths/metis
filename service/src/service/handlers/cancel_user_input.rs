use serde::Deserialize;
use serde_json::json;

use crate::{
    app::AppContext, bridges::user_input::UserInputBridge, service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct CancelUserInputParams {
    pub request_id: String,
}

pub fn cancel_user_input(params: CancelUserInputParams, _context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        UserInputBridge::cancel(&params.request_id).await;
        Ok(json!({ "success": true }).into())
    })
}
