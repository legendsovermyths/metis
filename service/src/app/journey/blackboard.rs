use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Blackboard {
    pub description: String,
    pub image_url: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ElementDescriptor {
    pub id: String,
    pub desc: String,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum SegmentAction {
    Reveal { targets: Vec<String> },
    Focus { targets: Vec<String> },
    Morph {
        from: String,
        to: String,
        #[serde(default = "default_morph_ms")]
        duration_ms: u32,
    },
    Trace {
        target: String,
        along: String,
        #[serde(default = "default_trace_ms")]
        duration_ms: u32,
        #[serde(default)]
        from_pct: f64,
        #[serde(default = "default_to_pct")]
        to_pct: f64,
    },
    Connect {
        from: String,
        to: String,
        #[serde(default = "default_connect_ms")]
        duration_ms: u32,
    },
    Pulse {
        targets: Vec<String>,
        #[serde(default = "default_pulse_ms")]
        duration_ms: u32,
    },
}

fn default_morph_ms() -> u32 { 2000 }
fn default_trace_ms() -> u32 { 2000 }
fn default_connect_ms() -> u32 { 800 }
fn default_pulse_ms() -> u32 { 400 }
fn default_to_pct() -> f64 { 1.0 }

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Segment {
    pub text: String,
    #[serde(default)]
    pub actions: Vec<SegmentAction>,
}

impl Blackboard {
    pub fn empty() -> Self {
        Self {
            description: String::new(),
            image_url: None,
        }
    }

    pub fn new(description: String, image_url: Option<String>) -> Self {
        Self {
            description,
            image_url,
        }
    }
}

pub enum BlackboardInstructions {
    Clear,
    Detailed(String),
}

impl<'de> Deserialize<'de> for BlackboardInstructions {
    fn deserialize<D>(deserializer: D) -> Result<Self, D::Error>
    where
        D: serde::Deserializer<'de>,
    {
        let instruction = String::deserialize(deserializer)?;
        match instruction.to_lowercase().as_str() {
            "clear" => Ok(BlackboardInstructions::Clear),
            other => Ok(BlackboardInstructions::Detailed(other.to_string())),
        }
    }
}
