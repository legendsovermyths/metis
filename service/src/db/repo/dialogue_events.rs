use crate::{
    db::get_database,
    error::Result,
    logs::{Event, EventHistory, EventType},
};

pub struct DialogueEventsRepo;

fn event_type_from_str(s: &str) -> EventType {
    match s {
        "llm_message" => EventType::LlmMessage,
        "function_call" => EventType::FunctionCall,
        "function_response" => EventType::FunctionResponse,
        "user_request" => EventType::UserRequest,
        _ => EventType::UserMessage,
    }
}

fn event_from_row(row: &rusqlite::Row<'_>) -> rusqlite::Result<Event> {
    let event_type_str: String = row.get(1)?;
    Ok(Event {
        name: row.get(0)?,
        event_type: event_type_from_str(&event_type_str),
        content: row.get(2)?,
        timestamp: row.get(3)?,
    })
}

impl DialogueEventsRepo {
    pub fn insert_events(
        journey_id: Option<i64>,
        dialogue_id: Option<i64>,
        events: &[Event],
    ) -> Result<()> {
        if events.is_empty() {
            return Ok(());
        }
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "INSERT INTO dialogue_events (journey_id, dialogue_id, name, event_type, content, timestamp)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6)",
        )?;
        for event in events {
            stmt.execute(rusqlite::params![
                journey_id,
                dialogue_id,
                event.name,
                event.event_type.to_string(),
                event.content,
                event.timestamp,
            ])?;
        }
        Ok(())
    }

    pub fn get_for_dialogue(dialogue_id: i64) -> Result<EventHistory> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT name, event_type, content, timestamp
             FROM dialogue_events
             WHERE dialogue_id = ?1
             ORDER BY id",
        )?;
        let mut rows = stmt.query(rusqlite::params![dialogue_id])?;
        let mut history = EventHistory::new();
        while let Some(row) = rows.next()? {
            history.add_event(event_from_row(&row)?);
        }
        Ok(history)
    }

    pub fn get_for_journey(journey_id: i64) -> Result<EventHistory> {
        let conn = get_database().conn.lock().unwrap();
        let mut stmt = conn.prepare(
            "SELECT name, event_type, content, timestamp
             FROM dialogue_events
             WHERE journey_id = ?1
             ORDER BY id",
        )?;
        let mut rows = stmt.query(rusqlite::params![journey_id])?;
        let mut history = EventHistory::new();
        while let Some(row) = rows.next()? {
            history.add_event(event_from_row(&row)?);
        }
        Ok(history)
    }
}
