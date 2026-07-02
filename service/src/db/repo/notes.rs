use std::time::{SystemTime, UNIX_EPOCH};

use crate::{
    app::notes::{Anchor, Note},
    db::get_database,
    error::{MetisError, Result},
};

pub struct NotesRepo;

fn now() -> i64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs() as i64
}

fn note_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<Note> {
    let anchor_json: Option<String> = row.get(3)?;
    let anchor = anchor_json.and_then(|s| serde_json::from_str(&s).ok());
    Ok(Note {
        id: Some(row.get(0)?),
        title: row.get(1)?,
        content: row.get(2)?,
        anchor,
        folder_id: row.get(4)?,
        created_at: row.get(5)?,
        updated_at: row.get(6)?,
    })
}

impl NotesRepo {
    pub fn insert(
        title: &str,
        content: &str,
        anchor: Option<&Anchor>,
        folder_id: Option<i64>,
    ) -> Result<i64> {
        let ts = now();
        let anchor_json = anchor.map(serde_json::to_string).transpose()?;
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "INSERT INTO notes (title, content, anchor, folder_id, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?5)",
            rusqlite::params![title, content, anchor_json, folder_id, ts],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_all() -> Result<Vec<Note>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, title, content, anchor, folder_id, created_at, updated_at
             FROM notes ORDER BY updated_at DESC",
        )?;
        let mut rows = stmt.query([])?;
        let mut out = Vec::new();
        while let Some(row) = rows.next()? {
            out.push(note_from_row(row)?);
        }
        Ok(out)
    }

    pub fn update(id: i64, title: &str, content: &str) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        let rows_affected = conn.execute(
            "UPDATE notes SET title = ?2, content = ?3, updated_at = ?4 WHERE id = ?1",
            rusqlite::params![id, title, content, now()],
        )?;
        if rows_affected == 0 {
            return Err(MetisError::NotFound(format!("note {}", id)));
        }
        Ok(())
    }

    pub fn set_folder(id: i64, folder_id: Option<i64>) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "UPDATE notes SET folder_id = ?2 WHERE id = ?1",
            rusqlite::params![id, folder_id],
        )?;
        Ok(())
    }

    pub fn delete(id: i64) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute("DELETE FROM notes WHERE id = ?1", rusqlite::params![id])?;
        Ok(())
    }
}
