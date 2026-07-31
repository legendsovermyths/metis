use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{explanation::ExplanationArtifacts, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct MoveExplanationParams {
    id: i64,
    folder_id: Option<i64>,
}

pub fn move_explanation(params: MoveExplanationParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let mut explanation = Repository::<ExplanationArtifacts>::find_by_id(&params.id)?;
        explanation.write().folder_id = params.folder_id;
        Ok(json!({ "success": true }).into())
    })
}
