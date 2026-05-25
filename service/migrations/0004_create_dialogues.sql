CREATE TABLE IF NOT EXISTS dialogues (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    journey_id      INTEGER NOT NULL REFERENCES journeys(id),
    arc_idx         INTEGER NOT NULL,
    topic_idx       INTEGER NOT NULL,
    idx             INTEGER NOT NULL,
    content         TEXT    NOT NULL,
    blackboard_json TEXT    NOT NULL DEFAULT '{"description":"","image_url":null}',
    heading         TEXT    NOT NULL DEFAULT '',
    marked_complete INTEGER NOT NULL DEFAULT 0,
    visible         INTEGER NOT NULL DEFAULT 1,
    segments_json   TEXT,
    elements_json   TEXT,
    UNIQUE(journey_id, arc_idx, topic_idx, idx)
);
