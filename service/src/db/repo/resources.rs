use dborm::DbRow;

use crate::{
    app::user_input::resource::{Resource, ResourceType},
    db::object::FromDbRow,
    error::Result,
};

#[derive(Debug, Clone, DbRow)]
#[db(table = "resources")]
pub struct ResourceRecord {
    #[db(id)]
    pub id: i64,
    pub title: String,
    pub path: String,
    pub description: String,
    pub agent_notes: String,
    #[db(json)]
    pub resource_type: ResourceType,
    #[db(insert_only)]
    pub created_at: i64,
}

impl FromDbRow for Resource {
    type DbRow = ResourceRecord;

    fn from_row_type(record: ResourceRecord) -> Result<Self> {
        Ok(Resource {
            id: Some(record.id),
            title: record.title,
            path: record.path,
            description: record.description,
            agent_notes: record.agent_notes,
            resource_type: record.resource_type,
            created_at: record.created_at,
        })
    }

    fn into_row_type(&self) -> ResourceRecord {
        ResourceRecord {
            id: self.id.unwrap_or(0),
            title: self.title.clone(),
            path: self.path.clone(),
            description: self.description.clone(),
            agent_notes: self.agent_notes.clone(),
            resource_type: self.resource_type.clone(),
            created_at: self.created_at,
        }
    }
}
