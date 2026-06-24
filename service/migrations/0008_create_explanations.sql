CREATE TABLE IF NOT EXISTS explanations (
    id               INTEGER PRIMARY KEY AUTOINCREMENT,
    title            TEXT    NOT NULL,
    explanation_dir  TEXT    NOT NULL,
    explanation_json TEXT    NOT NULL,  -- JSON: serialized Explanation struct
    created_at       INTEGER NOT NULL,  -- Unix timestamp (seconds)
    tutor_notes      TEXT    NOT NULL DEFAULT '',
    folder_id        INTEGER             -- NULL = root; FK folders(id)
);
