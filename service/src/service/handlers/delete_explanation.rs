use std::fs;

use serde::Deserialize;
use serde_json::json;

use crate::{
    app::AppContext, db::repo::explanations::ExplanationsRepo, service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct DeleteExplanationParams {
    id: i64,
}

pub fn delete_explanation(params: DeleteExplanationParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        if let Some(row) = ExplanationsRepo::get(params.id)? {
            let _ = fs::remove_dir_all(&row.explanation_dir);
        }
        ExplanationsRepo::delete_single(params.id)?;
        Ok(json!({ "success": true }).into())
    })
}
