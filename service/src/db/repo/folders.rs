use dborm::DbRow;

use crate::{
    app::{
        explanation::artifact::ExplanationArtifacts,
        folder::Folder,
        journey::artifact::JourneyArtifacts,
        notes::Note,
    },
    db::{object::FromDbRow, repo::Repository},
    error::Result,
};

#[derive(Debug, Clone, DbRow)]
#[db(table = "folders")]
pub struct FolderRecord {
    #[db(id)]
    pub id: i64,
    pub name: String,
    pub parent_id: Option<i64>,
    pub scope: String,
    #[db(insert_only)]
    pub created_at: i64,
}

impl FromDbRow for Folder {
    type DbRow = FolderRecord;

    fn from_row_type(record: FolderRecord) -> Result<Self> {
        Ok(Folder {
            id: record.id,
            name: record.name,
            parent_id: record.parent_id,
            scope: record.scope,
            created_at: record.created_at,
        })
    }

    fn into_row_type(&self) -> FolderRecord {
        FolderRecord {
            id: self.id,
            name: self.name.clone(),
            parent_id: self.parent_id,
            scope: self.scope.clone(),
            created_at: self.created_at,
        }
    }

    fn on_delete(id: &i64) -> Result<()> {
        let parent_id = Repository::<Folder>::find_by_id(id)?.read().parent_id;
        Repository::<Folder>::update_where(
            "parent_id = ?2",
            "parent_id = ?1",
            rusqlite::params![id, parent_id],
        )?;
        Repository::<ExplanationArtifacts>::update_where(
            "folder_id = ?2",
            "folder_id = ?1",
            rusqlite::params![id, parent_id],
        )?;
        Repository::<JourneyArtifacts>::update_where(
            "folder_id = ?2",
            "folder_id = ?1",
            rusqlite::params![id, parent_id],
        )?;
        Repository::<Note>::update_where(
            "folder_id = ?2",
            "folder_id = ?1",
            rusqlite::params![id, parent_id],
        )?;
        Ok(())
    }
}
