use serde::Deserialize;
use serde_json::json;

use crate::{app::AppContext, db::repo::journeys::JourneysRepo, service::handler::BoxFuture};

#[derive(Deserialize)]
pub struct MoveJourneyParams {
    id: i64,
    folder_id: Option<i64>,
}

pub fn move_journey(params: MoveJourneyParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        JourneysRepo::set_folder(params.id, params.folder_id)?;
        Ok(json!({ "success": true }).into())
    })
}
