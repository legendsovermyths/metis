use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;

use crate::{
    app::{
        dialogue::{DialogueReference, ReferenceKind},
        journey::{artifact::JourneyArtifacts, progress::JourneyProgress, Journey, JourneyArc},
    },
    db::{get_database, repo::dialogue::DialoguesRepo},
    error::{MetisError, Result},
};

#[derive(Debug, Clone, Serialize)]
pub struct JourneyRow {
    pub id: i64,
    pub chapter_title: String,
    pub chapter_dir: String,
    pub journey: Journey,
    pub created_at: i64,
    pub advisor_notes: String,
    pub tutor_notes: String,
    pub completed_topics: usize,
    pub total_topics: usize,
}

pub struct JourneysRepo;

fn build_row(
    id: i64,
    chapter_title: String,
    chapter_dir: String,
    journey: Journey,
    created_at: i64,
    advisor_notes: String,
    tutor_notes: String,
    completed_topics: usize,
) -> JourneyRow {
    let total_topics = journey.arcs.iter().map(|a| a.topics.len()).sum();
    JourneyRow {
        id,
        chapter_title,
        chapter_dir,
        journey,
        created_at,
        advisor_notes,
        tutor_notes,
        completed_topics,
        total_topics,
    }
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
            "SELECT j.id, j.chapter_title, j.chapter_dir, j.journey_json, j.created_at, j.advisor_notes, j.tutor_notes,
                    COALESCE(d.cnt, 0)
             FROM journeys j
             LEFT JOIN (
                 SELECT parent_id, COUNT(*) AS cnt
                 FROM dialogues
                 WHERE reference_kind = 'journey' AND marked_complete = 1 AND visible = 1
                 GROUP BY parent_id
             ) d ON d.parent_id = j.id
             WHERE j.id = ?1",
        )?;
        let mut rows = stmt.query(rusqlite::params![id])?;
        if let Some(row) = rows.next()? {
            Ok(Some(build_row(
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                serde_json::from_str(&row.get::<_, String>(3)?)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
                row.get::<_, i64>(7)? as usize,
            )))
        } else {
            Ok(None)
        }
    }

    pub fn get_all() -> Result<Vec<JourneyRow>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT j.id, j.chapter_title, j.chapter_dir, j.journey_json, j.created_at, j.advisor_notes, j.tutor_notes,
                    COALESCE(d.cnt, 0)
             FROM journeys j
             LEFT JOIN (
                 SELECT parent_id, COUNT(*) AS cnt
                 FROM dialogues
                 WHERE reference_kind = 'journey' AND marked_complete = 1 AND visible = 1
                 GROUP BY parent_id
             ) d ON d.parent_id = j.id
             ORDER BY j.created_at DESC",
        )?;
        let mut rows = stmt.query([])?;
        let mut out = Vec::new();
        while let Some(row) = rows.next()? {
            out.push(build_row(
                row.get(0)?,
                row.get(1)?,
                row.get(2)?,
                serde_json::from_str(&row.get::<_, String>(3)?)?,
                row.get(4)?,
                row.get(5)?,
                row.get(6)?,
                row.get::<_, i64>(7)? as usize,
            ));
        }
        Ok(out)
    }

    pub fn update(artifacts: &JourneyArtifacts) -> Result<()> {
        let id = artifacts.id.ok_or_else(|| {
            MetisError::InternalError("Artifacts passed without id to update".to_string())
        })?;
        let journey_json = serde_json::to_string(&artifacts.journey)?;
        let conn = get_database().conn.lock().unwrap();
        let rows_affected = conn.execute(
            "UPDATE journeys
         SET chapter_title = ?2,
             chapter_dir   = ?3,
             journey_json  = ?4,
             advisor_notes = ?5,
             tutor_notes   = ?6
         WHERE id = ?1",
            rusqlite::params![
                id,
                artifacts.chapter_title,
                artifacts.chapter_dir,
                journey_json,
                artifacts.advisor_notes,
                artifacts.tutor_notes,
            ],
        )?;
        if rows_affected == 0 {
            return Err(MetisError::NotFound(format!(
                "journey {} — update affected zero rows",
                id
            )));
        }
        Ok(())
    }

    pub fn get_artifacts(journey_id: i64) -> Result<JourneyArtifacts> {
        let row = match Self::get(journey_id)? {
            Some(r) => r,
            None => {
                return Err(MetisError::InternalDataError(format!(
                    "journey not found for journey id: {} ",
                    journey_id
                )))
            }
        };

        let dialogues = DialoguesRepo::get_for_parent(ReferenceKind::Journey, journey_id)?;
        let last = dialogues.last();

        match last {
            Some(dialogue) => {
                let DialogueReference::Journey {
                    arc_idx: last_arc,
                    topic_idx: last_topic,
                    ..
                } = &dialogue.reference
                else {
                    return Err(MetisError::InternalDataError(
                        "journey dialogue has a non-journey reference".to_string(),
                    ));
                };
                let (mut arc_idx, mut topic_idx, mut is_journey_complete) =
                    (*last_arc, *last_topic, false);

                if dialogue.marked_complete {
                    let next_topic = topic_idx + 1;
                    if row
                        .journey
                        .arcs
                        .get(arc_idx)
                        .and_then(|a| a.topics.get(next_topic))
                        .is_some()
                    {
                        topic_idx = next_topic;
                    } else {
                        let next_arc = arc_idx + 1;
                        if row
                            .journey
                            .arcs
                            .get(next_arc)
                            .and_then(|a| a.topics.first())
                            .is_some()
                        {
                            arc_idx = next_arc;
                            topic_idx = 0;
                        } else {
                            is_journey_complete = true;
                        }
                    }
                }

                let progress = JourneyProgress {
                    journey_id,
                    arc_idx,
                    topic_idx,
                    is_journey_complete,
                };

                Ok(JourneyArtifacts {
                    id: Some(row.id),
                    chapter_title: row.chapter_title,
                    chapter_dir: row.chapter_dir,
                    journey: row.journey,
                    advisor_notes: row.advisor_notes,
                    tutor_notes: row.tutor_notes,
                    progress,
                })
            },
            None => {
                let progress = JourneyProgress::new(journey_id);

                Ok(JourneyArtifacts {
                    id: Some(row.id),
                    chapter_title: row.chapter_title,
                    chapter_dir: row.chapter_dir,
                    journey: row.journey,
                    advisor_notes: row.advisor_notes,
                    tutor_notes: row.tutor_notes,
                    progress,
                })
            }
        }
    }

    pub fn delete_single(id: i64) -> Result<()> {
        DialoguesRepo::delete_for_parent(ReferenceKind::Journey, id)?;
        let conn = get_database().conn.lock().unwrap();
        conn.execute("DELETE FROM journeys WHERE id = ?1", rusqlite::params![id])?;
        Ok(())
    }
}
