use serde::{Deserialize, Serialize};

use crate::{app::journey::artifact::JourneyArtifacts, db::persistence::Persistent};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MetisPhase {
    Idle,
    Onboarding,
    Advising,
    Teaching,
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TeachingContext {
    pub artifacts: Option<Persistent<JourneyArtifacts>>,
}

impl TeachingContext {
    pub fn new() -> Self {
        Self { artifacts: None }
    }
}
