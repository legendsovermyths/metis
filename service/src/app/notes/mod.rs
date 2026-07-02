use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Note {
    pub id: Option<i64>,
    pub title: String,
    pub content: String,
    pub anchor: Option<Anchor>,
    pub folder_id: Option<i64>,
    pub created_at: i64,
    pub updated_at: i64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum Anchor {
    Journey {
        journey_id: i64,
    },
    Dialogue {
        dialogue_id: i64,
        segment_idx: Option<usize>,
    },
    Explanation {
        explanation_id: i64,
        step_idx: Option<usize>,
    },
}
