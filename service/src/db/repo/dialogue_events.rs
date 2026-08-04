use dborm::DbRow;

use crate::{
    db::{persistence::Persistent, object::FromDbRow, repo::Repository},
    error::Result,
    app::events::{Event, EventHistory, EventType},
};

#[derive(Debug, Clone, DbRow)]
#[db(table = "dialogue_events")]
pub struct EventRecord {
    #[db(id)]
    pub id: i64,
    pub parent_id: i64,
    pub dialogue_id: i64,
    pub name: String,
    pub event_type: EventType,
    pub content: String,
    pub timestamp: String,
}

impl FromDbRow for EventRecord {
    type DbRow = Self;
    fn from_row_type(row: Self) -> Result<Self> {
        Ok(row)
    }
    fn into_row_type(&self) -> Self {
        self.clone()
    }
}

impl EventRecord {
    fn into_event(self) -> Event {
        Event {
            name: self.name,
            event_type: self.event_type,
            content: self.content,
            timestamp: self.timestamp,
        }
    }
}

pub struct DialogueEventsRepo;

impl DialogueEventsRepo {
    pub fn insert_events(parent_id: i64, dialogue_id: i64, events: &[Event]) -> Result<()> {
        let records: Vec<EventRecord> = events
            .iter()
            .map(|event| EventRecord {
                id: 0,
                parent_id,
                dialogue_id,
                name: event.name.clone(),
                event_type: event.event_type.clone(),
                content: event.content.clone(),
                timestamp: event.timestamp.clone(),
            })
            .collect();
        Repository::<EventRecord>::insert_many(&records)
    }

    pub fn get_for_dialogue(dialogue_id: i64) -> Result<EventHistory> {
        Self::history(Repository::<EventRecord>::find_all_by("dialogue_id", dialogue_id)?)
    }

    fn history(mut records: Vec<Persistent<EventRecord>>) -> Result<EventHistory> {
        records.sort_by_key(|record| record.read().id);
        let events = records
            .into_iter()
            .map(|record| record.escape().into_event())
            .collect();
        Ok(EventHistory { events })
    }
}
