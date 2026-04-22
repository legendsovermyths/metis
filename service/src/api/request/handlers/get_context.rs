
use serde::Deserialize;

use crate::{
    api::request::handler::BoxFuture, app::AppContext,
};

#[derive(Deserialize)]
pub struct GetContextParams;

pub fn get_context(_: GetContextParams, context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let ctx = context.value().await?;
        Ok(serde_json::to_value(&ctx)?)
    })
}
