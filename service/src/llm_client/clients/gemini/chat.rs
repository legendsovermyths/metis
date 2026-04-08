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
    tools_map: HashMap<String, Box<dyn Tool + Send>>,
    tool_description: Vec<Value>,
    event_history: EventHistory,
    context: Arc<Mutex<AppContext>>,
}

impl<'a> GeminiChat {
    pub fn new(context: Arc<Mutex<AppContext>>) -> Self {
        Self {
            base_url: GEMINI_BASE_URL.to_string(),
            client: Client::new(),
            system_prompt: String::new(),
            model_name: "gemini-2.5-pro".to_string(),
            tools_map: HashMap::new(),
            tool_description: Vec::new(),
            event_history: EventHistory::new(),
            context,
        }
    }
    fn content(&self) -> Vec<Value> {
        let mut content = Vec::new();
        for event in self.event_history.events.iter() {
            match event.event_type {
                EventType::UserMessage => {
                    content.push(json!({"role": "user", "parts": [{"text": event.content}]}));
                }
                EventType::LlmMessage => {
                    content.push(json!({"role": "model", "parts": [{"text": event.content}]}));
                }
                EventType::FunctionResponse => {
                    let response: Value = serde_json::from_str(&event.content).unwrap_or(json!({}));
                    content.push(json!({"role": "user", "parts": [{"functionResponse": {"name": event.name, "response": response}}]}));
                }
                EventType::FunctionCall => {
                    let args: Value = serde_json::from_str(&event.content).unwrap_or(json!({}));
                    content.push(json!({"role": "model", "parts": [{"functionCall": {"name": event.name, "args": args}}]}));
                }
                _ => (),
            }
        }
        content
    }

    fn build_request(&self) -> Value {
        let request_body = json!({
            "systemInstruction": {
                "parts": [{"text": self.system_prompt}]
            },
            "contents": self.content(),
            "tools": [
        {
            "function_declarations": self.tool_description
        }
        ]
        });
        request_body
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

    async fn run(&mut self, event: Event) -> Result<LLMResponse> {
        self.event_history.events.push(event);

        loop {
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

            let parts = response
                .get("candidates")
                .and_then(|c| c.get(0))
                .ok_or(MetisError::JsonError("No key named candidates".to_string()))?
                .get("content")
                .ok_or(MetisError::JsonError("No key named content".to_string()))?
                .get("parts")
                .and_then(|p| p.get(0))
                .ok_or(MetisError::JsonError("No key named parts".to_string()))?;

            if let Some(val) = parts.get("functionCall") {
                let name = val
                    .get("name")
                    .and_then(|n| n.as_str())
                    .ok_or(MetisError::JsonError("No key named name".to_string()))?
                    .to_string();
                let args = val
                    .get("args")
                    .ok_or(MetisError::JsonError("No key named args".to_string()))?;

                let fn_call_event = Event::new(&name, EventType::FunctionCall, &args.to_string());
                self.event_history.events.push(fn_call_event);

                let tool = self
                    .tools_map
                    .get(&name)
                    .ok_or(MetisError::ToolError(format!("Unknown tool: {name}")))?;
                let result = tool.execute(args.clone(), Arc::clone(&self.context))?;

                let result_event =
                    Event::new(&name, EventType::FunctionResponse, &result.to_string());
                self.event_history.events.push(result_event);

                continue;
            }

            let text = parts
                .get("text")
                .and_then(|t| t.as_str())
                .ok_or(MetisError::JsonError("No key named text".to_string()))?;

            let event = Event::new("model", EventType::LlmMessage, text);
            self.event_history.events.push(event);

            return Ok(LLMResponse::from(text.to_string()));
        }
    }
}

#[async_trait]
impl LLMChatClient for GeminiChat {
    async fn generate(&mut self, message: String) -> Result<LLMResponse> {
        let response = self.run(Event::new("user", EventType::UserMessage, &message));
        response.await
    }

    fn add_tool(&mut self, tool: Box<dyn Tool>) {
        self.tools_map.insert(tool.name().to_string(), tool);
        self.update_tool_description();
    }

    fn set_system_prompt(&mut self, prompt: String) {
        self.system_prompt = prompt;
    }
    fn get_event_history(&mut self) -> EventHistory {
        self.event_history.clone()
    }
}
