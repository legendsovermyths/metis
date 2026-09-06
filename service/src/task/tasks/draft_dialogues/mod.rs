pub mod narrator;
pub mod questioner;
use questioner::{Questioner, QuestionerRequest};
use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{
    app::{
        dialogue::{blackboard::Blackboard, kind::DialogueKind, Dialogue, DialogueReference},
        explanation::artifact::ExplanationArtifacts,
        journey::artifact::JourneyArtifacts,
    },
    db::repo::{dialogue::DialoguesRepo, Repository},
    error::{MetisError, Result},
    task::{
        context::TaskContext,
        gaurd::TaskGaurd,
        manager::TaskFuture,
        progress::{TaskProgress, TaskStatus},
        task_type::TaskType,
        tasks::draft_dialogues::narrator::Narrator,
        TaskRequest,
    },
};

#[derive(Deserialize, Serialize)]
pub struct DraftParams {
    parent_id: i64,
    dialogue_reference: DialogueReference,
    num_dialogues: usize,
}

#[derive(Serialize, Deserialize)]
pub struct DraftCheckpoint {
    count: usize,
}

pub struct DialogueDraft {
    content: String,
    blackboard_instructions: String,
    topic_complete: bool,
    title: String,
}

fn refresh_reference(reference: &DialogueReference) -> Result<Option<DialogueReference>> {
    match reference {
        DialogueReference::Explanation { explanation_id, .. } => {
            let progress = Repository::<ExplanationArtifacts>::find_by_id(explanation_id)?
                .read()
                .generation_progress
                .clone();
            if progress.is_complete {
                Ok(None)
            } else {
                Ok(Some(DialogueReference::Explanation {
                    explanation_id: *explanation_id,
                    step_idx: progress.step_idx,
                }))
            }
        }
        DialogueReference::Journey { journey_id, .. } => {
            let progress = Repository::<JourneyArtifacts>::find_by_id(journey_id)?
                .read()
                .generation_progress
                .clone();
            if progress.is_journey_complete {
                Ok(None)
            } else {
                Ok(Some(DialogueReference::Journey {
                    journey_id: *journey_id,
                    arc_idx: progress.arc_idx,
                    topic_idx: progress.topic_idx,
                }))
            }
        }
        DialogueReference::None => Ok(None),
    }
}

pub fn draft_dialogue(context: TaskContext) -> TaskFuture {
    Box::pin(async move {
        let params: DraftParams = serde_json::from_value(context.params)?;
        let mut checkpoint: DraftCheckpoint = serde_json::from_value(context.checkpoint)?;
        let mut narrator = Narrator::new();
        let mut questioner = Questioner::new();
        let mut dialogue_reference = params.dialogue_reference.clone();
        let count = checkpoint.count;
        for _ in count..params.num_dialogues {
            let dialogue_kind = dialogue_reference.get_dialogue_kind()?;
            let dialogue_draft: DialogueDraft = match dialogue_kind {
                DialogueKind::Explainer => {
                    let output = narrator
                        .narrate(narrator::NarrateRequest {
                            parent_id: params.parent_id,
                            dialogue_reference: dialogue_reference.clone(),
                        })
                        .await?;
                    output.into()
                }
                DialogueKind::Question => questioner
                    .prepare(QuestionerRequest {
                        dialogue_reference: dialogue_reference.clone(),
                    })
                    .await?
                    .into(),
            };
            let from_draft = Dialogue::try_draft(dialogue_draft, &dialogue_reference, &dialogue_kind)?;
            let dialogue = Repository::<Dialogue>::create(from_draft)?;
            let dialgoue_id = dialogue.read().id.ok_or(MetisError::InternalDataError(
                "Dialgoue inserted did not return an id".to_string(),
            ))?;
            checkpoint.count += 1;
            let _ = context
                .progress_tx
                .send(TaskProgress {
                    task_id: context.id.clone(),
                    message: format!("Dialgoue generate for journey: {}", params.parent_id),
                    checkpoint: serde_json::to_value(&checkpoint)?,
                    status: TaskStatus::Running,
                })
                .await;
            match dialogue_kind {
                DialogueKind::Explainer => {
                    let _ = context
                        .task_request_tx
                        .send(TaskRequest {
                            task_type: TaskType::ComposeExplainer,
                            params: json!({"dialogue_id": dialgoue_id}),
                        })
                        .await;
                }
                DialogueKind::Question => {
                    let _ = context
                        .task_request_tx
                        .send(TaskRequest {
                            task_type: TaskType::ComposeQuestion,
                            params: json!({"dialogue_id": dialgoue_id}),
                        })
                        .await;
                }
            }

            match refresh_reference(&dialogue_reference)? {
                Some(next) => dialogue_reference = next,
                None => break,
            }
        }
        Ok(json!({}))
    })
}

impl Default for DraftCheckpoint {
    fn default() -> Self {
        Self { count: 0 }
    }
}

impl TaskGaurd for DraftParams {
    fn identity(&self) -> Option<String> {
        Some(format!(
            "DraftDialogues:{}:{}",
            self.parent_id,
            self.dialogue_reference.kind().as_str()
        ))
    }
}

impl Dialogue {
    fn try_draft(
        draft: DialogueDraft,
        reference: &DialogueReference,
        dialogue_kind: &DialogueKind,
    ) -> Result<Self> {
        let dialogues = DialoguesRepo::get_for_parent(reference.kind(), reference.parent_id())?;
        let idx = match dialogues.last() {
            Some(p) => p.read().idx + 1,
            _ => 0,
        };
        Ok(Dialogue {
            id: None,
            reference: reference.clone(),
            idx,
            content: draft.content,
            blackboard: Blackboard {
                elements: Vec::new(),
                description: draft.blackboard_instructions,
                image_url: None,
            },
            heading: draft.title,
            marked_complete: draft.topic_complete,
            visible: false,
            segments: Vec::new(),
            is_ready: false,
            kind: dialogue_kind.clone(),
            concluded: false,
        })
    }
}
