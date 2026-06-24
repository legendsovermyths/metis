use std::time::{SystemTime, UNIX_EPOCH};

use serde::Serialize;

use crate::{
    app::{
        dialogue::{DialogueReference, ReferenceKind},
        explanation::{Explanation, ExplanationArtifacts, ExplanationProgress},
    },
    db::{get_database, repo::dialogue::DialoguesRepo},
    error::{MetisError, Result},
};

#[derive(Debug, Clone, Serialize)]
pub struct ExplanationRow {
    pub id: i64,
    pub title: String,
    pub explanation_dir: String,
    pub explanation: Explanation,
    pub created_at: i64,
    pub tutor_notes: String,
    pub folder_id: Option<i64>,
    pub completed_steps: usize,
    pub total_steps: usize,
}

pub struct ExplanationsRepo;

fn build_row(
    id: i64,
    title: String,
    explanation_dir: String,
    explanation: Explanation,
    created_at: i64,
    tutor_notes: String,
    folder_id: Option<i64>,
    completed_steps: usize,
) -> ExplanationRow {
    let total_steps = explanation.get_step_count();
    ExplanationRow {
        id,
        title,
        explanation_dir,
        explanation,
        created_at,
        tutor_notes,
        folder_id,
        completed_steps,
        total_steps,
    }
}

impl ExplanationsRepo {
    pub fn insert(title: &str, explanation_dir: &str, explanation: &Explanation) -> Result<i64> {
        let explanation_json = serde_json::to_string(explanation)?;
        let created_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "INSERT INTO explanations (title, explanation_dir, explanation_json, created_at) VALUES (?1, ?2, ?3, ?4)",
            rusqlite::params![title, explanation_dir, explanation_json, created_at],
        )?;
        Ok(conn.last_insert_rowid())
    }

    pub fn get(id: i64) -> Result<Option<ExplanationRow>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT e.id, e.title, e.explanation_dir, e.explanation_json, e.created_at, e.tutor_notes, e.folder_id,
                    COALESCE(d.cnt, 0)
             FROM explanations e
             LEFT JOIN (
                 SELECT parent_id, COUNT(*) AS cnt
                 FROM dialogues
                 WHERE reference_kind = 'explanation' AND marked_complete = 1 AND visible = 1
                 GROUP BY parent_id
             ) d ON d.parent_id = e.id
             WHERE e.id = ?1",
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

    pub fn get_latest() -> Result<Option<ExplanationRow>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT e.id, e.title, e.explanation_dir, e.explanation_json, e.created_at, e.tutor_notes, e.folder_id,
                    COALESCE(d.cnt, 0)
             FROM explanations e
             LEFT JOIN (
                 SELECT parent_id, COUNT(*) AS cnt
                 FROM dialogues
                 WHERE reference_kind = 'explanation' AND marked_complete = 1 AND visible = 1
                 GROUP BY parent_id
             ) d ON d.parent_id = e.id
             ORDER BY e.created_at DESC LIMIT 1",
        )?;
        let mut rows = stmt.query([])?;
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

    pub fn get_all() -> Result<Vec<ExplanationRow>> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT e.id, e.title, e.explanation_dir, e.explanation_json, e.created_at, e.tutor_notes, e.folder_id,
                    COALESCE(d.cnt, 0)
             FROM explanations e
             LEFT JOIN (
                 SELECT parent_id, COUNT(*) AS cnt
                 FROM dialogues
                 WHERE reference_kind = 'explanation' AND marked_complete = 1 AND visible = 1
                 GROUP BY parent_id
             ) d ON d.parent_id = e.id
             ORDER BY e.created_at DESC",
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

    pub fn update(artifacts: &ExplanationArtifacts) -> Result<()> {
        let id = artifacts.id.ok_or_else(|| {
            MetisError::InternalError("Artifacts passed without id to update".to_string())
        })?;
        let explanation_json = serde_json::to_string(&artifacts.explanation)?;
        let conn = get_database().conn.lock().unwrap();
        let rows_affected = conn.execute(
            "UPDATE explanations
             SET title = ?2,
                 explanation_dir = ?3,
                 explanation_json = ?4,
                 tutor_notes = ?5
             WHERE id = ?1",
            rusqlite::params![
                id,
                artifacts.title,
                artifacts.explanation_directory,
                explanation_json,
                artifacts.tutor_notes,
            ],
        )?;
        if rows_affected == 0 {
            return Err(MetisError::NotFound(format!(
                "explanation {} — update affected zero rows",
                id
            )));
        }
        Ok(())
    }

    pub fn get_artifacts(explanation_id: i64) -> Result<ExplanationArtifacts> {
        let row = match Self::get(explanation_id)? {
            Some(r) => r,
            None => {
                return Err(MetisError::InternalDataError(format!(
                    "explanation not found for explanation id: {} ",
                    explanation_id
                )))
            }
        };

        let dialogues = DialoguesRepo::get_for_parent(ReferenceKind::Explanation, explanation_id)?;
        let last = dialogues.last();

        match last {
            Some(dialogue) => {
                let DialogueReference::Explanation {
                    step_idx: last_step,
                    ..
                } = &dialogue.reference
                else {
                    return Err(MetisError::InternalDataError(
                        "explanation dialogue has a non-explanation reference".to_string(),
                    ));
                };
                let (mut step_idx, mut is_complete) = (*last_step, false);

                if dialogue.marked_complete {
                    let next_step = step_idx + 1;
                    if row.explanation.steps.get(next_step).is_some() {
                        step_idx = next_step;
                    } else {
                        is_complete = true;
                    }
                }

                let progress = ExplanationProgress {
                    explanation_id,
                    step_idx,
                    is_complete,
                };

                Ok(ExplanationArtifacts {
                    id: Some(row.id),
                    title: row.title,
                    explanation_directory: row.explanation_dir,
                    explanation: row.explanation,
                    progress,
                    tutor_notes: row.tutor_notes,
                })
            }
            None => {
                let progress = ExplanationProgress::new(explanation_id);

                Ok(ExplanationArtifacts {
                    id: Some(row.id),
                    title: row.title,
                    explanation_directory: row.explanation_dir,
                    explanation: row.explanation,
                    progress,
                    tutor_notes: row.tutor_notes,
                })
            }
        }
    }

    pub fn set_folder(id: i64, folder_id: Option<i64>) -> Result<()> {
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "UPDATE explanations SET folder_id = ?2 WHERE id = ?1",
            rusqlite::params![id, folder_id],
        )?;
        Ok(())
    }

    pub fn delete_single(id: i64) -> Result<()> {
        DialoguesRepo::delete_for_parent(ReferenceKind::Explanation, id)?;
        let conn = get_database().conn.lock().unwrap();
        conn.execute(
            "DELETE FROM explanations WHERE id = ?1",
            rusqlite::params![id],
        )?;
        Ok(())
    }
}
