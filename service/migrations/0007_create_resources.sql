CREATE TABLE IF NOT EXISTS resources (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    title          TEXT    NOT NULL,
    path           TEXT    NOT NULL,   -- PDF lives on disk at this path
    description    TEXT    NOT NULL,
    agent_notes    TEXT    NOT NULL,
    resource_type  TEXT    NOT NULL,   -- JSON: ResourceType (TextBook/Document/Question/Solution)
    created_at     INTEGER NOT NULL    -- Unix timestamp (seconds)
);
