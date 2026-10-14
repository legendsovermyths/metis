use crate::app::{
    dialogue::{blackboard::Blackboard, ArtifactReference, Dialogue},
    notes::Note,
};

pub struct Evaluation {
    reference: ArtifactReference,
    content: Vec<EvaluationContent>,
    evaluated: bool,
    score: f64,
}

pub struct EvaluationContent {
    question: EvaluationMCQQuestion,
    solution: String,
    notes: Note,
    evaluated: bool,
    agent_notes: String,
    score: Option<i32>
}

pub struct EvaluationMCQQuestion {
    heading: String,
    content: String,
    blackboard: Blackboard,
    options: Vec<EvaluationMCQOption>,
    correct_id: usize,
}

struct EvaluationMCQOption {
    id: usize,
    content: String,
}


