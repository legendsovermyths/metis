use serde::{Deserialize, Serialize};


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
