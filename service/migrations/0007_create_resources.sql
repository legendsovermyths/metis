CREATE TABLE IF NOT EXISTS resources (
    id           INTEGER PRIMARY KEY AUTOINCREMENT,
    path         TEXT    NOT NULL,   -- content lives on disk at this path
    agent_notes  TEXT    NOT NULL,
    created_at   INTEGER NOT NULL   -- Unix timestamp (seconds)
);
