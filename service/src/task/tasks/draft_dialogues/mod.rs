use serde::{Deserialize, Serialize};

use crate::{
    app::dialogue::DialogueReference,
    db::repo::{explanations::ExplanationsRepo, journeys::JourneysRepo},
    error::Result,
};

#[derive(Deserialize, Serialize)]
pub struct GenerationParams {
    parent_id: i64,
    dialogue_reference: DialogueReference,
    num_dialogues: usize,
}

#[derive(Serialize, Deserialize)]
pub struct GenerationCheckpoint {
    count: usize,
}

fn refresh_reference(reference: &DialogueReference) -> Result<Option<DialogueReference>> {
    match reference {
        DialogueReference::Explanation { explanation_id, .. } => {
            let progress = ExplanationsRepo::get_artifacts(*explanation_id)?.progress;
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
            let progress = JourneysRepo::get_artifacts(*journey_id)?.progress;
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
