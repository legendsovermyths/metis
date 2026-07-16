use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    app::{
        dialogue::{self, Dialogue, DialogueReference, ReferenceKind},
        AppContext,
    },
    db::repo::{dialogue::DialoguesRepo, explanations::ExplanationsRepo, journeys::JourneysRepo},
    error::{MetisError, Result},
    service::handler::{BoxFuture, ServiceResponse},
    task::{task_type::TaskType, TaskRequest},
};

const PREFETCH_BATCH: usize = 5;
const DIALOGUE_REMAINING_THRESHOLD: usize = 5;

#[derive(Deserialize)]
pub struct GetNextDialogueParams {
    pub kind: ReferenceKind,
    pub parent_id: i64,
}

fn seed_reference(kind: ReferenceKind, parent_id: i64) -> Result<(DialogueReference, bool)> {
    match kind {
        ReferenceKind::Journey => {
            let progress = JourneysRepo::get_artifacts(parent_id)?.progress;
            Ok((
                DialogueReference::Journey {
                    journey_id: parent_id,
                    arc_idx: progress.arc_idx,
                    topic_idx: progress.topic_idx,
                },
                progress.is_journey_complete,
            ))
        }
        ReferenceKind::Explanation => {
            let progress = ExplanationsRepo::get_artifacts(parent_id)?.progress;
            Ok((
                DialogueReference::Explanation {
                    explanation_id: parent_id,
                    step_idx: progress.step_idx,
                },
                progress.is_complete,
            ))
        }
        ReferenceKind::None => Err(MetisError::ParamsError(
            "cannot fetch a dialogue for reference kind none".to_string(),
        )),
    }
}

fn create_task_request(
    dialogues: &Vec<Dialogue>,
    params: &GetNextDialogueParams,
) -> Result<Option<Vec<TaskRequest>>> {
    let (dialogue_reference, is_complete) = seed_reference(params.kind, params.parent_id)?;
    if is_complete {
        return Ok(None);
    }
    let remaining_dialogues_count = dialogues
        .iter()
        .filter(|d| !d.visible && d.is_ready)
        .count();
    if remaining_dialogues_count < DIALOGUE_REMAINING_THRESHOLD {
        return Ok(Some(vec![TaskRequest {
            task_type: TaskType::GenerateDialogues,
            params: json!({
                "parent_id": params.parent_id,
                "dialogue_reference": dialogue_reference,
                "num_dialogues": PREFETCH_BATCH,
            }),
        }]));
    }
    Ok(None)
}

pub fn get_next_dialogue(params: GetNextDialogueParams, _: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let dialogues = DialoguesRepo::get_for_parent(params.kind, params.parent_id)?;
        let task_request = create_task_request(&dialogues, &params)?;
        match dialogues.iter().find(|d| !d.visible && d.is_ready) {
            Some(dialogue) => {
                DialoguesRepo::mark_visible(dialogue.id.unwrap())?;
                Ok(ServiceResponse {
                    response: serde_json::to_value(dialogue)?,
                    task_request: task_request,
                })
            }
            None => Ok(ServiceResponse {
                response: Value::Null,
                task_request: task_request,
            }),
        }
    })
}
