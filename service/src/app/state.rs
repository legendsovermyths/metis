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
pub struct TeachingState {
    pub artifacts: Persistent<JourneyArtifacts>,
}
