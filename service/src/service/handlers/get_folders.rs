use serde::Deserialize;

use crate::{
    app::{folder::Folder, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetFoldersParams {
    #[serde(default = "default_scope")]
    scope: String,
}

fn default_scope() -> String {
    "study".to_string()
}

pub fn get_folders(params: GetFoldersParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let mut folders = Repository::<Folder>::find_all_by("scope", params.scope)?;
        folders.sort_by(|a, b| {
            a.read()
                .name
                .to_lowercase()
                .cmp(&b.read().name.to_lowercase())
        });
        Ok(serde_json::to_value(folders)?.into())
    })
}
