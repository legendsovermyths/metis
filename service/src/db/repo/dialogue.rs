use crate::{
    app::dialogue::{blackboard::Blackboard, Dialogue, DialogueReference, ReferenceKind},
    db::get_database,
    error::{MetisError, Result},
    utils::db::json_col_to_vec,
};

pub struct DialoguesRepo;

const SELECT_COLS: &str =
    "id, idx, is_ready, visible, marked_complete, content, blackboard_json, heading, segments_json, reference_json";

fn dialogue_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<Dialogue> {
    let bb_json: String = row.get(6)?;
    let blackboard: Blackboard =
        serde_json::from_str(&bb_json).unwrap_or_else(|_| Blackboard::empty());
    let segments = json_col_to_vec(row.get(8)?);
    let ref_json: String = row.get(9)?;
    let reference: DialogueReference =
        serde_json::from_str(&ref_json).unwrap_or(DialogueReference::None);
    Ok(Dialogue {
        id: Some(row.get(0)?),
        idx: row.get::<_, i64>(1)? as usize,
        is_ready: row.get::<_, i64>(2)? != 0,
        visible: row.get::<_, i64>(3)? != 0,
        marked_complete: row.get::<_, i64>(4)? != 0,
        content: row.get(5)?,
        blackboard,
        heading: row.get(7)?,
        segments,
        reference,
    })
}

impl DialoguesRepo {
    pub fn insert(dialogue: &Dialogue) -> Result<i64> {
        let blackboard_json = serde_json::to_string(&dialogue.blackboard)?;
        let segments_json = serde_json::to_value(&dialogue.segments)?.to_string();
        let reference_json = serde_json::to_string(&dialogue.reference)?;
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "INSERT INTO dialogues (reference_kind, parent_id, idx, is_ready, visible, marked_complete, content, blackboard_json, heading, segments_json, reference_json)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            rusqlite::params![
                dialogue.reference.kind().as_str(),
                dialogue.reference.parent_id(),
                dialogue.idx as i64,
                dialogue.is_ready as i64,
                dialogue.visible as i64,
                dialogue.marked_complete as i64,
                dialogue.content,
                blackboard_json,
                dialogue.heading,
                segments_json,
                reference_json,
            ],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_by_id(id: i64) -> Result<Dialogue>{
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(&format!(
            "SELECT {SELECT_COLS} FROM dialogues WHERE id = ?1"
        ))?;
        let mut rows = stmt.query(rusqlite::params![id])?;
        if let Some(row) = rows.next()? {
            Ok(dialogue_from_row(&row)?)
        } else {
            Err(MetisError::InternalDataError("dialogue id does not exist in repository".to_string()))
        }
    }

    pub fn get_for_parent(kind: ReferenceKind, parent_id: i64) -> Result<Vec<Dialogue>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(&format!(
            "SELECT {SELECT_COLS} FROM dialogues
             WHERE reference_kind = ?1 AND parent_id = ?2
             ORDER BY idx"
        ))?;
        let mut rows = stmt.query(rusqlite::params![kind.as_str(), parent_id])?;
        let mut out = Vec::new();
        while let Some(row) = rows.next()? {
            out.push(dialogue_from_row(&row)?);
        }
        Ok(out)
    }

    pub fn update(dialogue: &Dialogue) -> Result<()> {
        let id = dialogue.id.ok_or_else(|| {
            MetisError::InternalError("Dialogue passed without id to update".to_string())
        })?;
        let blackboard_json = serde_json::to_string(&dialogue.blackboard)?;
        let segments_json = serde_json::to_value(&dialogue.segments)?.to_string();
        let reference_json = serde_json::to_string(&dialogue.reference)?;
        let conn = get_database().conn.lock().unwrap();
        let rows_affected = conn.execute(
            "UPDATE dialogues
             SET idx = ?2, is_ready = ?3, visible = ?4, marked_complete = ?5,
                 content = ?6, blackboard_json = ?7, heading = ?8, segments_json = ?9, reference_json = ?10
             WHERE id = ?1",
            rusqlite::params![
                id,
                dialogue.idx as i64,
                dialogue.is_ready as i64,
                dialogue.visible as i64,
                dialogue.marked_complete as i64,
                dialogue.content,
                blackboard_json,
                dialogue.heading,
                segments_json,
                reference_json,
            ],
        )?;
        if rows_affected == 0 {
            return Err(MetisError::NotFound(format!(
                "dialogue {} — update affected zero rows",
                id
            )));
        }
        Ok(())
    }

    pub fn mark_visible(id: i64) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "UPDATE dialogues SET visible = 1 WHERE id = ?1",
            rusqlite::params![id],
        )?;
        Ok(())
    }

    pub fn delete_for_parent(kind: ReferenceKind, parent_id: i64) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "DELETE FROM dialogues WHERE reference_kind = ?1 AND parent_id = ?2",
            rusqlite::params![kind.as_str(), parent_id],
        )?;
        Ok(())
    }

    pub fn delete_single(dialogue_id: i64) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "DELETE FROM dialogues WHERE id = ?1",
            rusqlite::params![dialogue_id],
        )?;
        Ok(())
    }
}
