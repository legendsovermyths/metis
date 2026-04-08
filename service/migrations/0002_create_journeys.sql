CREATE TABLE IF NOT EXISTS journeys (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    chapter_title   TEXT    NOT NULL,
    chapter_dir     TEXT    NOT NULL,
    journey_json    TEXT    NOT NULL,  -- JSON: serialized Journey struct
    created_at      INTEGER NOT NULL,  -- Unix timestamp (seconds)
    advisor_notes   TEXT    NOT NULL,
    progress_json   TEXT               -- JSON: serialized JourneyProgress (NULL = no progress)
);
