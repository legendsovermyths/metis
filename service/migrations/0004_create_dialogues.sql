CREATE TABLE IF NOT EXISTS dialogues (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    reference_kind  TEXT    NOT NULL,
    parent_id       INTEGER NOT NULL,
    idx             INTEGER NOT NULL,
    is_ready        INTEGER NOT NULL DEFAULT 0,
    visible         INTEGER NOT NULL DEFAULT 1,
    marked_complete INTEGER NOT NULL DEFAULT 0,
    content         TEXT    NOT NULL DEFAULT '',
    blackboard_json TEXT    NOT NULL DEFAULT '{"elements":[],"description":"","image_url":null}',
    heading         TEXT    NOT NULL DEFAULT '',
    segments_json   TEXT,
    reference_json  TEXT    NOT NULL,
    UNIQUE(reference_kind, parent_id, idx)
);
