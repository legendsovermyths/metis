use std::env;

use crate::{
    constants::{BEDROCK_ANTHROPIC_VERSION, BEDROCK_BASE_URL},
    error::{MetisError, Result},
    llm_client::llm_client::{LLMClient, LLMResponse},
    logs::Event,
};
use async_trait::async_trait;
use reqwest::Client;
use serde_json::{Value, json};

pub struct ClaudeClient {
    base_url: String,
    client: Client,
    system_prompt: String,
    model_name: String,
    json_mode: bool,
}

impl ClaudeClient {
    pub fn new() -> Self {
        Self::with_model("us.anthropic.claude-opus-4-6-v1")
    }

    pub fn with_model(model: &str) -> Self {
        Self {
            base_url: BEDROCK_BASE_URL.to_string(),
            client: Client::new(),
            system_prompt: String::new(),
            model_name: model.to_string(),
            json_mode: false,
        }
    }

    pub fn set_json_mode(&mut self, enabled: bool) {
        self.json_mode = enabled;
    }

    fn effective_system(&self) -> String {
        if self.json_mode {
            if self.system_prompt.is_empty() {
                "Respond with a single valid JSON value. No prose, no markdown fences.".to_string()
            } else {
                format!(
                    "{}\n\nRespond with a single valid JSON value. No prose, no markdown fences.",
                    self.system_prompt
                )
            }
        } else {
            self.system_prompt.clone()
        }
    }

    fn build_request(&self, prompt: &str) -> Value {
        json!({
            "anthropic_version": BEDROCK_ANTHROPIC_VERSION,
            "max_tokens": 32000,
            "system": self.effective_system(),
            "messages": [
                {"role": "user", "content": prompt}
            ],
            "thinking": { "type": "adaptive" },
            "output_config": { "effort": "high" },
        })
    }

    fn parse_response(response: Value) -> Result<String> {
        let content = response
            .get("content")
            .and_then(|c| c.as_array())
            .ok_or(MetisError::JsonError("No content array in response".to_string()))?;
        for block in content {
            if block.get("type").and_then(|t| t.as_str()) == Some("text") {
                if let Some(text) = block.get("text").and_then(|t| t.as_str()) {
                    return Ok(text.to_string());
                }
            }
        }
        Err(MetisError::JsonError(
            "No text block in response content".to_string(),
        ))
    }
}

#[async_trait]
impl LLMClient for ClaudeClient {
    async fn generate(&self, prompt: String) -> Result<LLMResponse> {
        Event::new("user", crate::logs::EventType::UserMessage, &prompt);
        let api_key = env::var("BEDROCK_API_KEY")?;
        let url = format!("{}/model/{}/invoke", self.base_url, self.model_name);
        let request = self.build_request(&prompt);
        let response = self
            .client
            .post(&url)
            .header("Authorization", format!("Bearer {}", api_key))
            .header("Content-Type", "application/json")
            .json(&request)
            .send()
            .await?;
        let status = response.status();
        if !status.is_success() {
            let body = response.text().await.unwrap_or_default();
            return Err(MetisError::HttpError(format!("{status}: {body}")));
        }
        let response: Value = response.json().await?;
        let result = Self::parse_response(response)?;
        Event::new("model", crate::logs::EventType::LlmMessage, &result);
        Ok(LLMResponse::from(result))
    }
    fn set_system_prompt(&mut self, prompt: String) {
        self.system_prompt = prompt;
    }
}
