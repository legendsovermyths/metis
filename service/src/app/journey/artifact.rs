use serde::{Deserialize, Serialize};

use crate::app::journey::{progress::JourneyProgress, ArcTopic, Journey, JourneyArc};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct JourneyArtifacts {
    pub id: Option<i64>,
    pub chapter_title: String,
    pub chapter_dir: String,
    pub journey: Journey,
    pub advisor_notes: String,
    pub tutor_notes: String,
    pub folder_id: Option<i64>,
    pub created_at: i64,
    pub progress: JourneyProgress,
    pub generation_progress: JourneyProgress,
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
}
