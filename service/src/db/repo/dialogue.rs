use crate::{app::journey::{blackboard::Blackboard, dialogue::Dialogue}, db::get_database, error::Result};

pub struct DialoguesRepo;

impl DialoguesRepo {
    pub fn insert(dialogue: &Dialogue) -> Result<()> {
        let blackboard_json = serde_json::to_string(&dialogue.blackboard)?;
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "INSERT INTO dialogues (journey_id, arc_idx, topic_idx, idx, content, blackboard_json, heading, marked_complete)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)",
            rusqlite::params![
                dialogue.journey_id,
                dialogue.arc_idx,
                dialogue.topic_idx,
                dialogue.idx,
                dialogue.content,
                blackboard_json,
                dialogue.heading,
                dialogue.marked_complete as i64,
            ],
        )?;
        Ok(())
    }

    pub fn get_by_journey(journey_id: i64) -> Result<Vec<Dialogue>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT journey_id, arc_idx, topic_idx, idx, content, blackboard_json, heading, marked_complete
             FROM dialogues
             WHERE journey_id = ?1
             ORDER BY arc_idx, topic_idx, idx",
        )?;
        let mut rows = stmt.query(rusqlite::params![journey_id])?;
        let mut out = Vec::new();
        while let Some(row) = rows.next()? {
            let bb_json: String = row.get(5)?;
            let blackboard: Blackboard =
                serde_json::from_str(&bb_json).unwrap_or_else(|_| Blackboard::empty());
            out.push(Dialogue {
                journey_id: row.get(0)?,
                arc_idx: row.get::<_, i64>(1)? as usize,
                topic_idx: row.get::<_, i64>(2)? as usize,
                idx: row.get::<_, i64>(3)? as usize,
                content: row.get(4)?,
                blackboard,
                heading: row.get(6)?,
                marked_complete: row.get::<_, i64>(7)? != 0,
            });
        }
        Ok(out)
    }

    pub fn count_completed_topics(journey_id: i64) -> Result<usize> {
        let conn = get_database().conn.lock().unwrap();
        let count: i64 = conn.query_row(
            "SELECT COUNT(DISTINCT arc_idx || '-' || topic_idx)
             FROM dialogues
             WHERE journey_id = ?1 AND marked_complete = 1",
            rusqlite::params![journey_id],
            |row| row.get(0),
        )?;
        Ok(count as usize)
    }
}
