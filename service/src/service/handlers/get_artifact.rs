use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{
        dialogue::ReferenceKind, explanation::ExplanationArtifacts,
        journey::artifact::JourneyArtifacts, AppContext,
    },
    db::repo::Repository,
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
                let artifact = Repository::<JourneyArtifacts>::find_by_id(&params.parent_id)?;
                json!({ "kind": "Journey", "journey": artifact.read() })
            }
            ReferenceKind::Explanation => {
                let artifact = Repository::<ExplanationArtifacts>::find_by_id(&params.parent_id)?;
                json!({ "kind": "Explanation", "explanation": artifact.read() })
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
