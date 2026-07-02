use serde::Deserialize;

use crate::{app::AppContext, db::repo::folders::FoldersRepo, service::handler::BoxFuture};

#[derive(Deserialize)]
pub struct GetFoldersParams {
    #[serde(default = "default_scope")]
    scope: String,
}

fn default_scope() -> String {
    "study".to_string()
}

pub fn get_folders(params: GetFoldersParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let folders = FoldersRepo::get_all(&params.scope)?;
        Ok(serde_json::to_value(folders)?.into())
    })
}
