CREATE TABLE IF NOT EXISTS folders (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    name       TEXT    NOT NULL,
    parent_id  INTEGER,            -- NULL = root; FK folders(id)
    scope      TEXT    NOT NULL DEFAULT 'study',  -- study | note; folder sets are disjoint per surface
    created_at INTEGER NOT NULL
);
