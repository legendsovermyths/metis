pub mod chat;
pub mod client;

use std::{env, time::Duration};

use reqwest::Client;
use serde_json::Value;

use crate::{
    constants::OPEN_AI_ENDPOINT,
    error::{MetisError, Result},
};

const MAX_ATTEMPTS: u64 = 3;

/// Reasoning effort accepted by the Responses API for reasoning models such as Sol.
#[derive(Clone, Copy, Debug)]
pub enum ReasoningEffort {
    None,
    Low,
    Medium,
    High,
    XHigh,
    Max,
}

impl ReasoningEffort {
    pub fn as_str(&self) -> &'static str {
        match self {
            ReasoningEffort::None => "none",
            ReasoningEffort::Low => "low",
            ReasoningEffort::Medium => "medium",
            ReasoningEffort::High => "high",
            ReasoningEffort::XHigh => "xhigh",
            ReasoningEffort::Max => "max",
        }
    }
}

/// POSTs to the Responses endpoint, retrying transport errors, 429s and 5xxs with backoff.
async fn post_responses(client: &Client, body: &Value) -> Result<Value> {
    let api_key = env::var("OPEN_AI_KEY")?;
    let mut last_err = String::new();
    for attempt in 0..MAX_ATTEMPTS {
        if attempt > 0 {
            tokio::time::sleep(Duration::from_secs(5 * attempt)).await;
        }
        let response = match client
            .post(OPEN_AI_ENDPOINT)
            .bearer_auth(&api_key)
            .json(body)
            .send()
            .await
        {
            Ok(r) => r,
            Err(e) => {
                last_err = e.to_string();
                crate::warn!("[openai] attempt {attempt} transport error: {last_err}");
                continue;
            }
        };
        let status = response.status();
        if status.is_success() {
            return Ok(response.json().await?);
        }
        last_err = format!("{status}: {}", response.text().await.unwrap_or_default());
        crate::warn!("[openai] attempt {attempt} failed: {last_err}");
        if status.is_client_error() && status.as_u16() != 429 {
            break;
        }
    }
    Err(MetisError::HttpError(last_err))
}

fn output_items(response: &Value) -> Result<Vec<Value>> {
    response
        .get("output")
        .and_then(|o| o.as_array())
        .cloned()
        .ok_or(MetisError::JsonError("No output array in response".to_string()))
}

fn output_text(output: &[Value]) -> Option<String> {
    output
        .iter()
        .filter(|item| item.get("type").and_then(|t| t.as_str()) == Some("message"))
        .flat_map(|item| item.get("content").and_then(|c| c.as_array()).into_iter().flatten())
        .filter_map(|block| block.get("text").and_then(|t| t.as_str()))
        .find(|text| !text.trim().is_empty())
        .map(str::to_string)
}
