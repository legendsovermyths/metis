use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct Blackboard {
    pub elements: Vec<ElementDescriptor>,
    pub description: String,
    pub image_url: Option<String>,
}

#[derive(Deserialize, Serialize, Debug, Clone)]
pub struct ElementDescriptor {
    pub id: String,
    pub desc: String,
}


impl Blackboard {
    pub fn empty() -> Self {
        Self {
            elements: Vec::new(),
            description: String::new(),
            image_url: None,
        }
    }

    pub fn new(description: String, image_url: Option<String>) -> Self {
        Self {
            elements: Vec::new(),
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
