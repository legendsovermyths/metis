use serde::Serialize;


#[derive(Debug, Clone, Serialize)]
pub struct ExplanationProgress {
    pub explanation_id: i64,
    pub step_idx: usize,
    pub is_complete: bool
}

impl ExplanationProgress {
    pub fn new(explanation_id: i64) -> Self {
        ExplanationProgress {
            explanation_id,
            step_idx: 0,
            is_complete: false,
        }
    }
}
