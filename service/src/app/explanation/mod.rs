use serde::{Deserialize, Serialize};

pub mod folder;

#[derive(Debug, Clone, Serialize)]
pub struct ExplanationArtifacts {
    pub id: Option<i64>,
    pub title: String,
    pub explanation_directory: String,
    pub explanation: Explanation,
    pub progress: ExplanationProgress,
    pub tutor_notes: String
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Explanation {
    pub steps: Vec<Step>,
}

impl Explanation {
    pub fn get_step_count(&self) -> usize {
        self.steps.len()
    }
}

impl ExplanationArtifacts {
    pub fn get_step(&self, step_idx: usize) -> Option<&Step> {
        self.explanation.steps.get(step_idx)
    }
}

#[derive(Debug, Serialize, Clone, Deserialize)]
pub struct Step {
    pub name: String,
    pub label: ExplanationLabel,
    pub brief: String,
}

#[derive(Debug, Serialize, Clone, Deserialize)]
pub enum ExplanationLabel {
    Grasp,
    Observation,
    Deduction,
    Conclusion,
    Application,
}

impl ExplanationLabel {
    pub fn as_str(&self) -> &str {
        match self {
            ExplanationLabel::Grasp => "Grasp",
            ExplanationLabel::Observation => "Observation",
            ExplanationLabel::Deduction => "Deduction",
            ExplanationLabel::Conclusion => "Conclusion",
            ExplanationLabel::Application => "Application",
        }
    }
}

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
