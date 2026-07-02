use base64::{Engine, engine::general_purpose::STANDARD};

use crate::{
    error::{MetisError, Result},
    llm_client::{clients::gemini::auth::{ServiceAccount, get_access_token, load_service_account}, llm_client::{LLMClient, LLMResponse}},
    logs::Event,
};
use async_trait::async_trait;
use reqwest::Client;
use serde_json::{Value, json};

pub const VERTEX_BASE_URL: &str = "https://aiplatform.googleapis.com";

pub struct GeminiClient {
    client: Client,
    system_prompt: String,
    model_name: String,
    json_mode: bool,
    file_mime_type: String,
    sa: ServiceAccount,
}

impl GeminiClient {
    pub fn new() -> Self {
        Self::with_model("gemini-3-flash-preview")
    }

    pub fn with_model(model: &str) -> Self {
        let sa = load_service_account().expect("VERTEX_AI_SERVICE_ACCOUNT must be set");
        Self {
            client: Client::new(),
            system_prompt: String::new(),
            model_name: model.to_string(),
            json_mode: false,
            file_mime_type: "application/pdf".to_string(),
            sa,
        }
    }

    pub fn set_file_mime_type(&mut self, mime: &str) {
        self.file_mime_type = mime.to_string();
    }

    fn vertex_url(&self) -> String {
        format!(
            "{}/v1/projects/{}/locations/global/publishers/google/models/{}:generateContent",
            VERTEX_BASE_URL, self.sa.project_id, self.model_name
        )
    }

    fn build_request(&self, prompt: &str, inline_data: Option<Value>) -> Value {
        let mut parts = vec![json!({"text": prompt})];
        if let Some(data) = inline_data {
            parts.push(json!({"inlineData": data}));
        }
        let mut request = json!({
            "systemInstruction": {
                "parts": [{"text": self.system_prompt}]
            },
            "contents": [{"role": "user", "parts": parts}],
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

    pub async fn synthesize_speech(
        &self,
        text: &str,
        voice: &str,
        direction: &str,
    ) -> Result<Vec<u8>> {
        let request = json!({
            "input": {"text": text, "prompt": direction},
            "voice": {
                "languageCode": crate::constants::GEMINI_TTS_LANGUAGE,
                "name": voice,
                "model_name": self.model_name,
            },
            "audioConfig": {"audioEncoding": "MP3"},
        });
        let token = get_access_token(&self.sa).await?;
        let response = self
            .client
            .post(crate::constants::CLOUD_TTS_URL)
            .bearer_auth(&token)
            .header("Content-Type", "application/json")
            .header("x-goog-user-project", &self.sa.project_id)
            .json(&request)
            .send()
            .await?;
        let status = response.status();
        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(MetisError::HttpError(format!("{status}: {body}")));
        }
        let response: Value = response.json().await?;
        let encoded = response
            .get("audioContent")
            .and_then(|a| a.as_str())
            .ok_or(MetisError::JsonError("No audioContent in response".to_string()))?;
        STANDARD
            .decode(encoded)
            .map_err(|e| MetisError::JsonError(format!("Invalid base64 audio: {e}")))
    }

    pub async fn generate_with_file(&self, prompt: String, file_path: &str) -> Result<LLMResponse> {
        Event::new("user", crate::logs::EventType::UserMessage, &prompt);
        let bytes = tokio::fs::read(file_path)
            .await
            .map_err(|e| MetisError::FileReadError(e.to_string()))?;
        let data = STANDARD.encode(&bytes);
        let inline_data = json!({
            "mimeType": self.file_mime_type,
            "data": data,
        });
        let request = self.build_request(&prompt, Some(inline_data));
        let token = get_access_token(&self.sa).await?;
        let response = self
            .client
            .post(self.vertex_url())
            .bearer_auth(&token)
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
        let request = self.build_request(&prompt, None);
        let token = get_access_token(&self.sa).await?;
        let response = self
            .client
            .post(self.vertex_url())
            .bearer_auth(&token)
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

    fn set_json_mode(&mut self, enabled: bool) {
        self.json_mode = enabled;
    }
}
