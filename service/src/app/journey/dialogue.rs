use std::collections::VecDeque;

use serde::{Deserialize, Serialize};

use crate::{
    app::journey::{blackboard::Blackboard, artifact::JourneyArtifacts},
    db::{persistence::DbObject, repo::dialogue::DialoguesRepo},
    error::Result,
};

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
}

impl Dialogue {
    pub fn build(
        artifacts: &JourneyArtifacts,
        content: String,
        blackboard: Blackboard,
        topic_complete: bool,
    ) -> Self {
        let progress = &artifacts.progress;
        let heading = artifacts
            .get_topic(progress.arc_idx, progress.topic_idx)
            .map(|t| t.name.clone())
            .unwrap_or_default();

        Dialogue {
            journey_id: progress.journey_id,
            arc_idx: progress.arc_idx,
            topic_idx: progress.topic_idx,
            idx: progress.dialogues.read().len(),
            content,
            blackboard,
            heading,
            marked_complete: topic_complete,
        }
    }
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
        }
    }
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Dialogues {
    data: Vec<Dialogue>,
    dirty: VecDeque<Dialogue>,
}

impl Dialogues {
    pub fn with(dialogues: Vec<Dialogue>) -> Self {
        Self {
            data: dialogues,
            dirty: VecDeque::new(),
        }
    }

    pub fn new() -> Self {
        Self {
            data: Vec::new(),
            dirty: VecDeque::new(),
        }
    }

    pub fn push(&mut self, dialogue: Dialogue) {
        self.dirty.push_back(dialogue);
    }

    pub fn len(&self) -> usize {
        self.data.len() + self.dirty.len()
    }

    pub fn last(&self) -> Option<&Dialogue> {
        if self.dirty.is_empty() {
            self.data.last()
        } else {
            self.dirty.iter().last()
        }
    }

    pub fn get_recent(&self, n: usize) -> Vec<&Dialogue> {
        let total = self.len();
        let skip = total.saturating_sub(n);
        self.data.iter()
            .chain(self.dirty.iter())
            .skip(skip)
            .collect()
    }
}

impl DbObject for Dialogues {
    fn save(&mut self) -> Result<()> {
        while let Some(dialogue) = self.dirty.pop_front() {
            DialoguesRepo::insert(&dialogue)?;
            self.data.push(dialogue);
        }
        Ok(())
    }
}
