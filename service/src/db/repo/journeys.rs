use dborm::DbRow;

use crate::{
    app::{
        dialogue::{Dialogue, DialogueReference, ReferenceKind},
        journey::{artifact::JourneyArtifacts, progress::JourneyProgress, Journey},
    },
    db::{repo::dialogue::DialoguesRepo, object::FromDbRow},
    error::{MetisError, Result},
};

#[derive(Debug, Clone, DbRow)]
#[db(table = "journeys")]
pub struct JourneyRecord {
    #[db(id)]
    pub id: i64,
    pub chapter_title: String,
    pub chapter_dir: String,
    #[db(column = "journey_json", json)]
    pub journey: Journey,
    #[db(insert_only)]
    pub created_at: i64,
    pub advisor_notes: String,
    pub tutor_notes: String,
    pub folder_id: Option<i64>,
}

impl FromDbRow for JourneyArtifacts {
    type DbRow = JourneyRecord;

    fn from_row_type(record: JourneyRecord) -> Result<Self> {
        let dialogues = DialoguesRepo::get_for_parent(ReferenceKind::Journey, record.id)?;
        let progress = derive_progress(
            record.id,
            &record.journey,
            dialogues.iter().rfind(|p| p.read().visible).map(|p| p.read()),
        )?;
        let generation_progress = derive_progress(record.id, &record.journey, dialogues.iter().last().map(|d| d.read()))?;
        Ok(JourneyArtifacts {
            id: Some(record.id),
            chapter_title: record.chapter_title,
            chapter_dir: record.chapter_dir,
            journey: record.journey,
            advisor_notes: record.advisor_notes,
            tutor_notes: record.tutor_notes,
            folder_id: record.folder_id,
            created_at: record.created_at,
            progress,
            generation_progress
        })
    }

    fn into_row_type(&self) -> JourneyRecord {
        JourneyRecord {
            id: self.id.unwrap_or(0),
            chapter_title: self.chapter_title.clone(),
            chapter_dir: self.chapter_dir.clone(),
            journey: self.journey.clone(),
            created_at: self.created_at,
            advisor_notes: self.advisor_notes.clone(),
            tutor_notes: self.tutor_notes.clone(),
            folder_id: self.folder_id,
        }
    }

    fn on_delete(id: &i64) -> Result<()> {
        DialoguesRepo::delete_for_parent(ReferenceKind::Journey, *id)?;
        Ok(())
    }
}

fn derive_progress(
    journey_id: i64,
    journey: &Journey,
    last: Option<&Dialogue>,
) -> Result<JourneyProgress> {
    let Some(dialogue) = last else {
        return Ok(JourneyProgress::new(journey_id));
    };
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

    let (mut arc_idx, mut topic_idx, mut is_journey_complete) = (*last_arc, *last_topic, false);
    if dialogue.marked_complete {
        let next_topic = topic_idx + 1;
        if journey
            .arcs
            .get(arc_idx)
            .and_then(|a| a.topics.get(next_topic))
            .is_some()
        {
            topic_idx = next_topic;
        } else {
            let next_arc = arc_idx + 1;
            if journey
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

    Ok(JourneyProgress {
        journey_id,
        arc_idx,
        topic_idx,
        is_journey_complete,
    })
}

