use std::{
    collections::HashMap,
    env,
    sync::{Arc, Mutex},
};

use async_trait::async_trait;
use reqwest::Client;
use serde_json::{json, Value};

use crate::{
    app::AppContext,
    constants::GEMINI_BASE_URL,
    error::{MetisError, Result},
    llm_client::{
        llm_client::{LLMChatClient, LLMResponse},
        tool::Tool,
    },
    logs::{Event, EventHistory, EventType},
};

pub struct GeminiChat {
    base_url: String,
    client: Client,
    system_prompt: String,
    model_name: String,
    tools_map: HashMap<String, Box<dyn Tool>>,
    tool_description: Vec<Value>,
    event_history: EventHistory,
    context: Arc<Mutex<AppContext>>,
    contents: Vec<Value>,
}

impl GeminiChat {
    pub fn new(context: Arc<Mutex<AppContext>>) -> Self {
        Self::with_model("gemini-3-flash-preview", context)
    }

    pub fn with_model(model: &str, context: Arc<Mutex<AppContext>>) -> Self {
        Self {
            base_url: GEMINI_BASE_URL.to_string(),
            client: Client::new(),
            system_prompt: String::new(),
            model_name: model.to_string(),
            tools_map: HashMap::new(),
            tool_description: Vec::new(),
            event_history: EventHistory::new(),
            context,
            contents: Vec::new(),
        }
    }

    fn build_request(&self) -> Value {
        json!({
            "systemInstruction": {
                "parts": [{"text": self.system_prompt}]
            },
            "contents": self.contents,
            "tools": [{
                "function_declarations": self.tool_description
            }]
        })
    }

    fn update_tool_description(&mut self) {
        let mut tool_description = Vec::new();
        for (_, tool) in self.tools_map.iter() {
            let params = tool.parameters();
            let mut tool_json = json!({
                "name": tool.name(),
                "description": tool.description(),
            });
            if !params.is_empty() {
                let mut properties = json!({});
                let mut required: Vec<String> = Vec::new();
                for param in params.iter() {
                    properties[&param.name] = json!({
                        "type": param.parameter_type,
                        "description": param.description,
                    });
                    required.push(param.name.clone());
                }
                tool_json["parameters"] = json!({
                    "type": "object",
                    "properties": properties,
                    "required": required,
                });
            }
            tool_description.push(tool_json);
        }
        self.tool_description = tool_description;
    }

    fn collect_function_calls(parts: &Value) -> Vec<(String, Value)> {
        let mut calls = Vec::new();
        if let Some(arr) = parts.as_array() {
            for part in arr {
                if let Some(fc) = part.get("functionCall") {
                    let name = fc.get("name").and_then(|n| n.as_str()).unwrap_or("").to_string();
                    let args = fc.get("args").cloned().unwrap_or(json!({}));
                    calls.push((name, args));
                }
            }
        }
        calls
    }

    fn extract_text(parts: &Value) -> Option<String> {
        if let Some(arr) = parts.as_array() {
            for part in arr {
                if part.get("thought").and_then(|t| t.as_bool()).unwrap_or(false) {
                    continue;
                }
                if let Some(text) = part.get("text").and_then(|t| t.as_str()) {
                    if !text.trim().is_empty() {
                        return Some(text.to_string());
                    }
                }
            }
        }
        None
    }

    fn parse_response(&self, response: Value) -> Result<Value> {
        let model_content = response
            .get("candidates")
            .and_then(|c| c.get(0))
            .ok_or(MetisError::JsonError("No candidates in response".to_string()))?
            .get("content")
            .ok_or(MetisError::JsonError("No content in response".to_string()))?
            .clone();
        Ok(model_content)
    }

    async fn call_api(&self) -> Result<Value> {
        let api_key = env::var("GEMINI_API_KEY")?;
        let url = format!(
            "{}/v1beta/models/{}:generateContent",
            self.base_url, self.model_name
        );
        let request = self.build_request();
        let response = self
            .client
            .post(&url)
            .header("x-goog-api-key", &api_key)
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
        self.parse_response(response)
    }

    fn execute_function_calls(
        &mut self,
        function_calls: &[(String, Value)],
    ) -> Result<Vec<Value>> {
        let mut response_parts: Vec<Value> = Vec::new();

        for (name, args) in function_calls {
            let fn_event = Event::new(name, EventType::FunctionCall, &args.to_string());
            self.event_history.events.push(fn_event);

            let tool = self
                .tools_map
                .get(name)
                .ok_or(MetisError::ToolError(format!("Unknown tool: {name}")))?;
            let result = tool.execute(args.clone(), Arc::clone(&self.context))?;

            let result_event =
                Event::new(name, EventType::FunctionResponse, &result.to_string());
            self.event_history.events.push(result_event);

            response_parts
                .push(json!({"functionResponse": {"name": name, "response": result}}));
        }

        Ok(response_parts)
    }

    async fn run(&mut self, event: Event) -> Result<LLMResponse> {
        self.event_history.events.push(event.clone());
        self.contents
            .push(json!({"role": "user", "parts": [{"text": event.content}]}));

        loop {
            let model_content = self.call_api().await?;
            let parts = model_content
                .get("parts")
                .ok_or(MetisError::JsonError("No parts in response".to_string()))?;

            let function_calls = Self::collect_function_calls(parts);

            if !function_calls.is_empty() {
                self.contents.push(model_content);
                let response_parts = self.execute_function_calls(&function_calls)?;
                self.contents
                    .push(json!({"role": "user", "parts": response_parts}));
                continue;
            }

            if let Some(text) = Self::extract_text(parts) {
                self.contents.push(model_content);
                let event = Event::new("model", EventType::LlmMessage, &text);
                self.event_history.events.push(event);
                return Ok(LLMResponse::from(text));
            }

            log::warn!(
                "[gemini_chat] No usable text in model response. Raw parts: {}",
                parts
            );
            self.contents.push(model_content);
            let event = Event::new("model", EventType::LlmMessage, "");
            self.event_history.events.push(event);
            return Ok(LLMResponse::from(""));
        }
    }
}

#[async_trait]
impl LLMChatClient for GeminiChat {
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
