pub mod blackboard;
pub mod kind;
pub mod segment;
use serde::{Deserialize, Serialize};

use crate::{
    app::{
        dialogue::{blackboard::Blackboard, kind::DialogueKind, segment::Segment},
        explanation::artifact::ExplanationArtifacts,
        journey::artifact,
    },
    db::repo::Repository,
    error::{MetisError, Result},
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dialogue {
    pub id: Option<i64>,
    pub reference: ArtifactReference,
    pub idx: usize,
    pub content: String,
    pub blackboard: Blackboard,
    pub heading: String,
    pub marked_complete: bool,
    pub visible: bool,
    pub segments: Vec<Segment>,
    pub is_ready: bool,
    pub kind: DialogueKind,
    pub concluded: bool,
}

impl Default for Dialogue {
    fn default() -> Self {
        Dialogue {
            id: None,
            idx: 0,
            reference: ArtifactReference::None,
            content: String::new(),
            blackboard: Blackboard::empty(),
            heading: String::new(),
            marked_complete: false,
            visible: true,
            segments: Vec::new(),
            is_ready: false,
            kind: DialogueKind::Explainer,
            concluded: false,
        }
    }
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub enum ArtifactReference {
    Journey {
        journey_id: i64,
        arc_idx: usize,
        topic_idx: usize,
    },
    Explanation {
        explanation_id: i64,
        step_idx: usize,
    },
    None,
}

impl ArtifactReference {
    pub fn kind(&self) -> ReferenceKind {
        match self {
            ArtifactReference::Journey {
                journey_id: _,
                arc_idx: _,
                topic_idx: _,
            } => ReferenceKind::Journey,
            ArtifactReference::Explanation {
                explanation_id: _,
                step_idx: _,
            } => ReferenceKind::Explanation,
            ArtifactReference::None => ReferenceKind::None,
        }
    }
    pub fn parent_id(&self) -> i64 {
        match self {
            ArtifactReference::Journey {
                journey_id,
                arc_idx: _,
                topic_idx: _,
            } => *journey_id,
            ArtifactReference::Explanation {
                explanation_id,
                step_idx: _,
            } => *explanation_id,
            _ => 0,
        }
    }

    pub fn get_directory(&self) -> Result<String> {
        match self {
            ArtifactReference::Journey { journey_id, .. } => {
                let journey = Repository::<artifact::JourneyArtifacts>::find_by_id(journey_id)?;
                Ok(journey.read().chapter_dir.clone())
            }
            ArtifactReference::Explanation { explanation_id, .. } => {
                let explanation = Repository::<ExplanationArtifacts>::find_by_id(explanation_id)?;
                Ok(explanation.read().explanation_directory.clone())
            },
            ArtifactReference::None => {
                Err(MetisError::InternalDataError("Directory being requested from the reference that is not associated with any resource".to_string()))
            }
        }
    }

    pub fn get_dialogue_kind(&self) -> Result<DialogueKind> {
        match self {
            ArtifactReference::Journey {
                journey_id,
                arc_idx,
                topic_idx,
            } => {
                let journey = Repository::<artifact::JourneyArtifacts>::find_by_id(journey_id)?;
                let topic = journey.read().get_topic(*arc_idx, *topic_idx);
                if let Some(topic) = topic {
                    Ok(topic.generation_kind)
                } else {
                    Err(MetisError::InternalDataError(
                        "the topic used to fetch dialogue kind does not exist".to_string(),
                    ))
                }
            }
            ArtifactReference::Explanation {
                explanation_id: _,
                step_idx: _,
            } => Ok(DialogueKind::Explainer),
            ArtifactReference::None => Err(MetisError::InternalDataError(
                "No reference exist for the dialogue that is trying to fetch the kind".to_string(),
            )),
        }
    }

}

#[derive(Deserialize, Serialize, Clone, Copy)]
pub enum ReferenceKind {
    Journey,
    Explanation,
    None,
}

impl ReferenceKind {
    pub fn as_str(&self) -> &str {
        match self {
            ReferenceKind::Explanation => "explanation",
            ReferenceKind::Journey => "journey",
            ReferenceKind::None => "none",
        }
    }
}
