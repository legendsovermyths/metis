use serde::{Deserialize, Serialize};

use crate::app::journey::blackboard::{Blackboard, ElementDescriptor, Segment};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Dialogue {
    pub journey_id: i64,
    pub arc_idx: usize,
    pub topic_idx: usize,
    pub idx: usize,
    pub content: String,
    pub blackboard: Blackboard,
    pub heading: String,
    pub marked_complete: bool,
    pub visible: bool,
    pub segments: Vec<Segment>,
    pub elements: Vec<ElementDescriptor>,
}

impl Default for Dialogue {
    fn default() -> Self {
        Dialogue {
            journey_id: 0,
            arc_idx: 0,
            topic_idx: 0,
            idx: 0,
            content: String::new(),
            blackboard: Blackboard::empty(),
            heading: String::new(),
            marked_complete: false,
            visible: true,
            segments: Vec::new(),
            elements: Vec::new(),
        }
    }
}
