CREATE TABLE IF NOT EXISTS background_tasks (
    id          TEXT PRIMARY KEY, 
    name        TEXT NOT NULL,
    status      TEXT NOT NULL,
    params      TEXT,        
    checkpoint  TEXT,       
    error       TEXT,
    identity    TEXT,
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
);
