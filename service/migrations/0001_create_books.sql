CREATE TABLE IF NOT EXISTS books (
    id                  INTEGER PRIMARY KEY AUTOINCREMENT,
    title               TEXT    NOT NULL,
    path                TEXT    NOT NULL,
    toc                 TEXT    NOT NULL, -- JSON: [{ "title": "...", "topics": [{ "title": "..." }] }]
    gemini_file_uri     TEXT,             -- URI returned by Gemini File API after upload
    gemini_uploaded_at  INTEGER           -- Unix timestamp (seconds) of when file was uploaded
);
