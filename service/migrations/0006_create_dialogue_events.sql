CREATE TABLE IF NOT EXISTS dialogue_events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    journey_id   INTEGER REFERENCES journeys(id),
    dialogue_id  INTEGER REFERENCES dialogues(id),
    name         TEXT    NOT NULL,
    event_type   TEXT    NOT NULL,
    content      TEXT    NOT NULL,
    timestamp    TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dialogue_events_dialogue
    ON dialogue_events (dialogue_id)
    WHERE dialogue_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_dialogue_events_journey
    ON dialogue_events (journey_id)
    WHERE journey_id IS NOT NULL;
