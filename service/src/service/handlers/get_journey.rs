use serde::Deserialize;

use crate::{
    app::AppContext,
    db::repo::journeys::JourneysRepo,
    error::{MetisError, Result}, service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetJourneyParams {
    id: i64,
}

pub fn get_journey(params: GetJourneyParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let row = JourneysRepo::get(params.id)?
            .ok_or_else(|| MetisError::NotFound(format!("journey {}", params.id)))?;
        Ok(serde_json::to_value(row)?.into())
    })
}
