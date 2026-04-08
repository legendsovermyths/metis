use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;

use crate::{
    app::journey::{Journey, JourneyProgress},
    db::get_database,
    error::Result,
};

#[derive(Debug, Clone, Serialize)]
pub struct JourneyRow {
    pub id: i64,
    pub chapter_title: String,
    pub chapter_dir: String,
    pub journey: Journey,
    pub created_at: i64,
    pub advisor_notes: String,
    pub progress: JourneyProgress,
}

pub struct JourneysRepo;

fn parse_progress(raw: Option<String>) -> JourneyProgress {
    raw.and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default()
}

impl JourneysRepo {
    pub fn insert(
        chapter_title: &str,
        chapter_dir: &str,
        journey: &Journey,
        advisor_notes: &str,
    ) -> Result<i64> {
        let journey_json = serde_json::to_string(journey)?;
        let created_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "INSERT INTO journeys (chapter_title, chapter_dir, journey_json, created_at, advisor_notes) VALUES (?1, ?2, ?3, ?4, ?5)",
            rusqlite::params![chapter_title, chapter_dir, journey_json, created_at, advisor_notes],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get(id: i64) -> Result<Option<JourneyRow>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, chapter_title, chapter_dir, journey_json, created_at, advisor_notes, progress_json FROM journeys WHERE id = ?1",
        )?;
        let mut rows = stmt.query(rusqlite::params![id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(JourneyRow {
                id: row.get(0)?,
                chapter_title: row.get(1)?,
                chapter_dir: row.get(2)?,
                journey: serde_json::from_str(&row.get::<_, String>(3)?)?,
                created_at: row.get(4)?,
                advisor_notes: row.get(5)?,
                progress: parse_progress(row.get(6)?),
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_latest() -> Result<Option<JourneyRow>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, chapter_title, chapter_dir, journey_json, created_at, advisor_notes, progress_json FROM journeys ORDER BY created_at DESC LIMIT 1",
        )?;
        let mut rows = stmt.query([])?;
        if let Some(row) = rows.next()? {
            Ok(Some(JourneyRow {
                id: row.get(0)?,
                chapter_title: row.get(1)?,
                chapter_dir: row.get(2)?,
                journey: serde_json::from_str(&row.get::<_, String>(3)?)?,
                created_at: row.get(4)?,
                advisor_notes: row.get(5)?,
                progress: parse_progress(row.get(6)?),
            }))
        } else {
            Ok(None)
        }
    }

    pub fn get_all() -> Result<Vec<JourneyRow>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT id, chapter_title, chapter_dir, journey_json, created_at, advisor_notes, progress_json FROM journeys ORDER BY created_at DESC",
        )?;
        let mut rows = stmt.query([])?;
        let mut out = Vec::new();
        while let Some(row) = rows.next()? {
            out.push(JourneyRow {
                id: row.get(0)?,
                chapter_title: row.get(1)?,
                chapter_dir: row.get(2)?,
                journey: serde_json::from_str(&row.get::<_, String>(3)?)?,
                created_at: row.get(4)?,
                advisor_notes: row.get(5)?,
                progress: parse_progress(row.get(6)?),
            });
        }
        Ok(out)
    }

    pub fn update_progress(id: i64, progress: &JourneyProgress) -> Result<()> {
        let json = serde_json::to_string(progress)?;
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "UPDATE journeys SET progress_json = ?2 WHERE id = ?1",
            rusqlite::params![id, json],
        )?;
        Ok(())
    }
}

