CREATE TABLE IF NOT EXISTS dialogue_events (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_id    INTEGER NOT NULL,
    dialogue_id  INTEGER NOT NULL REFERENCES dialogues(id),
    name         TEXT    NOT NULL,
    event_type   TEXT    NOT NULL,
    content      TEXT    NOT NULL,
    timestamp    TEXT    NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_dialogue_events_dialogue
    ON dialogue_events (dialogue_id);

CREATE INDEX IF NOT EXISTS idx_dialogue_events_parent
    ON dialogue_events (parent_id);
