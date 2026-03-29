use crate::{app::book::Chapter, db::get_database, error::Result};

pub struct BookRow {
    pub id: i64,
    pub title: String,
    pub path: String,
    pub toc: Vec<Chapter>,
    pub gemini_file_uri: Option<String>,
    pub gemini_uploaded_at: Option<i64>,
}

pub struct BooksRepo;

impl BooksRepo {
    pub fn insert(title: &str, path: &str, toc: &Vec<Chapter>) -> Result<i64> {
        let toc_json = serde_json::to_string(toc)?;
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "INSERT INTO books (title, path, toc) VALUES (?1, ?2, ?3)",
            rusqlite::params![title, path, toc_json],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn update_file_uri(id: i64, uri: &str, uploaded_at: i64) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "UPDATE books SET gemini_file_uri = ?1, gemini_uploaded_at = ?2 WHERE id = ?3",
            rusqlite::params![uri, uploaded_at, id],
        )?;
        Ok(())
    }

    pub fn get(id: i64) -> Result<Option<BookRow>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, title, path, toc, gemini_file_uri, gemini_uploaded_at FROM books WHERE id = ?1",
        )?;

        let mut rows = stmt.query(rusqlite::params![id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(BookRow {
                id: row.get(0)?,
                title: row.get(1)?,
                path: row.get(2)?,
                toc: serde_json::from_str(&row.get::<_, String>(3)?)?,
                gemini_file_uri: row.get(4)?,
                gemini_uploaded_at: row.get(5)?,
            }))
        } else {
            Ok(None)
        }
    }

    pub fn list() -> Result<Vec<BookRow>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, title, path, toc, gemini_file_uri, gemini_uploaded_at FROM books",
        )?;
        let rows = stmt.query_map([], |row| {
            let toc_str: String = row.get(3)?;
            Ok(BookRow {
                id: row.get(0)?,
                title: row.get(1)?,
                path: row.get(2)?,
                toc: serde_json::from_str(&toc_str).unwrap(),
                gemini_file_uri: row.get(4)?,
                gemini_uploaded_at: row.get(5)?,
            })
        })?;
        Ok(rows.collect::<std::result::Result<Vec<_>, _>>()?)
    }
}
