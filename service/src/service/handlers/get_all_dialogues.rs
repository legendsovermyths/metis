use serde::Deserialize;

use crate::{
    app::AppContext, db::repo::dialogue::DialoguesRepo, service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct GetAllDialoguesParams {
    pub journey_id: i64,
}

pub fn get_all_dialogues(params: GetAllDialoguesParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let dialogues = DialoguesRepo::get_visible_for_journey(params.journey_id)?;
        Ok(serde_json::to_value(dialogues)?.into())
    })
}
