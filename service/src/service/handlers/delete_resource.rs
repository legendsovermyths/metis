use std::fs;

use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{resource::resource::Resource, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct DeleteResourceParams {
    id: i64,
}

pub fn delete_resource(params: DeleteResourceParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        if let Some(resource) = Repository::<Resource>::try_find_by_id(&params.id)? {
            let _ = fs::remove_file(&resource.read().path);
        }
        Repository::<Resource>::delete(&params.id)?;
        Ok(json!({ "success": true }).into())
    })
}
