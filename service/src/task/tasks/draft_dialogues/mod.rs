use serde::{Deserialize, Serialize};

use crate::{
    app::{
        dialogue::DialogueReference, explanation::ExplanationArtifacts,
        journey::artifact::JourneyArtifacts,
    },
    db::repo::Repository,
    error::Result, task::{context::TaskContext, manager::TaskFuture},
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

fn refresh_reference(reference: &DialogueReference) -> Result<Option<DialogueReference>> {
    match reference {
        DialogueReference::Explanation { explanation_id, .. } => {
            let progress = Repository::<ExplanationArtifacts>::find_by_id(explanation_id)?
                .read()
                .progress
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
                .progress
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



