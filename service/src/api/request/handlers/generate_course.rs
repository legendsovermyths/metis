use std::fs;

use serde::{Deserialize, Serialize};

use crate::{
    api::request::handler::BoxFuture,
    app::{
        journey::{artifact::JourneyArtifacts, progress::JourneyProgress, Journey},
        AppContext,
    },
    db::repo::journeys::JourneysRepo,
    error::{MetisError, Result},
    llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient},
    prompts::get_prompt_provider,
    utils::{
        format::{sanitize_name, strip_json_block},
        journey::{
            convert_to_markdown, create_topic_map, detect_page_range, extract_topics_from_content, find_book_for_chapter, generate_journey, map_topics
        },
        pdf::extract_page_range,
    },
};

#[derive(Deserialize, Serialize, Clone)]
pub struct PageRange {
    pub chapter_start: u32,
    pub chapter_end: u32,
}

// --- Public entry point ---

pub async fn generate_journey_artifacts(
    chapter_title: &str,
    context: &AppContext,
) -> Result<JourneyArtifacts> {
    let selected_book_id = context.session.lock().await.book_id;

    // Step 1: extract chapter PDF → convert to content.md
    log::info!("[generate_course] generating artifacts (PDF → markdown)");
    let (chapter_dir, content_md) = generate_artifacts(chapter_title, selected_book_id).await?;
    log::info!(
        "[generate_course] artifacts done — chapter_dir: {}",
        chapter_dir
    );

    // Step 2: extract teachable topic list from content.md via LLM
    log::info!("[generate_course] extracting topic list from content.md");
    let topics = extract_topics_from_content(&content_md).await?;
    log::info!("[generate_course] extracted {} topics", topics.len());

    // Step 3: build arc structure from extracted topics
    log::info!("[generate_course] generating journey arc structure");
    let journey = generate_journey(topics).await?;
    log::info!(
        "[generate_course] journey done — {} arcs",
        journey.arcs.len()
    );

    log::info!("[generate_course] building topic map");
    let _ = create_topic_map(&chapter_dir, &journey).await;
    log::info!("[generate_course] topic map done");

    let advisor_notes = context
        .chat
        .lock()
        .await
        .notes
        .clone()
        .ok_or(MetisError::AgentError(
            "Journey created without advisor notes".to_string(),
        ))?;

    log::info!("[generate_course] inserting journey into DB");
    let id = JourneysRepo::insert(chapter_title, &chapter_dir, &journey, &advisor_notes)?;
    log::info!("[generate_course] inserted — id: {}", id);

    Ok(JourneyArtifacts {
        id: Some(id),
        chapter_title: chapter_title.to_string(),
        chapter_dir,
        journey,
        advisor_notes,
        progress: JourneyProgress::new(id),
    })
}

#[derive(Deserialize, Default)]
#[serde(default)]
pub struct GenerateCourseParams {
    pub chapter_title: Option<String>,
}

pub fn generate_course_handler(params: GenerateCourseParams, context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let chapter_title = params.chapter_title.unwrap_or(String::new());
        let chapter_title = chapter_title.trim().to_string();
        if chapter_title.is_empty() {
            return Err(MetisError::AgentError(
                "Choose a chapter with the advisor before creating a journey.".into(),
            ));
        }
        log::info!(
            "[generate_course] starting for chapter: \"{}\"",
            chapter_title
        );
        let artifacts = generate_journey_artifacts(&chapter_title, context).await?;
        log::info!("[generate_course] done — journey id: {:?}", artifacts.id);
        Ok(serde_json::to_value(artifacts)?)
    })
}


/// Returns `(chapter_dir, content_md)`.
pub async fn generate_artifacts(
    chapter_title: &str,
    preferred_book_id: Option<i64>,
) -> Result<(String, String)> {
    log::info!(
        "[generate_artifacts] looking up book for \"{}\"",
        chapter_title
    );
    let (book_path, book_title) = find_book_for_chapter(chapter_title, preferred_book_id)?;
    log::info!(
        "[generate_artifacts] found book \"{}\" at {}",
        book_title,
        book_path
    );

    let sanitized_book = sanitize_name(&book_title);
    let sanitized_chapter = sanitize_name(chapter_title);
    let chapter_dir = format!("../books/{}/chapters/{}", sanitized_book, sanitized_chapter);
    log::info!("[generate_artifacts] chapter_dir: {}", chapter_dir);
    fs::create_dir_all(&chapter_dir).map_err(|e| MetisError::UtilsError(e.to_string()))?;

    let chapter_pdf = format!("{}/chapter.pdf", chapter_dir);

    log::info!("[generate_artifacts] detecting page range for chapter");
    let page_range = detect_page_range(&book_path, chapter_title).await?;
    log::info!(
        "[generate_artifacts] page range: {}-{}",
        page_range.chapter_start,
        page_range.chapter_end
    );

    log::info!(
        "[generate_artifacts] extracting chapter PDF to {}",
        chapter_pdf
    );
    extract_page_range(
        &book_path,
        page_range.chapter_start,
        page_range.chapter_end,
        &chapter_pdf,
    )?;
    log::info!("[generate_artifacts] chapter PDF extracted");

    let pages = (page_range.chapter_end - page_range.chapter_start + 1) as usize;

    log::info!(
        "[generate_artifacts] converting chapter to markdown ({} pages)",
        pages
    );
    let content_md = convert_to_markdown(&chapter_pdf, pages).await?;
    log::info!(
        "[generate_artifacts] markdown done ({} chars)",
        content_md.len()
    );

    let content_md_path = format!("{}/content.md", chapter_dir);
    fs::write(&content_md_path, &content_md).map_err(|e| MetisError::UtilsError(e.to_string()))?;
    log::info!("[generate_artifacts] wrote content.md");

    Ok((chapter_dir, content_md))
}

