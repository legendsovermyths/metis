use serde::Deserialize;

use crate::{
    app::{explanation::artifact::ExplanationArtifacts, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetExplanationParams {
    id: i64,
}

pub fn get_explanation(params: GetExplanationParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let explanation = Repository::<ExplanationArtifacts>::find_by_id(&params.id)?;
        Ok(serde_json::to_value(explanation.read())?.into())
    })
}
