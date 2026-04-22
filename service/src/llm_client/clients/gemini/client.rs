use std::{
    env,
    time::{SystemTime, UNIX_EPOCH},
};

use crate::{
    constants::GEMINI_BASE_URL,
    error::{MetisError, Result},
    llm_client::{llm_client::{LLMClient, LLMResponse}}, logs::Event,
};
use async_trait::async_trait;
use reqwest::Client;
use serde_json::{Value, json};

pub struct GeminiClient {
    base_url: String,
    client: Client,
    system_prompt: String,
    model_name: String,
    json_mode: bool,
}

impl GeminiClient {
    pub fn new() -> Self {
        Self {
            base_url: GEMINI_BASE_URL.to_string(),
            client: Client::new(),
            system_prompt: String::new(),
            model_name: "gemini-3-flash-preview".to_string(),
            json_mode: false,
        }
    }

    pub fn with_model(model: &str) -> Self {
        Self {
            base_url: GEMINI_BASE_URL.to_string(),
            client: Client::new(),
            system_prompt: String::new(),
            model_name: model.to_string(),
            json_mode: false,
        }
    }

    pub fn set_json_mode(&mut self, enabled: bool) {
        self.json_mode = enabled;
    }

    pub async fn upload_file(&self, path: &str) -> Result<(String, i64)> {
        let api_key = env::var("GEMINI_API_KEY")?;
        let bytes = tokio::fs::read(path)
            .await
            .map_err(|e| MetisError::FileReadError(e.to_string()))?;
        let num_bytes = bytes.len();

        let init_url = format!("{}/upload/v1beta/files?key={}", self.base_url, api_key);
        let init_resp = self
            .client
            .post(&init_url)
            .header("X-Goog-Upload-Protocol", "resumable")
            .header("X-Goog-Upload-Command", "start")
            .header("X-Goog-Upload-Header-Content-Length", num_bytes.to_string())
            .header("X-Goog-Upload-Header-Content-Type", "application/pdf")
            .header("Content-Type", "application/json")
            .body(r#"{"file": {"display_name": "textbook"}}"#)
            .send()
            .await?;

        let upload_url = init_resp
            .headers()
            .get("x-goog-upload-url")
            .ok_or_else(|| {
                MetisError::HttpError("No x-goog-upload-url header in response".into())
            })?
            .to_str()
            .map_err(|e| MetisError::HttpError(e.to_string()))?
            .to_string();

        let upload_resp: serde_json::Value = self
            .client
            .post(&upload_url)
            .header("Content-Length", num_bytes.to_string())
            .header("X-Goog-Upload-Offset", "0")
            .header("X-Goog-Upload-Command", "upload, finalize")
            .body(bytes)
            .send()
            .await?
            .json()
            .await?;

        let uri = upload_resp
            .get("file")
            .and_then(|f| f.get("uri"))
            .and_then(|u| u.as_str())
            .ok_or_else(|| MetisError::JsonError("No file.uri in upload response".into()))?
            .to_string();

        let uploaded_at = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        Ok((uri, uploaded_at))
    }

    fn build_request(&self, prompt: &str, file_uri: Option<&str>) -> Value {
        let mut parts = vec![json!({"text": prompt})];
        if let Some(uri) = file_uri {
            parts.push(json!({
                "file_data": { "mime_type": "application/pdf", "file_uri": uri }
            }));
        }
        let mut request = json!({
            "systemInstruction": {
                "parts": [{"text": self.system_prompt}]
            },
            "contents": [
                {"parts": parts}
            ],
        });
        if self.json_mode {
            request["generationConfig"] = json!({
                "responseMimeType": "application/json"
            });
        }
        request
    }

    fn parse_response(response: serde_json::Value) -> Result<String> {
        let text = response
            .get("candidates")
            .and_then(|c| c.get(0))
            .ok_or(MetisError::JsonError("No key named candidates".to_string()))?
            .get("content")
            .ok_or(MetisError::JsonError("No key named content".to_string()))?
            .get("parts")
            .and_then(|p| p.get(0))
            .ok_or(MetisError::JsonError("No key named parts".to_string()))?
            .get("text")
            .and_then(|t| t.as_str())
            .ok_or(MetisError::JsonError("No key named text".to_string()))?;
        Ok(text.to_string())
    }

    pub async fn generate_with_file(&self, prompt: String, file_uri: &str) -> Result<LLMResponse> {
        Event::new("user", crate::logs::EventType::UserMessage, &prompt);
        let api_key = env::var("GEMINI_API_KEY")?;
        let url = format!(
            "{}/v1beta/models/{}:generateContent",
            self.base_url, self.model_name
        );
        let request = self.build_request(&prompt, Some(file_uri));
        let response = self
            .client
            .post(&url)
            .header("x-goog-api-key", api_key)
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;
        let status = response.status();
        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(MetisError::HttpError(format!("{status}: {body}")));
        }
        let response: serde_json::Value = response.json().await?;
        let result = Self::parse_response(response)?;
        Event::new("model", crate::logs::EventType::LlmMessage, &result);
        Ok(LLMResponse::from(result))
    }
}

#[async_trait]
impl LLMClient for GeminiClient {
    async fn generate(&self, prompt: String) -> Result<LLMResponse> {
        Event::new("user", crate::logs::EventType::UserMessage, &prompt);
        let api_key = env::var("GEMINI_API_KEY")?;
        let url = format!(
            "{}/v1beta/models/{}:generateContent",
            self.base_url, self.model_name
        );
        let request = self.build_request(&prompt, None);
        let response = self
            .client
            .post(&url)
            .header("x-goog-api-key", api_key)
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;
        let status = response.status();
        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(MetisError::HttpError(format!("{status}: {body}")));
        }
        let response: serde_json::Value = response.json().await?;
        let result = Self::parse_response(response)?;
        Event::new("model", crate::logs::EventType::LlmMessage, &result);
        Ok(LLMResponse::from(result))
    }
    fn set_system_prompt(&mut self, prompt: String) {
        self.system_prompt = prompt;
    }
}
