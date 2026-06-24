use serde::{Deserialize, Serialize};

use crate::{app::{dialogue::ReferenceKind, journey::artifact::JourneyArtifacts}, db::persistence::Persistent};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub enum MetisPhase {
    Idle,
    Onboarding,
    Advising,
    Teaching,
    Exploring
}

#[derive(Serialize, Deserialize, Clone)]
pub struct TeachingContext {
    pub artifact_id: Option<i64>,
    pub artifact_kind: Option<ReferenceKind>,
}

impl TeachingContext {
    pub fn new(artifact_kind: ReferenceKind, artifact_id: i64) -> Self {
        Self { artifact_kind: Some(artifact_kind), artifact_id: Some(artifact_id) }
    }
}

impl Default for TeachingContext{
    fn default() -> Self {
        Self { artifact_id: None, artifact_kind: None }
    }
}
