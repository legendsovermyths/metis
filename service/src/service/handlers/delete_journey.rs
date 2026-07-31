use std::fs;

use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{journey::artifact::JourneyArtifacts, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct DeleteJourneyParams {
    id: i64,
}

pub fn delete_journey(params: DeleteJourneyParams, _context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let journey_id = params.id;

        let journey_artifacts = Repository::<JourneyArtifacts>::find_by_id(&journey_id)?;
        let chapter_dir = journey_artifacts.read().chapter_dir.clone();
        fs::remove_dir_all(chapter_dir)?;

        Repository::<JourneyArtifacts>::delete(&journey_id)?;

        Ok(json!({"success": true}).into())
    })
}
