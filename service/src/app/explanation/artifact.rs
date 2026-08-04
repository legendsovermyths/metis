use serde::Serialize;

use crate::app::explanation::{progress::ExplanationProgress, Explanation, Step};


#[derive(Debug, Clone, Serialize)]
pub struct ExplanationArtifacts {
    pub id: Option<i64>,
    pub title: String,
    pub explanation_directory: String,
    pub explanation: Explanation,
    pub folder_id: Option<i64>,
    pub created_at: i64,
    pub progress: ExplanationProgress,
    pub tutor_notes: String,
}

impl ExplanationArtifacts {
    pub fn get_step(&self, step_idx: usize) -> Option<&Step> {
        self.explanation.steps.get(step_idx)
    }
}
