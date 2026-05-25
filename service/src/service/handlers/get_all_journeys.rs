
use serde::Deserialize;

use crate::{
    app::AppContext, db::repo::journeys::JourneysRepo, service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetAllJourneysParams;

pub fn get_all_journeys(_: GetAllJourneysParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let rows = JourneysRepo::get_all()?;
        Ok(serde_json::to_value(rows)?.into())
    })
}
