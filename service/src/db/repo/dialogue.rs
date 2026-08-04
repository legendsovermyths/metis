use dborm::DbRow;

use crate::{
    app::dialogue::{
        blackboard::Blackboard, segment::Segment, Dialogue, DialogueReference, ReferenceKind,
    },
    db::{persistence::Persistent, object::FromDbRow, repo::Repository},
    error::Result,
};

#[derive(Debug, Clone, DbRow)]
#[db(table = "dialogues")]
pub struct DialogueRecord {
    #[db(id)]
    pub id: i64,
    #[db(insert_only)]
    pub reference_kind: String,
    #[db(insert_only)]
    pub parent_id: i64,
    pub idx: i64,
    pub is_ready: bool,
    pub visible: bool,
    pub marked_complete: bool,
    pub content: String,
    #[db(column = "blackboard_json", json)]
    pub blackboard: Blackboard,
    pub heading: String,
    #[db(column = "segments_json", json)]
    pub segments: Option<Vec<Segment>>,
    #[db(column = "reference_json", json)]
    pub reference: DialogueReference,
}

impl FromDbRow for Dialogue {
    type DbRow = DialogueRecord;

    fn from_row_type(record: DialogueRecord) -> Result<Self> {
        Ok(Dialogue {
            id: Some(record.id),
            reference: record.reference,
            idx: record.idx as usize,
            content: record.content,
            blackboard: record.blackboard,
            heading: record.heading,
            marked_complete: record.marked_complete,
            visible: record.visible,
            segments: record.segments.unwrap_or_default(),
            is_ready: record.is_ready,
        })
    }

    fn into_row_type(&self) -> DialogueRecord {
        DialogueRecord {
            id: self.id.unwrap_or(0),
            reference_kind: self.reference.kind().as_str().to_string(),
            parent_id: self.reference.parent_id(),
            idx: self.idx as i64,
            is_ready: self.is_ready,
            visible: self.visible,
            marked_complete: self.marked_complete,
            content: self.content.clone(),
            blackboard: self.blackboard.clone(),
            heading: self.heading.clone(),
            segments: Some(self.segments.clone()),
            reference: self.reference.clone(),
        }
    }
}

pub struct DialoguesRepo;

impl DialoguesRepo {
    pub fn get_for_parent(kind: ReferenceKind, parent_id: i64) -> Result<Vec<Persistent<Dialogue>>> {
        Repository::<Dialogue>::query(
            "SELECT * FROM dialogues
             WHERE reference_kind = ?1 AND parent_id = ?2
             ORDER BY idx",
            rusqlite::params![kind.as_str(), parent_id],
        )
    }

    pub fn delete_for_parent(kind: ReferenceKind, parent_id: i64) -> Result<()> {
        Repository::<Dialogue>::delete_where(
            "reference_kind = ?1 AND parent_id = ?2",
            rusqlite::params![kind.as_str(), parent_id],
        )
    }
}
