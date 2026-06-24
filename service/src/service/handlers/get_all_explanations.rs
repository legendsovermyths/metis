use serde::Deserialize;

use crate::{
    app::AppContext, db::repo::explanations::ExplanationsRepo, service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetAllExplanationsParams;

pub fn get_all_explanations(_: GetAllExplanationsParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let rows = ExplanationsRepo::get_all()?;
        Ok(serde_json::to_value(rows)?.into())
    })
}
