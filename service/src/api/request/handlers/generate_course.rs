use std::{fmt::format, fs, sync::Arc};

use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use tokio::{join, try_join};

use crate::{
    app::journey::Journey,
    db::repo::{books::BooksRepo, journeys::JourneysRepo},
    error::{MetisError, Result},
    llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient},
    prompts::get_prompt_provider,
    api::request::handler::runtime,
    utils::{
        format::{sanitize_name, strip_json_block},
        journey::{
            convert_to_markdown, detect_page_range, find_book_for_chapter, find_chapter_topics,
            map_topics,
        },
        pdf::extract_page_range,
    },
};

#[derive(Deserialize)]
pub struct PageRange {
    chapter_start: u32,
    chapter_end: u32,
}

// --- Public entry point ---

#[derive(Deserialize, Serialize)]
pub struct JourneyArtifacts {
    pub id: Option<i64>,
    pub chapter_dir: String,
    pub journey: Journey,
    pub advisor_notes: String,
}

pub fn generate_journey_artifacts(chapter_title: &str, advisor_notes: &str) -> Result<Value> {
    runtime().block_on(async {
        let res = try_join!(
            generate_journey(chapter_title),
            generate_artifacts(chapter_title)
        );
        let (journey, chapter_dir) = res?;
        let _ = create_topic_map(&chapter_dir, &journey).await;

        let id = JourneysRepo::insert(chapter_title, &chapter_dir, &journey, advisor_notes)?;
        let advisor_notes = advisor_notes.to_string();
        Ok(serde_json::to_value(JourneyArtifacts {
            id: Some(id),
            chapter_dir,
            journey,
            advisor_notes,
        })?)
    })
}

pub async fn generate_journey(chapter_title: &str) -> Result<Journey> {
    let topics = find_chapter_topics(chapter_title)?;
    let topic_list = topics.join("\n");
    let prompt = get_prompt_provider().get_architect_prompt(&topic_list);
    let mut client = GeminiClient::new();
    client.set_system_prompt(prompt);
    let response = client.generate("Generate the journey.".to_string()).await?;
    let text = response.text();
    let text = strip_json_block(&text);
    let journey: Journey =
        serde_json::from_str(text).map_err(|e| MetisError::JsonError(e.to_string()))?;
    Ok(journey)
}

pub async fn generate_artifacts(chapter_title: &str) -> Result<String> {
    let (book_path, book_title) = find_book_for_chapter(chapter_title)?;
    let sanitized_book = sanitize_name(&book_title);
    let sanitized_chapter = sanitize_name(chapter_title);
    let chapter_dir = format!("books/{}/chapters/{}", sanitized_book, sanitized_chapter);
    fs::create_dir_all(&chapter_dir).map_err(|e| MetisError::UtilsError(e.to_string()))?;

    let chapter_pdf = format!("{}/chapter.pdf", chapter_dir);
    let page_range = detect_page_range(&book_path, chapter_title).await?;

    extract_page_range(
        &book_path,
        page_range.chapter_start,
        page_range.chapter_end,
        &chapter_pdf,
    )?;
    let pages = (page_range.chapter_end - page_range.chapter_start + 1) as usize;
    let client = Arc::new(GeminiClient::new());
    let (chapter_uri, _) = client.upload_file(&chapter_pdf).await?;

    let content_md = convert_to_markdown(&client, &chapter_uri, pages).await?;
    let content_md_path = format!("{}/content.md", chapter_dir);
    fs::write(&content_md_path, &content_md).map_err(|e| MetisError::UtilsError(e.to_string()))?;
    Ok(String::new())
}

pub async fn create_topic_map(chapter_dir: &str, journey: &Journey) -> Result<()> {
    let topic_names: Vec<String> = journey
        .arcs
        .iter()
        .flat_map(|arc| arc.topics.iter().map(|t| t.name.clone()))
        .collect();
    let content_md = fs::read_to_string(format!("{}/content.md", chapter_dir))
        .map_err(|err| MetisError::FileReadError(err.to_string()))?;
    let topic_map = map_topics(&content_md, &topic_names).await?;
    let topic_map_path = format!("{}/topic_map.json", chapter_dir);
    let topic_map_json = serde_json::to_string_pretty(&topic_map)
        .map_err(|e| MetisError::JsonError(e.to_string()))?;
    fs::write(&topic_map_path, &topic_map_json)
        .map_err(|e| MetisError::UtilsError(e.to_string()))?;
    println!(
        "[prepare 4/4] Saved topic_map.json ({} mappings)",
        topic_map.len()
    );
    Ok(())
}
