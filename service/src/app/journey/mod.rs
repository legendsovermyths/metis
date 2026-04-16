pub mod artifact;
pub mod blackboard;
pub mod progress;
pub mod dialogue;

use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone)]
pub struct Journey {
    pub journey_title: String,
    pub arcs: Vec<JourneyArc>,
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
