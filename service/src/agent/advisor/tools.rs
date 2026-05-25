use std::sync::{Arc, Mutex};

use async_trait::async_trait;
use serde_json::{json, Value};

use crate::{
    app::{book::Book, state::MetisPhase, AppContext},
    db::repo::{appdata::AppDataRepo, books::BooksRepo},
    error::Result,
    llm_client::tool::{Parameter, Tool},
};

pub struct GetStudentProfileTool;

#[async_trait]
impl Tool for GetStudentProfileTool {
    async fn execute(&self, _value: Value, _context: &AppContext) -> Result<Value> {
        let profile = AppDataRepo::get("user_profile")?;
        if profile.is_none() {
            return Ok(json!({ "profile": "No student profile available yet." }));
        }
        Ok(json!({ "profile": profile.unwrap() }))
    }

    fn name(&self) -> &str {
        "get_student_profile"
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![]
    }

    fn description(&self) -> &str {
        "Read the student's personal profile written by the onboarder. Call this before your first message to learn who the student is."
    }
}

pub struct GetAvailableBooksTool;

#[async_trait]
impl Tool for GetAvailableBooksTool {
    async fn execute(&self, _value: Value, _context: &AppContext) -> Result<Value> {
        let books: Vec<Value> = BooksRepo::list()?
            .iter()
            .map(|b| json!({ "id": b.id, "title": b.title }))
            .collect();

        if books.is_empty() {
            return Ok(json!({ "message": "No books have been uploaded yet." }));
        }

        Ok(json!({ "books": books }))
    }

    fn name(&self) -> &str {
        "get_available_books"
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![]
    }

    fn description(&self) -> &str {
        "List all uploaded textbooks with their IDs and titles."
    }
}

pub struct GetBookInfoTool;

#[async_trait]
impl Tool for GetBookInfoTool {
    async fn execute(&self, value: Value, _context: &AppContext) -> Result<Value> {
        let id = value.get("id").and_then(|v| v.as_i64()).ok_or_else(|| {
            crate::error::MetisError::ToolError("missing required parameter: id".into())
        })?;

        match BooksRepo::get(id)? {
            Some(row) => {
                let book = Book::new(row.id, row.title, row.toc);
                Ok(serde_json::to_value(book).unwrap())
            }
            None => Ok(json!({ "error": format!("No book found with id {}", id) })),
        }
    }

    fn name(&self) -> &str {
        "get_book_info"
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![Parameter {
            name: "id".to_string(),
            parameter_type: "integer".to_string(),
            description: "The ID of the book to fetch info for".to_string(),
        }]
    }

    fn description(&self) -> &str {
        "Fetch a specific book's title and full table of contents by its ID."
    }
}

pub struct SetChapterTool;

#[async_trait]
impl Tool for SetChapterTool {
    async fn execute(&self, value: Value, context: &AppContext) -> Result<Value> {
        let chapter_name = value
            .get("chapter_name")
            .and_then(|v| v.as_str())
            .ok_or_else(|| {
                crate::error::MetisError::ToolError(
                    "missing required parameter: chapter_name".into(),
                )
            })?;
        context.session.lock().await.chapter_title = chapter_name.to_string();

        Ok(json!({
            "status": "ok",
            "message": "Chapter has been selected for the course.",
        }))
    }

    fn name(&self) -> &str {
        "set_chapter"
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![Parameter {
            name: "chapter_name".to_string(),
            parameter_type: "string".to_string(),
            description: "The chapter name the student selected".to_string(),
        }]
    }

    fn description(&self) -> &str {
        "Set the selected chapter for the course."
    }
}

pub struct SetNotesTool;

#[async_trait]
impl Tool for SetNotesTool {
    async fn execute(&self, value: Value, context: &AppContext) -> Result<Value> {
        let notes = value.get("notes").and_then(|v| v.as_str()).ok_or_else(|| {
            crate::error::MetisError::ToolError("missing required parameter: notes".into())
        })?;
        context.chat.lock().await.notes = Some(notes.to_string());

        Ok(json!({ "status": "ok" }))
    }

    fn name(&self) -> &str {
        "set_notes"
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![Parameter {
            name: "notes".to_string(),
            parameter_type: "string".to_string(),
            description: "The full updated notes about the student's knowledge. Must be the complete rewritten notes, not a diff or append.".to_string(),
        }]
    }

    fn description(&self) -> &str {
        "Overwrite your notes with the full updated version. Call after each turn where you learn something."
    }
}

pub struct GetNotesTool;

#[async_trait]
impl Tool for GetNotesTool {
    async fn execute(&self, _value: Value, context: &AppContext) -> Result<Value> {
        let notes = context.chat.lock().await.notes.clone();
        if notes.is_none() {
            return Ok(json!({ "notes": "No notes yet." }));
        }
        Ok(json!({ "notes": notes }))
    }

    fn name(&self) -> &str {
        "get_notes"
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![]
    }

    fn description(&self) -> &str {
        "Retrieve your current notes to remind yourself what you've learned so far."
    }
}

pub struct SetBookTool;

#[async_trait]
impl Tool for SetBookTool {
    async fn execute(&self, value: Value, context: &AppContext) -> Result<Value> {
        let id = value
            .get("book_id")
            .and_then(|v| v.as_i64())
            .ok_or_else(|| {
                crate::error::MetisError::ToolError("missing required parameter: book_id".into())
            })?;

        match BooksRepo::get(id)? {
            Some(row) => {
                context.session.lock().await.book_id = Some(id);
                Ok(json!({
                    "status": "ok",
                    "message": format!("Book \"{}\" selected.", row.title),
                }))
            }
            None => {
                Ok(json!({ "status": "error", "message": format!("No book found with id {}", id) }))
            }
        }
    }

    fn name(&self) -> &str {
        "set_book"
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![Parameter {
            name: "book_id".to_string(),
            parameter_type: "integer".to_string(),
            description: "The ID of the book the student is studying from.".to_string(),
        }]
    }

    fn description(&self) -> &str {
        "Set the specific book to use for course generation. Call this whenever a chapter is selected so the correct book is used, especially when multiple books share the same chapter title."
    }
}

pub struct SetDoneTool;

#[async_trait]
impl Tool for SetDoneTool {
    async fn execute(&self, _value: Value, context: &AppContext) -> Result<Value> {
        let mut chat = context.chat.lock().await;
        let session = context.session.lock().await;
        if chat.notes.is_none() {
            return Ok(
                json!({ "status": "error", "message": "Cannot finish without notes. Call set_notes first." }),
            );
        }
        if session.chapter_title.is_empty() {
            return Ok(
                json!({ "status": "error", "message": "Cannot finish without a chapter selected. Call set_chapter first." }),
            );
        }
        if session.book_id.is_none() {
            return Ok(
                json!({ "status": "error", "message": "Cannot finish without a book selected. Call set_book first." }),
            );
        }
        chat.set_done();
        Ok(json!({ "status": "done", "message": "Advising complete. Ready for the professor." }))
    }

    fn name(&self) -> &str {
        "set_done"
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![]
    }

    fn description(&self) -> &str {
        "Signal that advising is complete. Only call when notes are saved and a chapter is selected."
    }
}
