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
pub struct Segment {
    pub text: String,
    pub reveals: Vec<String>,
    pub focus: Vec<String>,
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
    Persist,
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
            "persist" => Ok(BlackboardInstructions::Persist),
            other => Ok(BlackboardInstructions::Detailed(other.to_string())),
        }
    }
}
