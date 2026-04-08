use serde::{Deserialize, Serialize};

use super::journey::{JourneyArtifacts, JourneyProgress};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MetisPhase {
    Idle,
    Onboarding,
    Advising,
    Teaching,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct TeachingState {
    pub journey: JourneyArtifacts,
    pub progress: JourneyProgress,
}
