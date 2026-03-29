use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Serialize, Deserialize)]
pub struct Book {
    id: i64,
    title: String,
    table_of_content: Vec<Chapter>,
    pages: Option<HashMap<usize, String>>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Chapter {
    pub title: String,
    pub topics: Vec<Topic>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Topic {
    pub title: String,
}

impl Book {
    pub fn new(id: i64, title: String, chapters: Vec<Chapter>) -> Self {
        Book { id, title, table_of_content: chapters, pages: None }
    }
}
