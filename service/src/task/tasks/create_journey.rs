use std::fs;

use serde::{Deserialize, Serialize};

use crate::{
    app::journey::{artifact::JourneyArtifacts, progress::JourneyProgress, Journey},
    db::repo::{books::BooksRepo, journeys::JourneysRepo},
    error::MetisError,
    task::{
        context::TaskContext,
        gaurd::TaskGaurd,
        manager::TaskFuture,
        progress::{TaskProgress, TaskStatus},
    },
    utils::{
        format::sanitize_name,
        journey::{
            convert_to_markdown, create_topic_map, detect_page_range, extract_topics_from_content,
            generate_journey,
        },
        pdf::extract_page_range,
    },
};

#[derive(Deserialize)]
pub struct CreateJourneyParams {
    chapter_title: String,
    advisor_notes: String,
    book_id: i64,
}

impl TaskGaurd for CreateJourneyParams {}

#[derive(Deserialize, Serialize)]
pub struct CreateJourneyCheckpoint {
    page_range: Option<PageRange>,
    extracted_chapter_pdf: bool,
    content_md: Option<String>,
    topics: Option<Vec<String>>,
    journey: Option<Journey>,
    generated_topic_map: bool,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct PageRange{
    pub chapter_start: u32,
    pub chapter_end: u32
}

pub fn create_journey(context: TaskContext) -> TaskFuture {
    Box::pin(async move {
        let params: CreateJourneyParams = serde_json::from_value(context.params)?;
        let mut checkpoint: CreateJourneyCheckpoint = serde_json::from_value(context.checkpoint)?;

        let book = BooksRepo::get(params.book_id)?
            .ok_or(MetisError::ParamsError("Wrong book id passed".into()))?;

        let sanitized_book_name = sanitize_name(&book.title);
        let sanitized_chapter_title = sanitize_name(&params.chapter_title);

        let chapter_dir = format!(
            "../books/{}/chapters/{}",
            sanitized_book_name, sanitized_chapter_title
        );

        fs::create_dir_all(&chapter_dir).map_err(|e| MetisError::UtilsError(e.to_string()))?;

        let chapter_pdf = format!("{}/chapter.pdf", chapter_dir);
        if checkpoint.page_range.is_none() {
            let page_range = detect_page_range(&book.path, &params.chapter_title).await?;
            checkpoint.page_range = Some(page_range);
            let _ = context
                .progress_tx
                .send(TaskProgress {
                    status: TaskStatus::Running,
                    task_id: context.id.clone(),
                    message: "Detected page range".into(),
                    checkpoint: serde_json::to_value(&checkpoint)?,
                })
                .await;
        }

        let page_range = checkpoint.page_range.clone().unwrap();
        let pages = (page_range.chapter_end - page_range.chapter_start + 1) as usize;

        if !checkpoint.extracted_chapter_pdf {
            let _ = extract_page_range(
                &book.path,
                page_range.chapter_start,
                page_range.chapter_end,
                &chapter_pdf,
            )?;
            checkpoint.extracted_chapter_pdf = true;
            let _ = context
                .progress_tx
                .send(TaskProgress {
                    task_id: context.id.clone(),
                    checkpoint: serde_json::to_value(&checkpoint)?,
                    status: TaskStatus::Running,
                    message: "Extracted chapter PDF".into(),
                })
                .await;
        }
        if checkpoint.content_md.is_none() {
            let content_md = convert_to_markdown(&chapter_pdf, pages).await?;
            let content_md_path = format!("{}/content.md", chapter_dir);
            fs::write(&content_md_path, &content_md)
                .map_err(|e| MetisError::UtilsError(e.to_string()))?;
            checkpoint.content_md = Some(content_md);
            let _ = context.progress_tx.send(TaskProgress {
                task_id: context.id.clone(),
                checkpoint: serde_json::to_value(&checkpoint)?,
                status: TaskStatus::Running,
                message: "Converted to markdown".into(),
            });
        }

        let content_md = checkpoint.content_md.clone().unwrap();

        if checkpoint.topics.is_none() {
            let topics = extract_topics_from_content(&content_md).await?;
            checkpoint.topics = Some(topics);
            let _ = context.progress_tx.send(TaskProgress {
                task_id: context.id.clone(),
                checkpoint: serde_json::to_value(&checkpoint)?,
                status: TaskStatus::Running,
                message: "Extracted topics from chapter".into(),
            });
        }

        let topics = checkpoint.topics.clone().unwrap();

        if checkpoint.journey.is_none() {
            let journey = generate_journey(topics).await?;
            checkpoint.journey = Some(journey);
            let _ = context.progress_tx.send(TaskProgress {
                task_id: context.id.clone(),
                checkpoint: serde_json::to_value(&checkpoint)?,
                status: TaskStatus::Running,
                message: "Created Journey".into(),
            });
        }

        let journey = checkpoint.journey.clone().unwrap();

        if !checkpoint.generated_topic_map {
            let _ = create_topic_map(&chapter_dir, &journey).await?;
            checkpoint.generated_topic_map = true;
            let _ = context.progress_tx.send(TaskProgress {
                task_id: context.id.clone(),
                checkpoint: serde_json::to_value(&checkpoint)?,
                status: TaskStatus::Running,
                message: "Created Topic Map".into(),
            });
        }
        let id = JourneysRepo::insert(
            &params.chapter_title,
            &chapter_dir,
            &journey,
            &params.advisor_notes,
        )?;

        Ok(serde_json::to_value(JourneyArtifacts {
            id: Some(id),
            chapter_title: params.chapter_title,
            chapter_dir,
            journey,
            advisor_notes: params.advisor_notes,
            progress: JourneyProgress::new(id),
        })?)
    })
}

impl Default for CreateJourneyCheckpoint {
    fn default() -> Self {
        CreateJourneyCheckpoint {
            page_range: None,
            extracted_chapter_pdf: false,
            content_md: None,
            topics: None,
            journey: None,
            generated_topic_map: false,
        }
    }
}
