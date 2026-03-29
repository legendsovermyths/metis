use crate::{db::get_database, error::Result};

pub struct AppDataRepo;

impl AppDataRepo {
    pub fn set(key: &str, value: &str) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "INSERT INTO appdata (key, value) VALUES (?1, ?2) ON CONFLICT(key) DO UPDATE SET value = ?2",
            rusqlite::params![key, value],
        )?;
        Ok(())
    }

    pub fn get(key: &str) -> Result<Option<String>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare("SELECT value FROM appdata WHERE key = ?1")?;
        let mut rows = stmt.query(rusqlite::params![key])?;
        if let Some(row) = rows.next()? {
            Ok(Some(row.get(0)?))
        } else {
            Ok(None)
        }
    }

    pub fn delete(key: &str) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute("DELETE FROM appdata WHERE key = ?1", rusqlite::params![key])?;
        Ok(())
    }
}
