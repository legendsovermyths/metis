use serde::{Deserialize, Serialize};
use std::collections::HashMap;

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

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Document {
    pub document_type: DocumentType,
    pub table_of_content: Vec<Section>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Section {
    pub title: String,
    pub sub_sections: Vec<SubSection>,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct SubSection {
    pub title: String,
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub enum DocumentType {
    ResearchPaper,
    BlogPost,
    TechnicalDocument,
    Documentation,
    Infographic,
    Tutorial,
    FAQ,
}
