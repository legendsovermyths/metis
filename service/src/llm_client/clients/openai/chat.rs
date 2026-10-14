use std::collections::HashMap;

use async_trait::async_trait;
use reqwest::Client;
use serde_json::{Value, json};

use super::{ReasoningEffort, output_items, output_text, post_responses};
use crate::{
    app::{
        AppContext,
        events::{Event, EventHistory, EventType},
    },
    error::{MetisError, Result},
    llm_client::{
        llm_client::{LLMChatClient, LLMResponse},
        tool::Tool,
    },
};

pub struct OpenAiChat<'a> {
    client: Client,
    system_prompt: String,
    model_name: String,
    effort: ReasoningEffort,
    tools_map: HashMap<String, Box<dyn Tool>>,
    tool_description: Vec<Value>,
    event_history: EventHistory,
    context: &'a AppContext,
    messages: Vec<Value>,
}

impl<'a> OpenAiChat<'a> {
    pub fn with_model(model: &str, effort: ReasoningEffort, context: &'a AppContext) -> Self {
        Self {
            client: Client::new(),
            system_prompt: String::new(),
            model_name: model.to_string(),
            effort,
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
            "max_output_tokens": 64000,
            "reasoning": {"effort": self.effort.as_str()},
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
        self.tool_description = self
            .tools_map
            .values()
            .map(|tool| {
                let mut properties = json!({});
                let mut required: Vec<String> = Vec::new();
                for param in tool.parameters().iter() {
                    properties[&param.name] = json!({
                        "type": param.parameter_type,
                        "description": param.description,
                    });
                    required.push(param.name.clone());
                }
                json!({
                    "type": "function",
                    "name": tool.name(),
                    "description": tool.description(),
                    "parameters": {
                        "type": "object",
                        "properties": properties,
                        "required": required,
                    },
                })
            })
            .collect();
    }

    fn collect_function_calls(output: &[Value]) -> Vec<(String, String, Value)> {
        output
            .iter()
            .filter(|item| item.get("type").and_then(|t| t.as_str()) == Some("function_call"))
            .map(|item| {
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
                let args = item
                    .get("arguments")
                    .and_then(|a| a.as_str())
                    .and_then(|a| serde_json::from_str(a).ok())
                    .unwrap_or(json!({}));
                (call_id, name, args)
            })
            .collect()
    }

    async fn execute_function_calls(&mut self, calls: &[(String, String, Value)]) -> Result<()> {
        for (call_id, name, args) in calls {
            let fn_event = Event::new(name, EventType::FunctionCall, &args.to_string());
            crate::logs::record(&fn_event);
            self.event_history.events.push(fn_event);

            let tool = self
                .tools_map
                .get(name)
                .ok_or(MetisError::ToolError(format!("Unknown tool: {name}")))?;
            let result = tool.execute(args.clone(), &self.context).await?;

            let result_event = Event::new(name, EventType::FunctionResponse, &result.to_string());
            crate::logs::record(&result_event);
            self.event_history.events.push(result_event);

            self.messages.push(json!({
                "type": "function_call_output",
                "call_id": call_id,
                "output": result.to_string(),
            }));
        }
        Ok(())
    }

    async fn run(&mut self, event: Event) -> Result<LLMResponse> {
        crate::logs::record(&event);
        self.event_history.events.push(event.clone());
        self.messages
            .push(json!({"role": "user", "content": event.content}));

        let mut last_text: Option<String> = None;

        loop {
            let response = post_responses(&self.client, &self.build_request()).await?;
            let output = output_items(&response)?;
            let calls = Self::collect_function_calls(&output);
            let text = output_text(&output);

            // Reasoning models reject a function_call without its preceding reasoning
            // item, so every output item is replayed verbatim.
            self.messages.extend(output.iter().cloned());

            if let Some(text) = &text {
                let event = Event::new("model", EventType::LlmMessage, text);
                crate::logs::record(&event);
                self.event_history.events.push(event);
                last_text = Some(text.clone());
            }

            if !calls.is_empty() {
                self.execute_function_calls(&calls).await?;
                continue;
            }

            if let Some(text) = last_text {
                return Ok(LLMResponse::from(text));
            }

            crate::warn!(
                "[openai_chat] No usable text in model response. status={} usage={} output={}",
                response.get("status").cloned().unwrap_or(json!(null)),
                response.get("usage").cloned().unwrap_or(json!(null)),
                json!(output),
            );
            return Err(MetisError::AgentError(format!(
                "{} returned no text",
                self.model_name
            )));
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
                    messages.push(json!({"role": "assistant", "content": event.content}));
                }
                EventType::FunctionCall => {
                    synthetic_id += 1;
                    let id = format!("call_{synthetic_id}");
                    messages.push(json!({
                        "type": "function_call",
                        "call_id": id,
                        "name": event.name,
                        "arguments": event.content,
                    }));
                    pending_call_id = Some(id);
                }
                EventType::FunctionResponse => {
                    let id = pending_call_id.take().unwrap_or_else(|| {
                        synthetic_id += 1;
                        format!("call_{synthetic_id}")
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
