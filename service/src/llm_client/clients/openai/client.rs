use async_trait::async_trait;
use reqwest::Client;
use serde_json::{Value, json};

use super::{ReasoningEffort, output_items, output_text, post_responses};
use crate::{
    app::events::{Event, EventType},
    error::{MetisError, Result},
    llm_client::llm_client::{LLMClient, LLMResponse},
};

const JSON_SUFFIX: &str = "Respond with a single valid JSON value. No prose, no markdown fences.";

pub struct OpenAiClient {
    client: Client,
    system_prompt: String,
    model_name: String,
    effort: ReasoningEffort,
    json_mode: bool,
}

impl OpenAiClient {
    pub fn with_model(model: &str, effort: ReasoningEffort) -> Self {
        Self {
            client: Client::new(),
            system_prompt: String::new(),
            model_name: model.to_string(),
            effort,
            json_mode: false,
        }
    }

    fn build_request(&self, prompt: &str) -> Value {
        let mut input = Vec::new();
        // `json_object` mode is rejected unless the word "json" appears in `input`
        // (`instructions` does not count), so the system prompt travels as a message.
        if self.json_mode {
            let system = if self.system_prompt.is_empty() {
                JSON_SUFFIX.to_string()
            } else {
                format!("{}\n\n{JSON_SUFFIX}", self.system_prompt)
            };
            input.push(json!({"role": "system", "content": system}));
        }
        input.push(json!({"role": "user", "content": prompt}));

        let mut req = json!({
            "model": self.model_name,
            "input": input,
            "max_output_tokens": 64000,
            "reasoning": {"effort": self.effort.as_str()},
        });
        if self.json_mode {
            req["text"] = json!({"format": {"type": "json_object"}});
        } else if !self.system_prompt.is_empty() {
            req["instructions"] = json!(self.system_prompt);
        }
        req
    }
}

#[async_trait]
impl LLMClient for OpenAiClient {
    async fn generate(&self, prompt: String) -> Result<LLMResponse> {
        crate::logs::record(&Event::new("user", EventType::UserMessage, &prompt));
        let response = post_responses(&self.client, &self.build_request(&prompt)).await?;
        let result = output_text(&output_items(&response)?).ok_or(MetisError::JsonError(
            "No message text in response output".to_string(),
        ))?;
        crate::logs::record(&Event::new("model", EventType::LlmMessage, &result));
        Ok(LLMResponse::from(result))
    }

    fn set_system_prompt(&mut self, prompt: String) {
        self.system_prompt = prompt;
    }

    fn set_json_mode(&mut self, enabled: bool) {
        self.json_mode = enabled;
    }
}
