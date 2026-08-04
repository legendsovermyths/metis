use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Book {
    pub table_of_content: Vec<Chapter>,
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

