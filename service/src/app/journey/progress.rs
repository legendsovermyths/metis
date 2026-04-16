use serde::{Deserialize, Serialize};

use crate::{app::journey::{blackboard::Blackboard, dialogue::Dialogues}, db::persistence::Persistent};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JourneyProgress {
    pub journey_id: i64,
    pub arc_idx: usize,
    pub topic_idx: usize,
    pub dialogues: Persistent<Dialogues>,
    pub is_journey_complete: bool,
}


impl JourneyProgress {
    pub fn new(journey_id: i64) -> Self {
        JourneyProgress {
            journey_id,
            arc_idx: 0,
            topic_idx: 0,
            dialogues: Persistent::new(Dialogues::new()),
            is_journey_complete: false,
        }
    }
}
