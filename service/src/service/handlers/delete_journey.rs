use std::fs;

use serde::Deserialize;
use serde_json::json;

use crate::{
    app::AppContext,
    db::repo::{dialogue::DialoguesRepo, journeys::JourneysRepo},
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct DeleteJourneyParams {
    id: i64,
}

pub fn delete_journey(params: DeleteJourneyParams, _context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let journey_id = params.id;
        DialoguesRepo::delete_for_parent(crate::app::dialogue::ReferenceKind::Journey, journey_id)?;

        let journey_artifacts = JourneysRepo::get_artifacts(journey_id)?;

        let chapter_dir = journey_artifacts.chapter_dir;
        fs::remove_dir_all(chapter_dir)?;
        JourneysRepo::delete_single(journey_id)?;

        Ok(json!({"success": true}).into())
    })
}
