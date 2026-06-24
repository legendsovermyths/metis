pub mod blackboard;
pub mod segment;
use serde::{Deserialize, Serialize};

use crate::{
    app::{
        dialogue::{blackboard::Blackboard, segment::Segment},
        journey::artifact,
    },
    db::repo::{explanations::ExplanationsRepo, journeys::JourneysRepo},
    error::{MetisError, Result},
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dialogue {
    pub id: Option<i64>,
    pub reference: DialogueReference,
    pub idx: usize,
    pub content: String,
    pub blackboard: Blackboard,
    pub heading: String,
    pub marked_complete: bool,
    pub visible: bool,
    pub segments: Vec<Segment>,
    pub is_ready: bool,
}

impl Default for Dialogue {
    fn default() -> Self {
        Dialogue {
            id: None,
            idx: 0,
            reference: DialogueReference::None,
            content: String::new(),
            blackboard: Blackboard::empty(),
            heading: String::new(),
            marked_complete: false,
            visible: true,
            segments: Vec::new(),
            is_ready: false,
        }
    }
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub enum DialogueReference {
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

impl DialogueReference {
    pub fn kind(&self) -> ReferenceKind {
        match self {
            DialogueReference::Journey {
                journey_id,
                arc_idx,
                topic_idx,
            } => ReferenceKind::Journey,
            DialogueReference::Explanation {
                explanation_id,
                step_idx,
            } => ReferenceKind::Explanation,
            DialogueReference::None => ReferenceKind::None,
        }
    }
    pub fn parent_id(&self) -> i64 {
        match self {
            DialogueReference::Journey {
                journey_id,
                arc_idx,
                topic_idx,
            } => *journey_id,
            DialogueReference::Explanation {
                explanation_id,
                step_idx,
            } => *explanation_id,
            _ => 0,
        }
    }

    pub fn get_directory(&self) -> Result<String> {
        match self {
            DialogueReference::Journey { journey_id, .. } => {
                let artifact = JourneysRepo::get_artifacts(*journey_id)?;
                Ok(artifact.chapter_dir)
            }
            DialogueReference::Explanation { explanation_id, .. } => {
                let artifact = ExplanationsRepo::get_artifacts(*explanation_id)?;
                Ok(artifact.explanation_directory)
            },
            DialogueReference::None => {
                Err(MetisError::InternalDataError("Directory being requested from the reference that is not associated with any resource".to_string()))
            }
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
