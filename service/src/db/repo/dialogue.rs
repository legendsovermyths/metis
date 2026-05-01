use crate::{
    app::journey::{
        blackboard::{Blackboard, ElementDescriptor, Segment},
        dialogue::Dialogue,
    },
    db::get_database,
    error::Result,
    utils::db::json_col_to_vec,
};

pub struct DialoguesRepo;

fn dialogue_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<Dialogue> {
    let bb_json: String = row.get(5)?;
    let blackboard: Blackboard =
        serde_json::from_str(&bb_json).unwrap_or_else(|_| Blackboard::empty());
    let segments = json_col_to_vec(row.get(9)?);
    let elements = json_col_to_vec(row.get(10)?);
    Ok(Dialogue {
        journey_id: row.get(0)?,
        arc_idx: row.get::<_, i64>(1)? as usize,
        topic_idx: row.get::<_, i64>(2)? as usize,
        idx: row.get::<_, i64>(3)? as usize,
        content: row.get(4)?,
        blackboard,
        heading: row.get(6)?,
        marked_complete: row.get::<_, i64>(7)? != 0,
        visible: row.get::<_, i64>(8)? != 0,
        segments,
        elements,
    })
}

impl DialoguesRepo {
    pub fn insert(dialogue: &Dialogue) -> Result<()> {
        let blackboard_json = serde_json::to_string(&dialogue.blackboard)?;
        let segments_json = serde_json::to_value(&dialogue.segments)?.to_string();
        let elements_json = serde_json::to_value(&dialogue.elements)?.to_string();
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "INSERT INTO dialogues (journey_id, arc_idx, topic_idx, idx, content, blackboard_json, heading, marked_complete, visible, segments_json, elements_json)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)",
            rusqlite::params![
                dialogue.journey_id,
                dialogue.arc_idx,
                dialogue.topic_idx,
                dialogue.idx,
                dialogue.content,
                blackboard_json,
                dialogue.heading,
                dialogue.marked_complete as i64,
                dialogue.visible as i64,
                segments_json,
                elements_json,
            ],
        )?;
        Ok(())
    }

    pub fn get_visible_for_journey(journey_id: i64) -> Result<Vec<Dialogue>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT journey_id, arc_idx, topic_idx, idx, content, blackboard_json, heading, marked_complete, visible, segments_json, elements_json
             FROM dialogues
             WHERE journey_id = ?1 AND visible = 1
             ORDER BY arc_idx, topic_idx, idx",
        )?;
        let mut rows = stmt.query(rusqlite::params![journey_id])?;
        let mut out = Vec::new();
        while let Some(row) = rows.next()? {
            out.push(dialogue_from_row(&row)?);
        }
        Ok(out)
    }

    pub fn mark_visible(
        journey_id: i64,
        arc_idx: usize,
        topic_idx: usize,
        idx: usize,
    ) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "UPDATE dialogues SET visible = 1
             WHERE journey_id = ?1 AND arc_idx = ?2 AND topic_idx = ?3 AND idx = ?4",
            rusqlite::params![journey_id, arc_idx as i64, topic_idx as i64, idx as i64],
        )?;
        Ok(())
    }

    pub fn get_next_invisible(journey_id: i64) -> Result<Option<Dialogue>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT journey_id, arc_idx, topic_idx, idx, content, blackboard_json, heading, marked_complete, visible, segments_json, elements_json
             FROM dialogues
             WHERE journey_id = ?1 AND visible = 0
             ORDER BY arc_idx, topic_idx, idx
             LIMIT 1",
        )?;
        let mut rows = stmt.query(rusqlite::params![journey_id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(dialogue_from_row(&row)?))
        } else {
            Ok(None)
        }
    }

    pub fn get_last_for_journey(journey_id: i64) -> Result<Option<Dialogue>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT journey_id, arc_idx, topic_idx, idx, content, blackboard_json, heading, marked_complete, visible, segments_json, elements_json
             FROM dialogues
             WHERE journey_id = ?1
             ORDER BY arc_idx DESC, topic_idx DESC, idx DESC
             LIMIT 1",
        )?;
        let mut rows = stmt.query(rusqlite::params![journey_id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(dialogue_from_row(&row)?))
        } else {
            Ok(None)
        }
    }

    pub fn get_recent_for_journey(journey_id: i64, n: usize) -> Result<Vec<Dialogue>> {
        if n == 0 {
            return Ok(Vec::new());
        }
        let n_i64 = n as i64;
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT journey_id, arc_idx, topic_idx, idx, content, blackboard_json, heading, marked_complete, visible, segments_json, elements_json
             FROM dialogues
             WHERE journey_id = ?1
             ORDER BY arc_idx DESC, topic_idx DESC, idx DESC
             LIMIT ?2",
        )?;
        let mut rows = stmt.query(rusqlite::params![journey_id, n_i64])?;
        let mut out = Vec::new();
        while let Some(row) = rows.next()? {
            out.push(dialogue_from_row(&row)?);
        }
        out.reverse();
        Ok(out)
    }

    pub fn count_completed_topics(journey_id: i64) -> Result<usize> {
        let conn = get_database().conn.lock().unwrap();
        let count: i64 = conn.query_row(
            "SELECT COUNT(DISTINCT arc_idx || '-' || topic_idx)
             FROM dialogues
             WHERE journey_id = ?1 AND marked_complete = 1 AND visible = 1",
            rusqlite::params![journey_id],
            |row| row.get(0),
        )?;
        Ok(count as usize)
    }
}
