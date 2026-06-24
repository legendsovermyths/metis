use std::time::{SystemTime, UNIX_EPOCH};

use crate::{app::explanation::folder::Folder, db::get_database, error::Result};

pub struct FoldersRepo;

fn folder_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<Folder> {
    Ok(Folder {
        id: row.get(0)?,
        name: row.get(1)?,
        parent_id: row.get(2)?,
        created_at: row.get(3)?,
    })
}

impl FoldersRepo {
    pub fn insert(name: &str, parent_id: Option<i64>) -> Result<i64> {
        let created_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "INSERT INTO folders (name, parent_id, created_at) VALUES (?1, ?2, ?3)",
            rusqlite::params![name, parent_id, created_at],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get_all() -> Result<Vec<Folder>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn
            .prepare("SELECT id, name, parent_id, created_at FROM folders ORDER BY name COLLATE NOCASE")?;
        let mut rows = stmt.query([])?;
        let mut out = Vec::new();
        while let Some(row) = rows.next()? {
            out.push(folder_from_row(row)?);
        }
        Ok(out)
    }

    pub fn rename(id: i64, name: &str) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "UPDATE folders SET name = ?2 WHERE id = ?1",
            rusqlite::params![id, name],
        )?;
        Ok(())
    }

    pub fn set_parent(id: i64, parent_id: Option<i64>) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "UPDATE folders SET parent_id = ?2 WHERE id = ?1",
            rusqlite::params![id, parent_id],
        )?;
        Ok(())
    }

    pub fn delete(id: i64) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        let parent_id: Option<i64> = conn
            .query_row(
                "SELECT parent_id FROM folders WHERE id = ?1",
                rusqlite::params![id],
                |row| row.get(0),
            )
            .ok()
            .flatten();
        conn.execute(
            "UPDATE folders SET parent_id = ?2 WHERE parent_id = ?1",
            rusqlite::params![id, parent_id],
        )?;
        conn.execute(
            "UPDATE explanations SET folder_id = ?2 WHERE folder_id = ?1",
            rusqlite::params![id, parent_id],
        )?;
        conn.execute("DELETE FROM folders WHERE id = ?1", rusqlite::params![id])?;
        Ok(())
    }
}
