use serde::Deserialize;

use crate::{
    app::AppContext,
    db::repo::explanations::ExplanationsRepo,
    error::{MetisError, Result},
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetExplanationParams {
    id: i64,
}

pub fn get_explanation(params: GetExplanationParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let row = ExplanationsRepo::get(params.id)?
            .ok_or_else(|| MetisError::NotFound(format!("explanation {}", params.id)))?;
        Ok(serde_json::to_value(row)?.into())
    })
}
