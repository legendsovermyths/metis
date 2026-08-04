use serde::Deserialize;

use crate::{
    app::{explanation::artifact::ExplanationArtifacts, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetAllExplanationsParams;

pub fn get_all_explanations(_: GetAllExplanationsParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let mut explanations = Repository::<ExplanationArtifacts>::all()?;
        explanations.sort_by(|a, b| b.read().created_at.cmp(&a.read().created_at));
        Ok(serde_json::to_value(explanations)?.into())
    })
}
