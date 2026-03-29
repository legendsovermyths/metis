use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize)]
pub struct Journey {
    pub journey_title: String,
    pub arcs: Vec<JourneyArc>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct JourneyArc {
    pub arc_title: String,
    pub topics: Vec<ArcTopic>,
}

#[derive(Debug, Deserialize, Serialize)]
pub struct ArcTopic {
    pub name: String,
    pub mode: TeachingMode,
}

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "lowercase")]
pub enum TeachingMode {
    Reinvent,
    Discover,
    Derive,
    Connect,
    Introduce,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct TopicRange {
    pub topic: String,
    pub start_page: usize,
    pub end_page: usize,
}
