use std::{fs, path::Path};

use serde::{Deserialize, Serialize};

use crate::error::Result;

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
    pub fn new(content: String, notes: String) -> Result<Self> {
        fs::create_dir_all(RESOURCE_PATH)?;
        let filename = format!("{}.md", uuid::Uuid::new_v4());
        let filepath = Path::new(RESOURCE_PATH).join(filename);
        fs::write(&filepath, &content)?;
        Ok(Resource {
            id: None,
            path: filepath.to_string_lossy().into_owned(),
            content,
            agent_notes: notes,
        })
    }
}
