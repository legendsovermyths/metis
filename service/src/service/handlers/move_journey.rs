use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{journey::artifact::JourneyArtifacts, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct MoveJourneyParams {
    id: i64,
    folder_id: Option<i64>,
}

pub fn move_journey(params: MoveJourneyParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let mut journey = Repository::<JourneyArtifacts>::find_by_id(&params.id)?;
        journey.write().folder_id = params.folder_id;
        Ok(json!({ "success": true }).into())
    })
}
