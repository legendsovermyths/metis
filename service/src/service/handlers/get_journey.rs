use serde::Deserialize;

use crate::{
    app::{journey::artifact::JourneyArtifacts, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetJourneyParams {
    id: i64,
}

pub fn get_journey(params: GetJourneyParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let journey = Repository::<JourneyArtifacts>::find_by_id(&params.id)?;
        Ok(serde_json::to_value(journey.read())?.into())
    })
}
