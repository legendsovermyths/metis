use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    app::{
        dialogue::{kind::DialogueKind, Dialogue, DialogueReference, ReferenceKind},
        explanation::artifact::ExplanationArtifacts,
        journey::artifact::JourneyArtifacts,
        AppContext,
    },
    db::{persistence::Persistent, repo::dialogue::DialoguesRepo, repo::Repository},
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
            let progress = Repository::<JourneyArtifacts>::find_by_id(&parent_id)?
                .read()
                .generation_progress
                .clone();
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
            let progress = Repository::<ExplanationArtifacts>::find_by_id(&parent_id)?
                .read()
                .generation_progress
                .clone();
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
    dialogues: &[Persistent<Dialogue>],
    params: &GetNextDialogueParams,
) -> Result<Option<Vec<TaskRequest>>> {
    let (dialogue_reference, generation_complete) = seed_reference(params.kind, params.parent_id)?;

    let mut task_requests = Vec::new();
    if !generation_complete {
        let remaining_dialogues_count = dialogues
            .iter()
            .filter(|p| {
                let d = p.read();
                !d.visible && d.is_ready
            })
            .count();
        if remaining_dialogues_count < DIALOGUE_REMAINING_THRESHOLD {
            task_requests.push(TaskRequest {
                task_type: TaskType::DraftDialogue,
                params: json!({
                    "parent_id": params.parent_id,
                    "dialogue_reference": dialogue_reference,
                    "num_dialogues": PREFETCH_BATCH,
                }),
            });
        }
    }
    let next_dialogue = dialogues.iter().find(|p| {
        let d = p.read();
        !d.visible
    });
    if let Some(next_dialogue) = next_dialogue {
        if !next_dialogue.read().is_ready {
            let task_type = match next_dialogue.read().kind {
                DialogueKind::Question => TaskType::ComposeQuestion,
                DialogueKind::Explainer => TaskType::ComposeExplainer,
            };
            task_requests.push(TaskRequest {
                task_type,
                params: json!({
                    "dialogue_id": next_dialogue.read().id.unwrap()
                }),
            });
        }
    }
    if task_requests.is_empty() {
        return Ok(None);
    }
    Ok(Some(task_requests))
}

pub fn get_next_dialogue(params: GetNextDialogueParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let mut dialogues = DialoguesRepo::get_for_parent(params.kind, params.parent_id)?;
        let task_request = create_task_request(&dialogues, &params)?;
        match dialogues.iter_mut().find(|p| !p.read().visible) {
            Some(dialogue) if dialogue.read().is_ready => {
                dialogue.write().visible = true;
                Ok(ServiceResponse {
                    response: serde_json::to_value(dialogue.read())?,
                    task_request,
                })
            }
            _ => Ok(ServiceResponse {
                response: Value::Null,
                task_request,
            }),
        }
    })
}
