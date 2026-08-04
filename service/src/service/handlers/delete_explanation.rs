use std::fs;

use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{explanation::artifact::ExplanationArtifacts, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct DeleteExplanationParams {
    id: i64,
}

pub fn delete_explanation(params: DeleteExplanationParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        if let Some(explanation) = Repository::<ExplanationArtifacts>::try_find_by_id(&params.id)? {
            let _ = fs::remove_dir_all(&explanation.read().explanation_directory);
        }
        Repository::<ExplanationArtifacts>::delete(&params.id)?;
        Ok(json!({ "success": true }).into())
    })
}
