use std::env;

use crate::{
    constants::OPEN_AI_ENDPOINT,
    error::{MetisError, Result},
    llm_client::llm_client::{LLMClient, LLMResponse},
    app::events::Event,
};
use async_trait::async_trait;
use reqwest::Client;
use serde_json::{Value, json};

pub struct OpenAiClient {
    endpoint: String,
    client: Client,
    system_prompt: String,
    model_name: String,
    json_mode: bool,
}

impl OpenAiClient {
    pub fn new() -> Self {
        Self::with_model("gpt-5.6-terra")
    }

    pub fn with_model(model: &str) -> Self {
        Self {
            endpoint: OPEN_AI_ENDPOINT.to_string(),
            client: Client::new(),
            system_prompt: String::new(),
            model_name: model.to_string(),
            json_mode: false,
        }
    }

    pub fn set_json_mode(&mut self, enabled: bool) {
        self.json_mode = enabled;
    }

    fn build_request(&self, prompt: &str) -> Value {
        let mut req = json!({
            "model": self.model_name,
            "input": [{"role": "user", "content": prompt}],
            "max_output_tokens": 32000,
        });
        if !self.system_prompt.is_empty() {
            req["instructions"] = json!(self.system_prompt);
        }
        if self.json_mode {
            req["text"] = json!({"format": {"type": "json_object"}});
        }
        req
    }

    fn parse_response(response: Value) -> Result<String> {
        let output = response
            .get("output")
            .and_then(|o| o.as_array())
            .ok_or(MetisError::JsonError("No output array in response".to_string()))?;
        for item in output {
            if item.get("type").and_then(|t| t.as_str()) == Some("message") {
                if let Some(content) = item.get("content").and_then(|c| c.as_array()) {
                    for block in content {
                        if let Some(text) = block.get("text").and_then(|t| t.as_str()) {
                            return Ok(text.to_string());
                        }
                    }
                }
            }
        }
        Err(MetisError::JsonError(
            "No message text in response output".to_string(),
        ))
    }
}

#[async_trait]
impl LLMClient for OpenAiClient {
    async fn generate(&self, prompt: String) -> Result<LLMResponse> {
        crate::logs::record(&Event::new(
            "user",
            crate::app::events::EventType::UserMessage,
            &prompt,
        ));
        let api_key = env::var("OPEN_AI_KEY")?;
        let request = self.build_request(&prompt);
        let response = self
            .client
            .post(&self.endpoint)
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
        crate::logs::record(&Event::new(
            "model",
            crate::app::events::EventType::LlmMessage,
            &result,
        ));
        Ok(LLMResponse::from(result))
    }

    fn set_system_prompt(&mut self, prompt: String) {
        self.system_prompt = prompt;
    }

    fn set_json_mode(&mut self, enabled: bool) {
        self.json_mode = enabled;
    }
}
