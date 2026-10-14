use std::time::{SystemTime, UNIX_EPOCH};

use serde::Deserialize;
use serde_json::json;

use crate::{
    app::{
        resource::{
            book::{Book, Chapter},
            document::{Document, DocumentType, Section},
            resource::{Resource, ResourceType},
        },
        user_input::UserInput,
        AppContext,
    },
    bridges::user_input::UserInputBridge,
    db::repo::Repository,
    error::{MetisError, Result},
    llm_client::{
        factory::{GeminiModel, LLMClientFactory},
        llm_client::LLMClient,
    },
    prompts::get_prompt_provider,
    service::handler::BoxFuture,
    utils::{
        format::sanitize_json,
        pdf::{merge_pdfs, truncated_copy},
    },
};

#[derive(Deserialize)]
pub struct SubmitUserInputParams {
    #[serde(default)]
    pub request_id: Option<String>,
    pub inputs: Vec<UserInput>,
    pub notes: String,
}

#[derive(Deserialize)]
struct ProbeResult {
    resource_type: String,
    #[serde(default)]
    document_type: Option<DocumentType>,
    title: String,
    description: String,
}

#[derive(Deserialize)]
struct BookStructure {
    table_of_content: Vec<Chapter>,
}

#[derive(Deserialize)]
struct DocumentStructure {
    table_of_content: Vec<Section>,
}

pub fn submit_user_input(params: SubmitUserInputParams, _context: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let mut pdf_paths: Vec<String> = Vec::new();
        for input in &params.inputs {
            pdf_paths.push(input.to_pdf()?);
        }
        if pdf_paths.is_empty() {
            return Err(MetisError::ParamsError("no inputs provided".into()));
        }

        let resource_dir = crate::utils::paths::resources_dir();
        let resource_path = resource_dir
            .join(format!("{}.pdf", uuid::Uuid::new_v4()))
            .to_string_lossy()
            .into_owned();

        if pdf_paths.len() == 1 {
            std::fs::copy(&pdf_paths[0], &resource_path)?;
        } else {
            merge_pdfs(&pdf_paths, &resource_path)?;
        }

        let probe_pdf = truncated_copy(&resource_path)?;
        let probe = probe_resource(&probe_pdf).await?;

        let resource_type = match probe.resource_type.as_str() {
            "TextBook" => ResourceType::TextBook(Book {
                table_of_content: analyse_book_structure(&probe_pdf).await?,
            }),
            "Document" => {
                let document_type = probe.document_type.ok_or_else(|| {
                    MetisError::AgentError("document_type missing for Document resource".into())
                })?;
                ResourceType::Document(Document {
                    document_type,
                    table_of_content: document_sections(&probe_pdf).await?,
                })
            }
            "Question" => ResourceType::Question,
            "Solution" => ResourceType::Solution,
            other => {
                return Err(MetisError::AgentError(format!(
                    "unknown resource_type: {other}"
                )))
            }
        };

        if probe_pdf != resource_path {
            let _ = std::fs::remove_file(&probe_pdf);
        }

        let created_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        let resource = Resource {
            id: None,
            title: probe.title,
            path: resource_path,
            description: probe.description,
            agent_notes: params.notes,
            resource_type,
            created_at,
        };

        let created = Repository::<Resource>::create(resource)?;
        let id = created.read().id.unwrap();
        if let Some(request_id) = &params.request_id {
            UserInputBridge::resolve(request_id, id).await;
        }
        Ok(json!({ "success": true, "resource_id": id }).into())
    })
}

async fn probe_resource(path: &str) -> Result<ProbeResult> {
    let mut client = LLMClientFactory::get_gemini_client(GeminiModel::Flash);
    client.set_system_prompt(get_prompt_provider().get_probe_resource_prompt());
    let raw = client
        .generate_with_file("Classify this resource.".to_string(), path)
        .await?
        .text();
    let text = sanitize_json(&raw);
    serde_json::from_str(&text).map_err(|e| MetisError::JsonError(e.to_string()))
}

async fn analyse_book_structure(path: &str) -> Result<Vec<Chapter>> {
    let mut client = LLMClientFactory::get_gemini_client(GeminiModel::Flash);
    client.set_system_prompt(get_prompt_provider().get_analyse_book_prompt());
    let raw = client
        .generate_with_file("Extract the table of contents.".to_string(), path)
        .await?
        .text();
    let text = sanitize_json(&raw);
    let parsed: BookStructure =
        serde_json::from_str(&text).map_err(|e| MetisError::JsonError(e.to_string()))?;
    Ok(parsed.table_of_content)
}

async fn document_sections(path: &str) -> Result<Vec<Section>> {
    let mut client = LLMClientFactory::get_gemini_client(GeminiModel::Flash);
    client.set_system_prompt(get_prompt_provider().get_document_sections_prompt());
    let raw = client
        .generate_with_file("Extract the document sections.".to_string(), path)
        .await?
        .text();
    let text = sanitize_json(&raw);
    let parsed: DocumentStructure =
        serde_json::from_str(&text).map_err(|e| MetisError::JsonError(e.to_string()))?;
    Ok(parsed.table_of_content)
}
