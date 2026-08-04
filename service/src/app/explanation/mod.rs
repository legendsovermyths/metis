use serde::{Deserialize, Serialize};

pub mod artifact;
pub mod progress;


#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Explanation {
    pub steps: Vec<Step>,
}

impl Explanation {
    pub fn get_step_count(&self) -> usize {
        self.steps.len()
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

