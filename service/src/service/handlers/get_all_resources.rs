use serde::Deserialize;

use crate::{
    app::{resource::resource::Resource, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetAllResourcesParams;
pub fn get_all_resources(_: GetAllResourcesParams, _context: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let resources: Vec<_> = Repository::<Resource>::all()?
            .into_iter()
            .map(|p| p.read().clone())
            .collect();
        Ok(serde_json::to_value(resources)?.into())
    })
}
