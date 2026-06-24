use serde::Deserialize;

use crate::{
    app::{
        dialogue::{Dialogue, ReferenceKind},
        AppContext,
    },
    db::repo::dialogue::DialoguesRepo,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetAllDialoguesParams {
    pub kind: ReferenceKind,
    pub parent_id: i64,
}

pub fn get_all_dialogues(params: GetAllDialoguesParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let dialogues: Vec<Dialogue> = DialoguesRepo::get_for_parent(params.kind, params.parent_id)?
            .into_iter()
            .filter(|d| d.visible && d.is_ready)
            .collect();
        Ok(serde_json::to_value(dialogues)?.into())
    })
}
