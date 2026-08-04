use dborm::DbRow;

use crate::{
    app::notes::{Anchor, Note},
    db::object::FromDbRow,
    error::Result,
};

#[derive(Debug, Clone, DbRow)]
#[db(table = "notes")]
pub struct NoteRecord {
    #[db(id)]
    pub id: i64,
    pub title: String,
    pub content: String,
    #[db(json)]
    pub anchor: Option<Anchor>,
    pub folder_id: Option<i64>,
    #[db(insert_only)]
    pub created_at: i64,
    pub updated_at: i64,
}

impl FromDbRow for Note {
    type DbRow = NoteRecord;

    fn from_row_type(record: NoteRecord) -> Result<Self> {
        Ok(Note {
            id: Some(record.id),
            title: record.title,
            content: record.content,
            anchor: record.anchor,
            folder_id: record.folder_id,
            created_at: record.created_at,
            updated_at: record.updated_at,
        })
    }

    fn into_row_type(&self) -> NoteRecord {
        NoteRecord {
            id: self.id.unwrap_or(0),
            title: self.title.clone(),
            content: self.content.clone(),
            anchor: self.anchor.clone(),
            folder_id: self.folder_id,
            created_at: self.created_at,
            updated_at: self.updated_at,
        }
    }
}
