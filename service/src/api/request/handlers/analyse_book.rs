use serde::Deserialize;
use serde_json::Value;
use std::{
    fs,
    sync::{Arc, Mutex},
};

use crate::{
    api::request::handler::BoxFuture,
    app::{book::Chapter, AppContext},
    db::repo::books::BooksRepo,
    error::Result,
    llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient},
    prompts::get_prompt_provider,
    utils::{
        format::strip_json_block,
        pdf::{copy_pdf, truncated_copy},
    },
};

pub struct AnalyseBookHandler;

#[derive(Deserialize)]
pub struct AnalyseBookPayload {
    pub path: String,
}

#[derive(Deserialize, Debug)]
struct AnalyseBookResponse {
    title: String,
    table_of_content: Vec<Chapter>,
}

pub fn analyse_book_handler(
    payload: AnalyseBookPayload,
    context: &AppContext,
) -> BoxFuture<'_> {
    Box::pin(async move {
        let book_path = copy_pdf(&payload.path)?;
        let upload_path = truncated_copy(&book_path)?;
        let mut client = GeminiClient::new();
        let (file_uri, _uploaded_at) = client.upload_file(&upload_path).await?;
        client.set_system_prompt(get_prompt_provider().get_analyse_book_prompt());
        let response = client
            .generate_with_file("Analyse this book.".to_string(), &file_uri)
            .await?;
        let text = response.text();
        let text = strip_json_block(&text);
        let parsed: AnalyseBookResponse = serde_json::from_str(text)?;
        if upload_path != book_path {
            let _ = fs::remove_file(&upload_path);
        }
        let id = BooksRepo::insert(&parsed.title, &book_path, &parsed.table_of_content)?;
        Ok(serde_json::json!({
            "id": id,
            "title": parsed.title,
            "table_of_content": parsed.table_of_content,
        }))
    })
}
