use std::{fs, sync::Arc};

use tokio::{sync::Semaphore, task::JoinSet};

use crate::{
    app::journey::{artifact::TopicRange, Journey}, db::repo::books::BooksRepo, error::{MetisError, Result}, llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient}, prompts::get_prompt_provider, task::tasks::create_journey::PageRange, utils::{
        format::{clean_page_output, strip_json_block},
        pdf::{extract_page_range, truncated_copy},
    }
};

const MAX_CONCURRENT_PRO: usize = 5;

pub fn find_book_for_chapter(
    chapter_title: &str,
    preferred_book_id: Option<i64>,
) -> Result<(String, String)> {
    let books = BooksRepo::list()?;

    if let Some(id) = preferred_book_id {
        if let Some(book) = books.iter().find(|b| b.id == id) {
            for chapter in &book.toc {
                if chapter.title.contains(chapter_title) || chapter_title.contains(&chapter.title) {
                    return Ok((book.path.clone(), book.title.clone()));
                }
            }
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

    let mut mapper = GeminiClient::with_model("gemini-3.1-pro-preview");
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
    client.set_json_mode(true);
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
    let range: PageRange = serde_json::from_str(&response_text).map_err(|e| {
        MetisError::JsonError(format!(
            "Failed to parse page range: {e}\nResponse: {response_text}"
        ))
    })?;
    log::info!(
        "[detect_page_range] complete — PDF pages {}-{}",
        range.chapter_start,
        range.chapter_end
    );
    Ok(range)
}

const PAGES_PER_CALL: usize = 2;

pub async fn convert_to_markdown(chapter_pdf: &str, num_pages: usize) -> Result<String> {
    let total_batches = (num_pages + PAGES_PER_CALL - 1) / PAGES_PER_CALL;

    // Phase 1: slice all batch PDFs upfront (fast, synchronous)
    let mut batch_pdfs: Vec<(usize, usize, String)> = Vec::new();
    let mut page = 1;
    while page <= num_pages {
        let page_end = (page + PAGES_PER_CALL - 1).min(num_pages);
        let batch_pdf = format!(
            "{}.batch_{}-{}.pdf",
            chapter_pdf.trim_end_matches(".pdf"),
            page,
            page_end
        );
        extract_page_range(chapter_pdf, page as u32, page_end as u32, &batch_pdf)?;
        batch_pdfs.push((page, page_end, batch_pdf));
        page += PAGES_PER_CALL;
    }
    log::info!("[convert_to_markdown] sliced {total_batches} batch PDFs, uploading + extracting (max {MAX_CONCURRENT_PRO} concurrent)");

    // Phase 2: upload + generate in parallel, semaphore only gates the LLM call
    let semaphore = Arc::new(Semaphore::new(MAX_CONCURRENT_PRO));
    let mut set = JoinSet::new();

    for (batch_start, page_end, batch_pdf) in batch_pdfs {
        let sem = semaphore.clone();
        let batch_pages = page_end - batch_start + 1;

        set.spawn(async move {
            let client = GeminiClient::new();
            let (file_uri, _) = client.upload_file(&batch_pdf).await?;
            let _ = fs::remove_file(&batch_pdf);

            let _permit = sem
                .acquire()
                .await
                .map_err(|e| MetisError::UtilsError(e.to_string()))?;

            let prompts = get_prompt_provider();
            let prompt = if batch_pages == 1 {
                format!(
                    "{}\n\nExtract page 1 of this PDF.",
                    prompts.get_page_to_md_raw()
                )
            } else {
                format!(
                    "{}\n\nExtract pages 1 and 2 of this PDF.",
                    prompts.get_page_to_md_raw()
                )
            };

            let response = client.generate_with_file(prompt, &file_uri).await?;
            Ok::<(usize, String), MetisError>((batch_start, response.text()))
        });
    }

    let mut batches: Vec<(usize, String)> = Vec::new();
    while let Some(result) = set.join_next().await {
        match result {
            Ok(Ok(batch)) => {
                log::info!(
                    "[convert_to_markdown] {}/{total_batches} done",
                    batches.len() + 1
                );
                batches.push(batch);
            }
            Ok(Err(e)) => {
                log::error!("[convert_to_markdown] batch failed: {e}");
                return Err(e);
            }
            Err(e) => return Err(MetisError::UtilsError(format!("Task join error: {e}"))),
        }
    }

    batches.sort_by_key(|(start, _)| *start);
    let combined = batches
        .iter()
        .enumerate()
        .map(|(i, (_, content))| {
            let raw = clean_page_output(content);
            let page_num = i * PAGES_PER_CALL + 1;
            let page_end = (page_num + PAGES_PER_CALL - 1).min(num_pages);
            if page_num == page_end {
                format!("<!-- PAGE {} -->\n\n{}", page_num, raw)
            } else {
                raw.replace("<!-- PAGE 1 -->", &format!("<!-- PAGE {} -->", page_num))
                    .replace("<!-- PAGE 2 -->", &format!("<!-- PAGE {} -->", page_end))
            }
        })
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

pub async fn extract_topics_from_content(content_md: &str) -> Result<Vec<String>> {
    let mut client = GeminiClient::with_model("gemini-3.1-pro-preview");
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
        MetisError::JsonError(format!("Failed to parse topic list: {e}\nResponse: {text}"))
    })?;
    Ok(topics)
}

pub async fn generate_journey(topics: Vec<String>) -> Result<Journey> {
    log::info!(
        "[generate_journey] {} topics — calling LLM to generate arc structure",
        topics.len()
    );
    let topic_list = topics.join("\n");
    let prompt = get_prompt_provider().get_architect_prompt(&topic_list);
    let mut client = GeminiClient::with_model("gemini-3.1-pro-preview");
    client.set_system_prompt(prompt);

    let response = client.generate("Generate the journey.".to_string()).await?;
    let text = response.text();
    let text = strip_json_block(&text);

    let journey: Journey =
        serde_json::from_str(text).map_err(|e| MetisError::JsonError(e.to_string()))?;
    log::info!(
        "[generate_journey] parsed journey: {} arcs",
        journey.arcs.len()
    );
    Ok(journey)
}

pub async fn create_topic_map(chapter_dir: &str, journey: &Journey) -> Result<()> {
    let topic_names: Vec<String> = journey
        .arcs
        .iter()
        .flat_map(|arc| arc.topics.iter().map(|t| t.name.clone()))
        .collect();
    log::info!("[create_topic_map] mapping {} topics", topic_names.len());

    let content_md = fs::read_to_string(format!("{}/content.md", chapter_dir))
        .map_err(|err| MetisError::FileReadError(err.to_string()))?;

    let topic_map = map_topics(&content_md, &topic_names).await?;
    log::info!("[create_topic_map] got {} mappings", topic_map.len());

    let topic_map_path = format!("{}/topic_map.json", chapter_dir);
    let topic_map_json = serde_json::to_string_pretty(&topic_map)
        .map_err(|e| MetisError::JsonError(e.to_string()))?;
    fs::write(&topic_map_path, &topic_map_json)
        .map_err(|e| MetisError::UtilsError(e.to_string()))?;
    log::info!(
        "[create_topic_map] saved topic_map.json ({} mappings)",
        topic_map.len()
    );
    Ok(())
}
