CREATE TABLE IF NOT EXISTS notes (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    title       TEXT    NOT NULL,
    content     TEXT    NOT NULL,        -- TipTap document JSON
    anchor      TEXT,                    -- provenance Anchor enum as JSON; NULL = free-floating
    folder_id   INTEGER,                 -- NULL = loose; FK folders(id) where scope = 'note'
    created_at  INTEGER NOT NULL,
    updated_at  INTEGER NOT NULL
);

CREATE TABLE IF NOT EXISTS note_refs (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    source_note_id  INTEGER NOT NULL,    -- FK notes(id)
    target_kind     TEXT    NOT NULL,    -- journey | dialogue | explanation | note
    target_id       INTEGER NOT NULL,
    target_block_id TEXT,                -- block id within target note, when target_kind = note
    created_at      INTEGER NOT NULL
);
