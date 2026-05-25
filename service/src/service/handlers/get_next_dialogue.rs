use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    app::AppContext,
    db::repo::dialogue::DialoguesRepo,
    service::handler::{BoxFuture, ServiceResponse},
    task::{task_type::TaskType, TaskRequest},
};

const PREFETCH_BATCH: usize = 5;

#[derive(Deserialize)]
pub struct GetNextDialogueParams {
    pub journey_id: i64,
}

pub fn get_next_dialogue(params: GetNextDialogueParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        match DialoguesRepo::get_next_invisible(params.journey_id)? {
            Some(dialogue) => {
                DialoguesRepo::mark_visible(
                    dialogue.journey_id,
                    dialogue.arc_idx,
                    dialogue.topic_idx,
                    dialogue.idx,
                )?;
                Ok(ServiceResponse {
                    response: serde_json::to_value(dialogue)?,
                    task_request: None,
                })
            }
            None => Ok(ServiceResponse {
                response: Value::Null,
                task_request: Some(vec![TaskRequest {
                    task_type: TaskType::GenerateDialogues,
                    params: json!({
                        "id": params.journey_id,
                        "num_dialogues": PREFETCH_BATCH,
                    }),
                }]),
            }),
        }
    })
}
