use std::{fs, sync::Arc};

use tokio::{sync::Semaphore, task::JoinSet};

use crate::{
    app::journey::TopicRange, db::repo::books::BooksRepo, error::{MetisError, Result}, llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient}, prompts::get_prompt_provider, api::request::handlers::generate_course::PageRange, utils::{
        format::{clean_page_output, extract_json_object, strip_json_block},
        pdf::truncated_copy,
    }
};

const MAX_CONCURRENT_PRO: usize = 5;

pub fn find_book_for_chapter(chapter_title: &str) -> Result<(String, String)> {
    let books = BooksRepo::list()?;
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

pub async fn convert_to_markdown(
    client: &Arc<GeminiClient>,
    file_uri: &str,
    num_pages: usize,
) -> Result<String> {
    let semaphore = Arc::new(Semaphore::new(MAX_CONCURRENT_PRO));
    let mut set = JoinSet::new();
    let prompts = get_prompt_provider();

    for page in 1..=num_pages {
        let sem = semaphore.clone();
        let client = client.clone();
        let uri = file_uri.to_string();
        let prompt = prompts.get_page_to_md_prompt(page);
        set.spawn(async move {
            let _permit = sem
                .acquire()
                .await
                .map_err(|e| MetisError::UtilsError(e.to_string()))?;
            let response = client.generate_with_file(prompt, &uri).await?;
            Ok::<(usize, String), MetisError>((page, response.text()))
        });
    }

    let mut pages: Vec<(usize, String)> = Vec::with_capacity(num_pages);
    while let Some(result) = set.join_next().await {
        match result {
            Ok(Ok(page_data)) => {
                println!("  [md] page {}/{}", page_data.0, num_pages);
                pages.push(page_data);
            }
            Ok(Err(e)) => return Err(e),
            Err(e) => return Err(MetisError::UtilsError(format!("Task join error: {e}"))),
        }
    }

    pages.sort_by_key(|(page, _)| *page);
    let combined = pages
        .iter()
        .map(|(page, content)| format!("<!-- PAGE {} -->\n{}", page, clean_page_output(content)))
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
