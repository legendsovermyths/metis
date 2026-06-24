use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    app::{
        dialogue::{DialogueReference, ReferenceKind},
        AppContext,
    },
    db::repo::{dialogue::DialoguesRepo, explanations::ExplanationsRepo, journeys::JourneysRepo},
    error::{MetisError, Result},
    service::handler::{BoxFuture, ServiceResponse},
    task::{task_type::TaskType, TaskRequest},
};

const PREFETCH_BATCH: usize = 5;

#[derive(Deserialize)]
pub struct GetNextDialogueParams {
    pub kind: ReferenceKind,
    pub parent_id: i64,
}

fn seed_reference(kind: ReferenceKind, parent_id: i64) -> Result<DialogueReference> {
    match kind {
        ReferenceKind::Journey => {
            let progress = JourneysRepo::get_artifacts(parent_id)?.progress;
            Ok(DialogueReference::Journey {
                journey_id: parent_id,
                arc_idx: progress.arc_idx,
                topic_idx: progress.topic_idx,
            })
        }
        ReferenceKind::Explanation => {
            let progress = ExplanationsRepo::get_artifacts(parent_id)?.progress;
            Ok(DialogueReference::Explanation {
                explanation_id: parent_id,
                step_idx: progress.step_idx,
            })
        }
        ReferenceKind::None => Err(MetisError::ParamsError(
            "cannot fetch a dialogue for reference kind none".to_string(),
        )),
    }
}

pub fn get_next_dialogue(params: GetNextDialogueParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        match DialoguesRepo::get_for_parent(params.kind, params.parent_id)?
            .into_iter()
            .find(|d| !d.visible && d.is_ready)
        {
            Some(dialogue) => {
                DialoguesRepo::mark_visible(dialogue.id.unwrap())?;
                Ok(ServiceResponse {
                    response: serde_json::to_value(dialogue)?,
                    task_request: None,
                })
            }
            None => {
                let dialogue_reference = seed_reference(params.kind, params.parent_id)?;
                Ok(ServiceResponse {
                    response: Value::Null,
                    task_request: Some(vec![TaskRequest {
                        task_type: TaskType::GenerateDialogues,
                        params: json!({
                            "parent_id": params.parent_id,
                            "dialogue_reference": dialogue_reference,
                            "num_dialogues": PREFETCH_BATCH,
                        }),
                    }]),
                })
            }
        }
    })
}
