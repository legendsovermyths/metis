use serde::{Deserialize, Serialize};

use crate::app::journey::blackboard::Blackboard;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JourneyProgress {
    pub arc_idx: usize,
    pub arcs: Vec<ArcProgress>,
    pub is_journey_complete: bool,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct ArcProgress {
    pub topic_idx: usize,
    pub dialogues: Vec<Dialogue>,
    pub completed: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dialogue {
    pub content: String,
    pub blackboard: Blackboard,
}

impl Dialogue {
    pub fn new(content: String, blackboard: Blackboard) -> Self {
        Self {
            content,
            blackboard,
        }
    }
}
impl Default for JourneyProgress {
    fn default() -> Self {
        Self {
            arc_idx: 0,
            arcs: vec![ArcProgress {
                topic_idx: 0,
                dialogues: Vec::new(),
                completed: false,
            }],
            is_journey_complete: false,
        }
    }
}
