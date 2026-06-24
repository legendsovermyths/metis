CREATE TABLE IF NOT EXISTS folders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    parent_id  INTEGER,            -- NULL = root; FK folders(id)
    created_at INTEGER NOT NULL
);
