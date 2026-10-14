use dborm::DbRow;

use crate::{
    app::{
        dialogue::{Dialogue, ArtifactReference, ReferenceKind},
        explanation::{artifact::ExplanationArtifacts, progress::ExplanationProgress, Explanation},
    },
    db::{object::FromDbRow, repo::dialogue::DialoguesRepo},
    error::{MetisError, Result},
};

#[derive(Debug, Clone, DbRow)]
#[db(table = "explanations")]
pub struct ExplanationRecord {
    #[db(id)]
    pub id: i64,
    pub title: String,
    pub explanation_dir: String,
    #[db(column = "explanation_json", json)]
    pub explanation: Explanation,
    #[db(insert_only)]
    pub created_at: i64,
    pub tutor_notes: String,
    pub folder_id: Option<i64>,
}

impl FromDbRow for ExplanationArtifacts {
    type DbRow = ExplanationRecord;

    fn from_row_type(record: ExplanationRecord) -> Result<Self> {
        let dialogues = DialoguesRepo::get_for_parent(ReferenceKind::Explanation, record.id)?;
        let progress = derive_progress(
            record.id,
            &record.explanation,
            dialogues
                .iter()
                .rfind(|p| p.read().visible)
                .map(|p| p.read()),
        )?;
        let generation_progress = derive_progress(
            record.id,
            &record.explanation,
            dialogues.iter().last().map(|d| d.read()),
        )?;
        Ok(ExplanationArtifacts {
            id: Some(record.id),
            title: record.title,
            explanation_directory: record.explanation_dir,
            explanation: record.explanation,
            folder_id: record.folder_id,
            created_at: record.created_at,
            generation_progress,
            progress,
            tutor_notes: record.tutor_notes,
        })
    }

    fn into_row_type(&self) -> ExplanationRecord {
        ExplanationRecord {
            id: self.id.unwrap_or(0),
            title: self.title.clone(),
            explanation_dir: self.explanation_directory.clone(),
            explanation: self.explanation.clone(),
            created_at: self.created_at,
            tutor_notes: self.tutor_notes.clone(),
            folder_id: self.folder_id,
        }
    }

    fn on_delete(id: &i64) -> Result<()> {
        DialoguesRepo::delete_for_parent(ReferenceKind::Explanation, *id)?;
        Ok(())
    }
}

fn derive_progress(
    explanation_id: i64,
    explanation: &Explanation,
    last: Option<&Dialogue>,
) -> Result<ExplanationProgress> {
    let Some(dialogue) = last else {
        return Ok(ExplanationProgress::new(explanation_id));
    };
    let ArtifactReference::Explanation {
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
        if explanation.steps.get(next_step).is_some() {
            step_idx = next_step;
        } else {
            is_complete = true;
        }
    }

    Ok(ExplanationProgress {
        explanation_id,
        step_idx,
        is_complete,
    })
}
