use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{dialogue::ReferenceKind, AppContext},
    db::repo::{explanations::ExplanationsRepo, journeys::JourneysRepo},
    error::MetisError,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetArtifactParams {
    pub kind: ReferenceKind,
    pub parent_id: i64,
}

pub fn get_artifact(params: GetArtifactParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let value = match params.kind {
            ReferenceKind::Journey => {
                let artifact = JourneysRepo::get_artifacts(params.parent_id)?;
                json!({ "kind": "Journey", "journey": artifact })
            }
            ReferenceKind::Explanation => {
                let artifact = ExplanationsRepo::get_artifacts(params.parent_id)?;
                json!({ "kind": "Explanation", "explanation": artifact })
            }
            ReferenceKind::None => {
                return Err(MetisError::ParamsError(
                    "cannot fetch an artifact for reference kind none".to_string(),
                ))
            }
        };
        Ok(value.into())
    })
}
