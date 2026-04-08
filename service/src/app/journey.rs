use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Journey {
    pub journey_title: String,
    pub arcs: Vec<JourneyArc>,
}

/// Full artifact bundle after generating a course (matches DB row payload; used in AppContext).
#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct JourneyArtifacts {
    pub id: Option<i64>,
    pub chapter_title: String,
    pub chapter_dir: String,
    pub journey: Journey,
    pub advisor_notes: String,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct JourneyArc {
    pub arc_title: String,
    pub topics: Vec<ArcTopic>,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct ArcTopic {
    pub name: String,
    pub mode: TeachingMode,
}

#[derive(Debug, Deserialize, Serialize, Clone)]
#[serde(rename_all = "lowercase")]
pub enum TeachingMode {
    Reinvent,
    Discover,
    Derive,
    Connect,
    Introduce,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TopicRange {
    pub topic: String,
    pub start_page: usize,
    pub end_page: usize,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct JourneyProgress {
    pub arc_idx: usize,
    pub arcs: Vec<ArcProgress>,
    pub is_journey_complete: bool,
}

#[derive(Debug, Default, Clone, Serialize, Deserialize)]
pub struct ArcProgress {
    pub topic_idx: usize,
    pub dialogues: Vec<String>,
    pub completed: bool,
}

impl Journey {
    pub fn get_arc(&self, idx: usize) -> Option<&JourneyArc> {
        self.arcs.get(idx)
    }

    pub fn get_topic(&self, arc_idx: usize, topic_idx: usize) -> Option<&ArcTopic> {
        self.get_arc(arc_idx).and_then(|a| a.topics.get(topic_idx))
    }
}

impl JourneyProgress {
    /// Advance to the next topic (or next arc if current arc is done).
    /// Returns true if the entire journey is complete.
    pub fn advance(&mut self, journey: &Journey) -> bool {
        let arc_idx = self.arc_idx;
        let next_topic = self.arcs[arc_idx].topic_idx + 1;

        if journey.get_topic(arc_idx, next_topic).is_some() {
            self.arcs[arc_idx].topic_idx = next_topic;
            false
        } else {
            self.arcs[arc_idx].completed = true;
            let next_arc = arc_idx + 1;
            if journey.get_topic(next_arc, 0).is_some() {
                self.arc_idx = next_arc;
                if self.arcs.len() <= next_arc {
                    self.arcs.push(ArcProgress::default());
                }
                false
            } else {
                self.is_journey_complete = true;
                true
            }
        }
    }

    /// Push a dialogue chunk and optionally advance if the topic is complete.
    /// Returns true if the entire journey is now complete.
    pub fn push_dialogue(&mut self, dialogue: String, topic_complete: bool, journey: &Journey) -> bool {
        self.arcs[self.arc_idx].dialogues.push(dialogue);
        if topic_complete {
            self.advance(journey)
        } else {
            false
        }
    }

    /// Last N dialogues from the current arc for prompt context.
    pub fn recent_dialogues(&self, n: usize) -> &[String] {
        let d = &self.arcs[self.arc_idx].dialogues;
        let start = d.len().saturating_sub(n);
        &d[start..]
    }
}
