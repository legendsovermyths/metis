use std::fs;

use serde::{Deserialize, Serialize};

#[derive(Deserialize, Serialize)]
pub struct Resource {
    pub id: Option<i64>,
    pub path: String,
    pub content: String,
    pub agent_notes: String,
}

const RESOURCE_PATH: &str = "../Resources";
impl Resource {
    pub fn get_path() -> String {
        RESOURCE_PATH.to_string()
    }
    pub fn new(content: String, notes: String) -> Self {
        let mut filename = uuid::Uuid::new_v4().to_string();
        filename.push_str(".md");
        let mut filepath = Resource::get_path();
        filepath.push_str(&filename);
        let _ = fs::write(filepath.clone(), &content);
        Resource {
            id: None,
            path: filepath,
            content,
            agent_notes: notes,
        }
    }
}
