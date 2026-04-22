use std::{collections::HashMap, env};

use async_trait::async_trait;
use reqwest::Client;
use serde_json::{Value, json};

use crate::{
    app::AppContext,
    constants::{BEDROCK_ANTHROPIC_VERSION, BEDROCK_BASE_URL},
    error::{MetisError, Result},
    llm_client::{
        llm_client::{LLMChatClient, LLMResponse},
        tool::Tool,
    },
    logs::{Event, EventHistory, EventType},
};

pub struct ClaudeChat<'a> {
    base_url: String,
    client: Client,
    system_prompt: String,
    model_name: String,
    tools_map: HashMap<String, Box<dyn Tool>>,
    tool_description: Vec<Value>,
    event_history: EventHistory,
    context: &'a AppContext,
    messages: Vec<Value>,
}

impl<'a> ClaudeChat<'a> {
    pub fn new(context: &'a AppContext) -> Self {
        Self::with_model("us.anthropic.claude-opus-4-6-v1", context)
    }

    pub fn with_model(model: &str, context: &'a AppContext) -> Self {
        Self {
            base_url: BEDROCK_BASE_URL.to_string(),
            client: Client::new(),
            system_prompt: String::new(),
            model_name: model.to_string(),
            tools_map: HashMap::new(),
            tool_description: Vec::new(),
            event_history: EventHistory::new(),
            context,
            messages: Vec::new(),
        }
    }

    fn build_request(&self) -> Value {
        let mut req = json!({
            "anthropic_version": BEDROCK_ANTHROPIC_VERSION,
            "max_tokens": 32000,
            "system": self.system_prompt,
            "messages": self.messages,
            "thinking": { "type": "adaptive" },
            "output_config": { "effort": "high" },
        });
        if !self.tool_description.is_empty() {
            req["tools"] = json!(self.tool_description);
        }
        req
    }

    fn update_tool_description(&mut self) {
        let mut tool_description = Vec::new();
        for (_, tool) in self.tools_map.iter() {
            let params = tool.parameters();
            let mut tool_json = json!({
                "name": tool.name(),
                "description": tool.description(),
            });
            let mut properties = json!({});
            let mut required: Vec<String> = Vec::new();
            for param in params.iter() {
                properties[&param.name] = json!({
                    "type": param.parameter_type,
                    "description": param.description,
                });
                required.push(param.name.clone());
            }
            tool_json["input_schema"] = json!({
                "type": "object",
                "properties": properties,
                "required": required,
            });
            tool_description.push(tool_json);
        }
        self.tool_description = tool_description;
    }

    fn collect_tool_uses(content: &Value) -> Vec<(String, String, Value)> {
        let mut calls = Vec::new();
        if let Some(arr) = content.as_array() {
            for block in arr {
                if block.get("type").and_then(|t| t.as_str()) == Some("tool_use") {
                    let id = block
                        .get("id")
                        .and_then(|i| i.as_str())
                        .unwrap_or("")
                        .to_string();
                    let name = block
                        .get("name")
                        .and_then(|n| n.as_str())
                        .unwrap_or("")
                        .to_string();
                    let input = block.get("input").cloned().unwrap_or(json!({}));
                    calls.push((id, name, input));
                }
            }
        }
        calls
    }

    fn extract_text(content: &Value) -> Option<String> {
        if let Some(arr) = content.as_array() {
            for block in arr {
                if block.get("type").and_then(|t| t.as_str()) == Some("text") {
                    if let Some(text) = block.get("text").and_then(|t| t.as_str()) {
                        if !text.trim().is_empty() {
                            return Some(text.to_string());
                        }
                    }
                }
            }
        }
        None
    }

    async fn call_api(&self) -> Result<Value> {
        let api_key = env::var("BEDROCK_API_KEY")?;
        let url = format!("{}/model/{}/invoke", self.base_url, self.model_name);
        let request = self.build_request();
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
        Ok(response)
    }

    async fn execute_tool_uses(
        &mut self,
        tool_uses: &[(String, String, Value)],
    ) -> Result<Vec<Value>> {
        let mut result_blocks: Vec<Value> = Vec::new();

        for (id, name, input) in tool_uses {
            let fn_event = Event::new(name, EventType::FunctionCall, &input.to_string());
            self.event_history.events.push(fn_event);

            let tool = self
                .tools_map
                .get(name)
                .ok_or(MetisError::ToolError(format!("Unknown tool: {name}")))?;
            let result = tool.execute(input.clone(), &self.context).await?;

            let result_event =
                Event::new(name, EventType::FunctionResponse, &result.to_string());
            self.event_history.events.push(result_event);

            result_blocks.push(json!({
                "type": "tool_result",
                "tool_use_id": id,
                "content": result.to_string(),
            }));
        }

        Ok(result_blocks)
    }

    async fn run(&mut self, event: Event) -> Result<LLMResponse> {
        self.event_history.events.push(event.clone());
        self.messages
            .push(json!({"role": "user", "content": event.content}));

        loop {
            let response = self.call_api().await?;
            let content = response
                .get("content")
                .ok_or(MetisError::JsonError("No content in response".to_string()))?
                .clone();
            let stop_reason = response
                .get("stop_reason")
                .and_then(|s| s.as_str())
                .unwrap_or("");

            if stop_reason == "tool_use" {
                let tool_uses = Self::collect_tool_uses(&content);
                self.messages
                    .push(json!({"role": "assistant", "content": content}));
                let result_blocks = self.execute_tool_uses(&tool_uses).await?;
                self.messages
                    .push(json!({"role": "user", "content": result_blocks}));
                continue;
            }

            if let Some(text) = Self::extract_text(&content) {
                self.messages
                    .push(json!({"role": "assistant", "content": content}));
                let event = Event::new("model", EventType::LlmMessage, &text);
                self.event_history.events.push(event);
                return Ok(LLMResponse::from(text));
            }

            log::warn!(
                "[claude_chat] No usable text in model response. Raw content: {}",
                content
            );
            self.messages
                .push(json!({"role": "assistant", "content": content}));
            let event = Event::new("model", EventType::LlmMessage, "");
            self.event_history.events.push(event);
            return Ok(LLMResponse::from(""));
        }
    }
}

#[async_trait]
impl<'a> LLMChatClient for ClaudeChat<'a> {
    async fn generate(&mut self, message: String) -> Result<LLMResponse> {
        self.run(Event::new("user", EventType::UserMessage, &message))
            .await
    }

    fn add_tool(&mut self, tool: Box<dyn Tool>) {
        self.tools_map.insert(tool.name().to_string(), tool);
        self.update_tool_description();
    }

    fn set_system_prompt(&mut self, prompt: String) {
        self.system_prompt = prompt;
    }

    fn get_event_history(&self) -> EventHistory {
        self.event_history.clone()
    }
}
