use std::path::Path;

use serde::{Deserialize, Serialize};
use crate::app::resource::document::Document;

use crate::agent::AgentResponseInstruction;
use crate::app::resource::book::Book;
use crate::error::{MetisError, Result};
use crate::utils::journey::{convert_to_markdown, detect_page_range};
use crate::utils::pdf::{extract_page_range, get_page_count};

#[derive(Clone, Deserialize, Serialize, Debug)]
pub enum ResourceType {
    TextBook(Book),
    Document(Document),
    Question,
    Solution,
}

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Resource {
    pub title: String,
    pub id: Option<i64>,
    pub path: String,
    pub agent_notes: String,
    pub created_at: i64,
    pub resource_type: ResourceType,
    pub description: String,
}

impl Resource {
    pub fn get_path() -> String {
        crate::utils::paths::resources_dir()
            .to_string_lossy()
            .into_owned()
    }

    pub async fn get_content(
        &self,
        request: &AgentResponseInstruction,
        artifact_dir: Option<&Path>,
    ) -> Result<String> {
        match &self.resource_type {
            ResourceType::TextBook(_book) => {
                let chapter_title;
                if let AgentResponseInstruction::ChapterTitle(title) = request {
                    chapter_title = title;
                } else {
                    return Err(MetisError::AgentError(
                        "Agent didn't send any chapter name for book".to_string(),
                    ));
                }
                let (chapter_pdf, persist) = match artifact_dir {
                    Some(dir) => (dir.join("chapter.pdf").to_string_lossy().into_owned(), true),
                    None => (
                        crate::utils::paths::tmp_dir()
                            .join(format!("{}.pdf", uuid::Uuid::new_v4()))
                            .to_string_lossy()
                            .into_owned(),
                        false,
                    ),
                };

                let page_range = detect_page_range(&self.path, chapter_title).await?;

                let pages = (page_range.chapter_end - page_range.chapter_start + 1) as usize;

                extract_page_range(
                    &self.path,
                    page_range.chapter_start,
                    page_range.chapter_end,
                    &chapter_pdf,
                )?;

                let content_md = convert_to_markdown(&chapter_pdf, pages).await?;
                if !persist {
                    let _ = std::fs::remove_file(&chapter_pdf);
                }
                Ok(content_md)
            }
            _ => {
                let num_pages = get_page_count(&self.path)?;
                let content_md = convert_to_markdown(&self.path, num_pages as usize).await?;
                Ok(content_md)
            }
        }
    }
}
