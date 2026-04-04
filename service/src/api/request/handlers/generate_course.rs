use std::{fs, sync::{Arc, Mutex}};

use serde::Deserialize;
use serde_json::Value;
use tokio::try_join;

use crate::{
    api::request::handler::runtime,
    app::{
        journey::{Journey, JourneyArtifacts},
        AppContext,
    },
    db::repo::journeys::JourneysRepo,
    error::{MetisError, Result},
    llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient},
    prompts::get_prompt_provider,
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

pub fn generate_journey_artifacts(
    chapter_title: &str,
    context: Arc<Mutex<AppContext>>,
) -> Result<JourneyArtifacts> {
    runtime().block_on(async {
        log::info!("[generate_course] spawning generate_journey + generate_artifacts in parallel");
        let res = try_join!(
            generate_journey(chapter_title),
            generate_artifacts(chapter_title)
        );
        let (journey, chapter_dir) = res?;
        log::info!("[generate_course] parallel tasks done — chapter_dir: {}, arcs: {}", chapter_dir, journey.arcs.len());

        log::info!("[generate_course] building topic map");
        let _ = create_topic_map(&chapter_dir, &journey).await;
        log::info!("[generate_course] topic map done");

        let advisor_notes =
            context
                .lock()
                .unwrap()
                .chat_state
                .notes
                .clone()
                .ok_or(MetisError::MetisError(
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
        })
    })
}

#[derive(Deserialize, Default)]
#[serde(default)]
pub struct GenerateCourseParams {
    pub chapter_title: Option<String>,
}

pub fn generate_course_handler(
    params: GenerateCourseParams,
    context: Arc<Mutex<AppContext>>,
) -> Result<Value> {
    let chapter_title = params
        .chapter_title
        .filter(|s| !s.trim().is_empty())
        .unwrap_or_else(|| context.lock().unwrap().chapter_title.clone());
    let chapter_title = chapter_title.trim().to_string();
    if chapter_title.is_empty() {
        return Err(MetisError::MetisError(
            "Choose a chapter with the advisor before creating a journey.".into(),
        ));
    }
    log::info!("[generate_course] starting for chapter: \"{}\"", chapter_title);
    let artifacts = generate_journey_artifacts(&chapter_title, Arc::clone(&context))?;
    log::info!("[generate_course] done — journey id: {:?}", artifacts.id);
    {
        let mut ctx = context.lock().unwrap();
        ctx.journey_artifacts = Some(artifacts.clone());
        ctx.chapter_title = artifacts.chapter_title.clone();
        ctx.chapter_content_dir = Some(artifacts.chapter_dir.clone());
    }
    Ok(serde_json::to_value(&artifacts)?)
}

pub async fn generate_journey(chapter_title: &str) -> Result<Journey> {
    log::info!("[generate_journey] finding topics for \"{}\"", chapter_title);
    let topics = find_chapter_topics(chapter_title)?;
    log::info!("[generate_journey] found {} topics", topics.len());

    let topic_list = topics.join("\n");
    let prompt = get_prompt_provider().get_architect_prompt(&topic_list);
    let mut client = GeminiClient::new();
    client.set_system_prompt(prompt);

    log::info!("[generate_journey] calling LLM to generate arc structure");
    let response = client.generate("Generate the journey.".to_string()).await?;
    let text = response.text();
    let text = strip_json_block(&text);

    let journey: Journey =
        serde_json::from_str(text).map_err(|e| MetisError::JsonError(e.to_string()))?;
    log::info!("[generate_journey] parsed journey: {} arcs", journey.arcs.len());
    Ok(journey)
}

pub async fn generate_artifacts(chapter_title: &str) -> Result<String> {
    log::info!("[generate_artifacts] looking up book for \"{}\"", chapter_title);
    let (book_path, book_title) = find_book_for_chapter(chapter_title)?;
    log::info!("[generate_artifacts] found book \"{}\" at {}", book_title, book_path);

    let sanitized_book = sanitize_name(&book_title);
    let sanitized_chapter = sanitize_name(chapter_title);
    let chapter_dir = format!("../books/{}/chapters/{}", sanitized_book, sanitized_chapter);
    log::info!("[generate_artifacts] chapter_dir: {}", chapter_dir);
    fs::create_dir_all(&chapter_dir).map_err(|e| MetisError::UtilsError(e.to_string()))?;

    let chapter_pdf = format!("{}/chapter.pdf", chapter_dir);

    log::info!("[generate_artifacts] detecting page range for chapter");
    let page_range = detect_page_range(&book_path, chapter_title).await?;
    log::info!("[generate_artifacts] page range: {}-{}", page_range.chapter_start, page_range.chapter_end);

    log::info!("[generate_artifacts] extracting chapter PDF to {}", chapter_pdf);
    extract_page_range(
        &book_path,
        page_range.chapter_start,
        page_range.chapter_end,
        &chapter_pdf,
    )?;
    log::info!("[generate_artifacts] chapter PDF extracted");

    let pages = (page_range.chapter_end - page_range.chapter_start + 1) as usize;
    let client = Arc::new(GeminiClient::new());

    log::info!("[generate_artifacts] uploading chapter PDF to Gemini ({} pages)", pages);
    let (chapter_uri, _) = client.upload_file(&chapter_pdf).await?;
    log::info!("[generate_artifacts] uploaded — uri: {}", chapter_uri);

    log::info!("[generate_artifacts] converting chapter to markdown");
    let content_md = convert_to_markdown(&client, &chapter_uri, pages).await?;
    log::info!("[generate_artifacts] markdown done ({} chars)", content_md.len());

    let content_md_path = format!("{}/content.md", chapter_dir);
    fs::write(&content_md_path, &content_md).map_err(|e| MetisError::UtilsError(e.to_string()))?;
    log::info!("[generate_artifacts] wrote content.md");
    Ok(chapter_dir)
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
    log::info!("[create_topic_map] saved topic_map.json ({} mappings)", topic_map.len());
    Ok(())
}
