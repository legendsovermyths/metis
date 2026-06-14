use std::fs;
use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;

use crate::{
    app::user_input::resource::Resource,
    db::get_database,
    error::{MetisError, Result},
};

#[derive(Serialize)]
pub struct ResourceMeta {
    pub id: i64,
    pub path: String,
    pub agent_notes: String,
    pub created_at: i64,
}

pub struct ResourcesRepo;

fn resource_from_row(row: &rusqlite::Row<'_>) -> Result<Resource> {
    let path: String = row.get(1)?;
    let content = fs::read_to_string(&path)?;
    Ok(Resource {
        id: Some(row.get(0)?),
        path,
        content,
        agent_notes: row.get(2)?,
    })
}

impl ResourcesRepo {
    pub fn insert(resource: &Resource) -> Result<i64> {
        let created_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "INSERT INTO resources (path, agent_notes, created_at) VALUES (?1, ?2, ?3)",
            rusqlite::params![resource.path, resource.agent_notes, created_at],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get(id: i64) -> Result<Resource> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, path, agent_notes FROM resources WHERE id = ?1",
        )?;
        let mut rows = stmt.query(rusqlite::params![id])?;
        if let Some(row) = rows.next()? {
            Ok(resource_from_row(row)?)
        } else {
            Err(MetisError::NotFound(format!("resource {} not found", id)))
        }
    }

    pub fn get_all() -> Result<Vec<ResourceMeta>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, path, agent_notes, created_at FROM resources ORDER BY created_at DESC",
        )?;
        let mut rows = stmt.query([])?;
        let mut out = Vec::new();
        while let Some(row) = rows.next()? {
            out.push(ResourceMeta {
                id: row.get(0)?,
                path: row.get(1)?,
                agent_notes: row.get(2)?,
                created_at: row.get(3)?,
            });
        }
        Ok(out)
    }

    pub fn delete(id: i64) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute("DELETE FROM resources WHERE id = ?1", rusqlite::params![id])?;
        Ok(())
    }
}
