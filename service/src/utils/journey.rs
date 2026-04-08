use std::{fs, sync::Arc};

use tokio::{sync::Semaphore, task::JoinSet};

use crate::{
    app::journey::TopicRange, db::repo::books::BooksRepo, error::{MetisError, Result}, llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient}, prompts::get_prompt_provider, api::request::handlers::generate_course::PageRange, utils::{
        format::{clean_page_output, extract_json_object, strip_json_block},
        pdf::truncated_copy,
    }
};

const MAX_CONCURRENT_PRO: usize = 5;

pub fn find_book_for_chapter(chapter_title: &str, preferred_book_id: Option<i64>) -> Result<(String, String)> {
    let books = BooksRepo::list()?;

    // If the advisor set a specific book, search only that one first.
    if let Some(id) = preferred_book_id {
        if let Some(book) = books.iter().find(|b| b.id == id) {
            for chapter in &book.toc {
                if chapter.title.contains(chapter_title) || chapter_title.contains(&chapter.title) {
                    return Ok((book.path.clone(), book.title.clone()));
                }
            }
            // Chapter not found in the preferred book — fall through to all books.
        }
    }

    for book in &books {
        for chapter in &book.toc {
            if chapter.title.contains(chapter_title) || chapter_title.contains(&chapter.title) {
                return Ok((book.path.clone(), book.title.clone()));
            }
        }
    }
    Err(MetisError::UtilsError(format!(
        "No book found containing chapter \"{}\"",
        chapter_title
    )))
}

pub async fn map_topics(content_md: &str, topics: &[String]) -> Result<Vec<TopicRange>> {
    let topic_list = topics
        .iter()
        .enumerate()
        .map(|(i, t)| format!("{}. {}", i + 1, t))
        .collect::<Vec<_>>()
        .join("\n");
    let prompt = get_prompt_provider().get_topic_mapper_prompt(&topic_list);

    let mut mapper = GeminiClient::new();
    mapper.set_system_prompt(prompt);
    let response = mapper
        .generate(format!(
            "Map the topics to page ranges in this markdown:\n\n{}",
            content_md
        ))
        .await?;

    let response_text = response.text();
    let json_text = strip_json_block(&response_text);
    let ranges: Vec<TopicRange> = serde_json::from_str(json_text).map_err(|e| {
        MetisError::JsonError(format!(
            "Failed to parse topic map: {e}\nResponse: {response_text}"
        ))
    })?;
    Ok(ranges)
}

pub async fn detect_page_range(book_path: &str, chapter_title: &str) -> Result<PageRange> {
    let truncated = truncated_copy(book_path)?;
    let mut client = GeminiClient::new();
    let (file_uri, _) = client.upload_file(&truncated).await?;
    let prompt = get_prompt_provider().get_page_range_prompt(chapter_title);
    client.set_system_prompt(prompt);

    let response = client
        .generate_with_file(
            format!("Find the page range for chapter \"{}\".", chapter_title),
            &file_uri,
        )
        .await?;

    if truncated != book_path {
        let _ = fs::remove_file(&truncated);
    }

    let response_text = response.text();
    let json_text =
        extract_json_object(&response_text).unwrap_or_else(|| strip_json_block(&response_text));
    let range: PageRange = serde_json::from_str(json_text).map_err(|e| {
        MetisError::JsonError(format!(
            "Failed to parse page range: {e}\nResponse: {response_text}"
        ))
    })?;
    Ok(range)
}

const PAGES_PER_CALL: usize = 2;

pub async fn convert_to_markdown(
    client: &Arc<GeminiClient>,
    file_uri: &str,
    num_pages: usize,
) -> Result<String> {
    let semaphore = Arc::new(Semaphore::new(MAX_CONCURRENT_PRO));
    let mut set = JoinSet::new();
    let prompts = get_prompt_provider();

    // Batch pages in pairs — one API call per pair (or single page if odd total)
    let mut page = 1;
    while page <= num_pages {
        let page_end = (page + PAGES_PER_CALL - 1).min(num_pages);
        let sem = semaphore.clone();
        let client = client.clone();
        let uri = file_uri.to_string();
        let prompt = prompts.get_page_to_md_prompt(page, page_end);
        let batch_start = page;
        set.spawn(async move {
            let _permit = sem
                .acquire()
                .await
                .map_err(|e| MetisError::UtilsError(e.to_string()))?;
            let response = client.generate_with_file(prompt, &uri).await?;
            Ok::<(usize, String), MetisError>((batch_start, response.text()))
        });
        page += PAGES_PER_CALL;
    }

    // Collect batches, sort by start page, then join raw (LLM already outputs <!-- PAGE N --> markers)
    let mut batches: Vec<(usize, String)> = Vec::new();
    while let Some(result) = set.join_next().await {
        match result {
            Ok(Ok(batch)) => {
                println!("  [md] pages {}-{}/{}", batch.0, (batch.0 + PAGES_PER_CALL - 1).min(num_pages), num_pages);
                batches.push(batch);
            }
            Ok(Err(e)) => return Err(e),
            Err(e) => return Err(MetisError::UtilsError(format!("Task join error: {e}"))),
        }
    }

    batches.sort_by_key(|(start, _)| *start);
    let combined = batches
        .iter()
        .map(|(_, content)| clean_page_output(content))
        .collect::<Vec<_>>()
        .join("\n\n");

    Ok(combined)
}

pub fn find_chapter_topics(chapter_title: &str) -> Result<Vec<String>> {
    let books = BooksRepo::list()?;

    for book in &books {
        for chapter in &book.toc {
            if chapter.title.contains(chapter_title) || chapter_title.contains(&chapter.title) {
                return Ok(chapter.topics.iter().map(|t| t.title.clone()).collect());
            }
        }
    }

    Err(MetisError::UtilsError(format!(
        "Chapter \"{}\" not found in any book",
        chapter_title
    )))
}

/// Sends content.md to Gemini and asks it to produce a flat, teachable topic list
/// by extracting every meaningful heading, excluding exercises/problems sections.
pub async fn extract_topics_from_content(content_md: &str) -> Result<Vec<String>> {
    let mut client = GeminiClient::with_model("gemini-2.5-pro");
    client.set_system_prompt(get_prompt_provider().get_content_to_topics_prompt());

    let response = client
        .generate(format!(
            "Extract the teachable topic list from this chapter content:\n\n{}",
            content_md
        ))
        .await?;

    let text = response.text();
    let json_text = strip_json_block(&text);
    let topics: Vec<String> = serde_json::from_str(json_text).map_err(|e| {
        MetisError::JsonError(format!(
            "Failed to parse topic list: {e}\nResponse: {text}"
        ))
    })?;
    Ok(topics)
}
