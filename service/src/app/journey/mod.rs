pub mod artifact;
pub mod progress;

use serde::{Deserialize, Serialize};

use crate::app::dialogue::kind::DialogueKind;

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
    #[serde(default)]
    pub mode: Option<TeachingMode>,
    #[serde(default)]
    pub generation_kind: DialogueKind
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
