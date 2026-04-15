use serde::{Deserialize, Serialize};

use crate::{
    app::journey::{
        blackboard::Blackboard,
        progress::{Dialogue, JourneyProgress},
        ArcTopic, Journey, JourneyArc,
    },
    db::{persistence::DbObject, repo::journeys::JourneysRepo},
    error::Result,
};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct JourneyArtifacts {
    pub id: Option<i64>,
    pub chapter_title: String,
    pub chapter_dir: String,
    pub journey: Journey,
    pub advisor_notes: String,
    pub progress: JourneyProgress,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TopicRange {
    pub topic: String,
    pub start_page: usize,
    pub end_page: usize,
}

impl JourneyArtifacts {
    pub fn get_arc(&self, idx: usize) -> Option<&JourneyArc> {
        self.journey.arcs.get(idx)
    }

    pub fn get_topic(&self, arc_idx: usize, topic_idx: usize) -> Option<&ArcTopic> {
        self.get_arc(arc_idx).and_then(|a| a.topics.get(topic_idx))
    }

    pub fn step(&mut self) -> bool {
        let arc_idx = self.progress.arc_idx;
        let next_topic = self.progress.arcs[arc_idx].topic_idx + 1;

        if self.get_topic(arc_idx, next_topic).is_some() {
            self.progress.arcs[arc_idx].topic_idx = next_topic;
            false
        } else {
            self.progress.arcs[arc_idx].completed = true;
            let next_arc = arc_idx + 1;
            if self.get_topic(next_arc, 0).is_some() {
                self.progress.arc_idx = next_arc;
                if self.progress.arcs.len() <= next_arc {
                    self.progress
                        .arcs
                        .push(super::progress::ArcProgress::default());
                }
                false
            } else {
                self.progress.is_journey_complete = true;
                true
            }
        }
    }

    pub fn push_dialogue(&mut self, dialogue: Dialogue, topic_complete: bool) -> bool {
        self.progress.arcs[self.progress.arc_idx]
            .dialogues
            .push(dialogue);
        if topic_complete {
            self.step()
        } else {
            false
        }
    }

    pub fn recent_dialogues(&self, n: usize) -> &[Dialogue] {
        let d = &self.progress.arcs[self.progress.arc_idx].dialogues;
        let start = d.len().saturating_sub(n);
        &d[start..]
    }

    pub fn get_current_state(&self) -> Option<(&JourneyArc, &ArcTopic, Blackboard)> {
        let topic = self.get_topic(
            self.progress.arc_idx,
            self.progress.arcs[self.progress.arc_idx].topic_idx,
        );

        let arc = self.get_arc(self.progress.arc_idx);
        match (arc, topic) {
            (Some(arc), Some(topic)) => {
                let dialogue = self.progress.arcs[self.progress.arc_idx].dialogues.last();
                let mut blackboard = Blackboard::empty();
                if let Some(dialogue) = dialogue {
                    blackboard = dialogue.blackboard.clone();
                }
                Some((arc, topic, blackboard))
            }
            _ => None,
        }
    }
}

impl DbObject for JourneyArtifacts {
    fn save(&self) -> Result<()> {
        Ok(JourneysRepo::update(self)?)
    }
}
