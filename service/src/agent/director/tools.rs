use async_trait::async_trait;
use serde_json::{json, Value};

use crate::{
    app::{AppContext, PendingAction},
    bridges::user_input::UserInputBridge,
    db::repo::resources::ResourcesRepo,
    error::{MetisError, Result},
    llm_client::tool::{Parameter, Parameters, Tool},
};

pub struct IngestResourceTool;
pub struct GetAllResourcesTool;
pub struct GetResourceContentTool;
pub struct CreateJourneyTool;
pub struct CreateExplainerTool;

#[async_trait]
impl Tool for IngestResourceTool {
    fn name(&self) -> &str {
        "ingest_resource"
    }

    fn description(&self) -> &str {
        "Requests the user to upload a resource which they want to be explained, or taught, returns a resource id, that you can use to verify what they uploaded"
    }

    fn parameters(&self) -> Parameters {
        vec![
            Parameter {
                name: "prompt".to_string(),
                parameter_type: "string".to_string(),
                description:
                    "A short, friendly line telling the user what to share (e.g. \"Share the problem and the solution you'd like explained\")."
                        .to_string(),
            },
            Parameter {
                name: "notes".to_string(),
                parameter_type: "string".to_string(),
                description:
                    "Anything to remember about this resource: what the user said about it, why they shared it, or how you want to identify it later. Stored alongside the resource."
                        .to_string(),
            },
        ]
    }

    async fn execute(&self, params: Value, _context: &AppContext) -> Result<Value> {
        let prompt = params
            .get("prompt")
            .and_then(|v| v.as_str())
            .unwrap_or("Share the material you'd like Metis to work from.");

        let notes = params.get("notes").and_then(|v| v.as_str()).unwrap_or("");

        let resource = UserInputBridge::request(json!({
            "kind": "resource",
            "title": "Add your material",
            "prompt": prompt,
            "notes": notes
        }))
        .await?;

        Ok(serde_json::to_value(resource)?)
    }
}

#[async_trait]
impl Tool for GetAllResourcesTool {
    fn name(&self) -> &str {
        "get_all_resources"
    }

    fn description(&self) -> &str {
        "List every resource the user has uploaded, with its id and notes but without the content. Use get_resource_content to read a specific resource's content."
    }

    fn parameters(&self) -> Parameters {
        vec![]
    }

    async fn execute(&self, _params: Value, _context: &AppContext) -> Result<Value> {
        let resources = ResourcesRepo::get_all()?;
        Ok(json!({ "resources": serde_json::to_value(resources)? }))
    }
}

#[async_trait]
impl Tool for GetResourceContentTool {
    fn name(&self) -> &str {
        "get_resource_content"
    }

    fn description(&self) -> &str {
        "Read the full content of a single resource by its id."
    }

    fn parameters(&self) -> Parameters {
        vec![Parameter {
            name: "resource_id".to_string(),
            parameter_type: "integer".to_string(),
            description: "The id of the resource whose content you want to read.".to_string(),
        }]
    }

    async fn execute(&self, params: Value, _context: &AppContext) -> Result<Value> {
        let id = params
            .get("resource_id")
            .and_then(|v| v.as_i64())
            .ok_or_else(|| MetisError::ToolError("missing required parameter: resource_id".into()))?;

        let resource = ResourcesRepo::get(id)?;
        Ok(json!({ "resource_id": id, "content": resource.content }))
    }
}

#[async_trait]
impl Tool for CreateJourneyTool {
    fn name(&self) -> &str {
        "create_journey"
    }

    fn description(&self) -> &str {
        "Create a learning journey from a single resource by its id."
    }

    fn parameters(&self) -> Parameters {
        vec![Parameter {
            name: "resource_id".to_string(),
            parameter_type: "integer".to_string(),
            description: "The id of the resource to build the journey from.".to_string(),
        }]
    }

    async fn execute(&self, params: Value, _context: &AppContext) -> Result<Value> {
        let id = params
            .get("resource_id")
            .and_then(|v| v.as_i64())
            .ok_or_else(|| MetisError::ToolError("missing required parameter: resource_id".into()))?;

        log::info!("create_journey called for resource_id={}", id);
        Ok(json!({ "success": true, "resource_id": id }))
    }
}

#[async_trait]
impl Tool for CreateExplainerTool {
    fn name(&self) -> &str {
        "create_explainer"
    }

    fn description(&self) -> &str {
        "Create an explainer from a problem resource and its solution resource, by their ids."
    }

    fn parameters(&self) -> Parameters {
        vec![
            Parameter {
                name: "problem_resource_id".to_string(),
                parameter_type: "integer".to_string(),
                description: "The id of the resource containing the problem.".to_string(),
            },
            Parameter {
                name: "solution_resource_id".to_string(),
                parameter_type: "integer".to_string(),
                description: "The id of the resource containing the solution.".to_string(),
            },
        ]
    }

    async fn execute(&self, params: Value, context: &AppContext) -> Result<Value> {
        let problem_id = params
            .get("problem_resource_id")
            .and_then(|v| v.as_i64())
            .ok_or_else(|| {
                MetisError::ToolError("missing required parameter: problem_resource_id".into())
            })?;
        let solution_id = params
            .get("solution_resource_id")
            .and_then(|v| v.as_i64())
            .ok_or_else(|| {
                MetisError::ToolError("missing required parameter: solution_resource_id".into())
            })?;
        let mut chat = context.chat.lock().await;
        chat.is_done = true;
        chat.pending_action = Some(PendingAction::Explainer {
            problem_resource_id: problem_id,
            solution_resource_id: solution_id,
        });

        log::info!(
            "create_explainer called for problem_resource_id={} solution_resource_id={}",
            problem_id,
            solution_id
        );
        Ok(json!({ "success": true, "problem_resource_id": problem_id, "solution_resource_id": solution_id }))
    }
}
