use serde::Deserialize;
use serde_json::json;

use crate::{
    app::AppContext, db::repo::explanations::ExplanationsRepo, service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct MoveExplanationParams {
    id: i64,
    folder_id: Option<i64>,
}

pub fn move_explanation(params: MoveExplanationParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        ExplanationsRepo::set_folder(params.id, params.folder_id)?;
        Ok(json!({ "success": true }).into())
    })
}
