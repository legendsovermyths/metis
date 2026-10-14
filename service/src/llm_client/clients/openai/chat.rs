use std::{collections::HashMap, env};

use async_trait::async_trait;
use reqwest::Client;
use serde_json::{Value, json};

use crate::{
    app::AppContext,
    constants::OPEN_AI_ENDPOINT,
    error::{MetisError, Result},
    llm_client::{
        llm_client::{LLMChatClient, LLMResponse},
        tool::Tool,
    },
    app::events::{Event, EventHistory, EventType},
};

pub struct OpenAiChat<'a> {
    endpoint: String,
    client: Client,
    system_prompt: String,
    model_name: String,
    tools_map: HashMap<String, Box<dyn Tool>>,
    tool_description: Vec<Value>,
    event_history: EventHistory,
    context: &'a AppContext,
    messages: Vec<Value>,
}

impl<'a> OpenAiChat<'a> {
    pub fn new(context: &'a AppContext) -> Self {
        Self::with_model("gpt-5.6-terra", context)
    }

    pub fn with_model(model: &str, context: &'a AppContext) -> Self {
        Self {
            endpoint: OPEN_AI_ENDPOINT.to_string(),
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
            "model": self.model_name,
            "input": self.messages,
            "max_output_tokens": 32000,
        });
        if !self.system_prompt.is_empty() {
            req["instructions"] = json!(self.system_prompt);
        }
        if !self.tool_description.is_empty() {
            req["tools"] = json!(self.tool_description);
        }
        req
    }

    fn update_tool_description(&mut self) {
        let mut tool_description = Vec::new();
        for (_, tool) in self.tools_map.iter() {
            let params = tool.parameters();
            let mut properties = json!({});
            let mut required: Vec<String> = Vec::new();
            for param in params.iter() {
                properties[&param.name] = json!({
                    "type": param.parameter_type,
                    "description": param.description,
                });
                required.push(param.name.clone());
            }
            tool_description.push(json!({
                "type": "function",
                "name": tool.name(),
                "description": tool.description(),
                "parameters": {
                    "type": "object",
                    "properties": properties,
                    "required": required,
                },
            }));
        }
        self.tool_description = tool_description;
    }

    fn collect_tool_uses(output: &[Value]) -> Vec<(String, String, Value)> {
        let mut calls = Vec::new();
        for item in output {
            if item.get("type").and_then(|t| t.as_str()) == Some("function_call") {
                let call_id = item
                    .get("call_id")
                    .and_then(|i| i.as_str())
                    .unwrap_or("")
                    .to_string();
                let name = item
                    .get("name")
                    .and_then(|n| n.as_str())
                    .unwrap_or("")
                    .to_string();
                let args_str = item
                    .get("arguments")
                    .and_then(|a| a.as_str())
                    .unwrap_or("{}");
                let input: Value = serde_json::from_str(args_str).unwrap_or(json!({}));
                calls.push((call_id, name, input));
            }
        }
        calls
    }

    fn extract_text(output: &[Value]) -> Option<String> {
        for item in output {
            if item.get("type").and_then(|t| t.as_str()) == Some("message") {
                if let Some(content) = item.get("content").and_then(|c| c.as_array()) {
                    for block in content {
                        if let Some(text) = block.get("text").and_then(|t| t.as_str()) {
                            if !text.trim().is_empty() {
                                return Some(text.to_string());
                            }
                        }
                    }
                }
            }
        }
        None
    }

    async fn call_api(&self) -> Result<Vec<Value>> {
        let api_key = env::var("OPEN_AI_KEY")?;
        let request = self.build_request();
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
        response
            .get("output")
            .and_then(|o| o.as_array())
            .cloned()
            .ok_or(MetisError::JsonError("No output in response".to_string()))
    }

    async fn execute_tool_uses(
        &mut self,
        tool_uses: &[(String, String, Value)],
    ) -> Result<Vec<Value>> {
        let mut result_items: Vec<Value> = Vec::new();

        for (call_id, name, input) in tool_uses {
            let fn_event = Event::new(name, EventType::FunctionCall, &input.to_string());
            crate::logs::record(&fn_event);
            self.event_history.events.push(fn_event);

            let tool = self
                .tools_map
                .get(name)
                .ok_or(MetisError::ToolError(format!("Unknown tool: {name}")))?;
            let result = tool.execute(input.clone(), &self.context).await?;

            let result_event =
                Event::new(name, EventType::FunctionResponse, &result.to_string());
            crate::logs::record(&result_event);
            self.event_history.events.push(result_event);

            result_items.push(json!({
                "type": "function_call_output",
                "call_id": call_id,
                "output": result.to_string(),
            }));
        }

        Ok(result_items)
    }

    async fn run(&mut self, event: Event) -> Result<LLMResponse> {
        crate::logs::record(&event);
        self.event_history.events.push(event.clone());
        self.messages
            .push(json!({"role": "user", "content": event.content}));

        loop {
            let output = self.call_api().await?;
            let tool_uses = Self::collect_tool_uses(&output);

            if !tool_uses.is_empty() {
                if let Some(text) = Self::extract_text(&output) {
                    let event = Event::new("model", EventType::LlmMessage, &text);
                    crate::logs::record(&event);
                    self.event_history.events.push(event);
                }
                for item in &output {
                    if item.get("type").and_then(|t| t.as_str()) == Some("function_call") {
                        self.messages.push(item.clone());
                    }
                }
                let result_items = self.execute_tool_uses(&tool_uses).await?;
                self.messages.extend(result_items);
                continue;
            }

            if let Some(text) = Self::extract_text(&output) {
                self.messages
                    .push(json!({"role": "assistant", "content": text}));
                let event = Event::new("model", EventType::LlmMessage, &text);
                crate::logs::record(&event);
                self.event_history.events.push(event);
                return Ok(LLMResponse::from(text));
            }

            crate::warn!(
                "[openai_chat] No usable text in model response. output={}",
                json!(output),
            );
            return Err(MetisError::AgentError(
                "OpenAI returned no text".to_string(),
            ));
        }
    }

    fn rebuild_messages_from_history(&mut self) {
        let mut messages: Vec<Value> = Vec::new();
        let mut synthetic_id: u64 = 0;
        let mut pending_call_id: Option<String> = None;
        for event in &self.event_history.events {
            match event.event_type {
                EventType::UserMessage | EventType::UserRequest => {
                    messages.push(json!({"role": "user", "content": event.content}));
                }
                EventType::LlmMessage => {
                    if event.content.is_empty() {
                        continue;
                    }
                    messages.push(json!({
                        "role": "assistant",
                        "content": event.content,
                    }));
                }
                EventType::FunctionCall => {
                    synthetic_id += 1;
                    let id = format!("call_{}", synthetic_id);
                    let input: Value =
                        serde_json::from_str(&event.content).unwrap_or(json!({}));
                    messages.push(json!({
                        "type": "function_call",
                        "call_id": id,
                        "name": event.name,
                        "arguments": input.to_string(),
                    }));
                    pending_call_id = Some(id);
                }
                EventType::FunctionResponse => {
                    let id = pending_call_id.take().unwrap_or_else(|| {
                        synthetic_id += 1;
                        format!("call_{}", synthetic_id)
                    });
                    messages.push(json!({
                        "type": "function_call_output",
                        "call_id": id,
                        "output": event.content,
                    }));
                }
            }
        }
        self.messages = messages;
    }
}

#[async_trait]
impl<'a> LLMChatClient for OpenAiChat<'a> {
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

    fn set_event_history(&mut self, history: EventHistory) {
        self.event_history = history;
        self.rebuild_messages_from_history();
    }
}
