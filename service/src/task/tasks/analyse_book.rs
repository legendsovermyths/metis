use std::fs;

use serde::{Deserialize, Serialize};

use crate::{
    app::book::Chapter,
    db::repo::books::BooksRepo,
    llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient},
    prompts::get_prompt_provider,
    task::{
        context::TaskContext,
        gaurd::TaskGaurd,
        manager::TaskFuture,
        progress::{TaskProgress, TaskStatus},
    },
    utils::{
        format::strip_json_block,
        pdf::{copy_pdf, truncated_copy},
    },
};

#[derive(Deserialize, Serialize, Default)]
pub struct AnalyseBookParams {
    pub path: String,
}

#[derive(Deserialize, Debug)]
struct AnalyseBookResponse {
    title: String,
    table_of_content: Vec<Chapter>,
}

#[derive(Deserialize, Serialize)]
pub struct AnalyseBookCheckpoint {
    truncated_path: Option<String>,
}

pub fn analyse_book(context: TaskContext) -> TaskFuture {
    Box::pin(async move {
        let params: AnalyseBookParams = serde_json::from_value(context.params)?;
        let mut checkpoint: AnalyseBookCheckpoint = serde_json::from_value(context.checkpoint)?;
        let book_path = copy_pdf(&params.path)?;

        if checkpoint.truncated_path.is_none() {
            let truncated_path = truncated_copy(&book_path)?;
            checkpoint.truncated_path = Some(truncated_path);
            let _ = context
                .progress_tx
                .send(TaskProgress {
                    task_id: context.id,
                    message: "Truncated pdf".into(),
                    checkpoint: serde_json::to_value(&checkpoint)?,
                    status: TaskStatus::Running,
                })
                .await;
        }

        let truncated_path = checkpoint.truncated_path.unwrap();

        let mut client = GeminiClient::new();
        let (file_uri, _uploaded_at) = client.upload_file(&truncated_path).await?;
        client.set_system_prompt(get_prompt_provider().get_analyse_book_prompt());
        let response = client
            .generate_with_file("Analyse this book.".to_string(), &file_uri)
            .await?;
        let text = response.text();
        let text = strip_json_block(&text);
        let parsed: AnalyseBookResponse = serde_json::from_str(text)?;
        if truncated_path != book_path {
            let _ = fs::remove_file(&truncated_path);
        }
        let id = BooksRepo::insert(&parsed.title, &book_path, &parsed.table_of_content)?;
        Ok(serde_json::json!({
            "id": id,
            "title": parsed.title,
            "table_of_content": parsed.table_of_content,
        }))
    })
}

impl TaskGaurd for AnalyseBookParams {
    fn identity(&self) -> Option<String> {
        Some(format!("path:{}", self.path))
    }
}

impl Default for AnalyseBookCheckpoint {
    fn default() -> Self {
        Self {
            truncated_path: None,
        }
    }
}
