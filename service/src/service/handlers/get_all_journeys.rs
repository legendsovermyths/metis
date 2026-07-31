
use serde::Deserialize;

use crate::{
    app::{journey::artifact::JourneyArtifacts, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetAllJourneysParams;

pub fn get_all_journeys(_: GetAllJourneysParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let journeys = Repository::<JourneyArtifacts>::all()?;
        Ok(serde_json::to_value(journeys)?.into())
    })
}
