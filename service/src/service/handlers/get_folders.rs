use serde::Deserialize;

use crate::{app::AppContext, db::repo::folders::FoldersRepo, service::handler::BoxFuture};

#[derive(Deserialize)]
pub struct GetFoldersParams;

pub fn get_folders(_: GetFoldersParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let folders = FoldersRepo::get_all()?;
        Ok(serde_json::to_value(folders)?.into())
    })
}
