use async_trait::async_trait;
use serde_json::{json, Value};

use crate::{
    agent::AgentResponseInstruction,
    app::{
        resource::resource::{Resource, ResourceType},
        AppContext, PendingAction,
    },
    bridges::user_input::UserInputBridge,
    db::repo::{appdata::AppDataRepo, Repository},
    error::Result,
    llm_client::tool::{Parameter, Parameters, Tool},
};

pub struct GetStudentProfileTool;
pub struct IngestResourceTool;
pub struct GetAllResourcesTool;
pub struct GetResourceContentTool;
pub struct GetResourceStructureTool;
pub struct GetAvailableBooksTool;
pub struct SetNotesTool;
pub struct GetNotesTool;
pub struct SetDoneTool;
pub struct CreateJourneyTool;
pub struct CreateExplainerTool;

#[async_trait]
impl Tool for GetStudentProfileTool {
    fn name(&self) -> &str {
        "get_student_profile"
    }

    fn description(&self) -> &str {
        "Read the student's personal profile written during onboarding. Call this before your first message to learn who the student is."
    }

    fn parameters(&self) -> Parameters {
        vec![]
    }

    async fn execute(&self, _params: Value, _context: &AppContext) -> Result<Value> {
        match AppDataRepo::get("user_profile")? {
            Some(profile) => Ok(json!({ "profile": profile })),
            None => Ok(json!({ "profile": "No student profile available yet." })),
        }
    }
}

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
        "List every resource the user has uploaded — id, title, description, type, and notes, but without the full content. Use get_resource_structure to see a book's chapters or a document's sections, and get_resource_content to read a resource's content."
    }

    fn parameters(&self) -> Parameters {
        vec![]
    }

    async fn execute(&self, _params: Value, _context: &AppContext) -> Result<Value> {
        let resources: Vec<Value> = Repository::<Resource>::all()?
            .iter()
            .map(|p| {
                let r = p.read();
                json!({
                    "id": r.id,
                    "title": r.title,
                    "description": r.description,
                    "type": resource_type_name(&r.resource_type),
                    "agent_notes": r.agent_notes,
                    "created_at": r.created_at,
                })
            })
            .collect();
        Ok(json!({ "resources": resources }))
    }
}

#[async_trait]
impl Tool for GetResourceContentTool {
    fn name(&self) -> &str {
        "get_resource_content"
    }

    fn description(&self) -> &str {
        "Read the full content of a single resource by its id. For a textbook, use get_resource_structure instead — its content is only extractable per chapter."
    }

    fn parameters(&self) -> Parameters {
        vec![Parameter {
            name: "resource_id".to_string(),
            parameter_type: "integer".to_string(),
            description: "The id of the resource whose content you want to read.".to_string(),
        }]
    }

    async fn execute(&self, params: Value, _context: &AppContext) -> Result<Value> {
        let id = match params.get("resource_id").and_then(|v| v.as_i64()) {
            Some(id) => id,
            None => return Ok(json!({ "error": "missing required parameter: resource_id" })),
        };

        let resource = match Repository::<Resource>::try_find_by_id(&id)? {
            Some(resource) => resource.read().clone(),
            None => return Ok(json!({ "error": format!("No resource found with id {}", id) })),
        };
        if let ResourceType::TextBook(_) = resource.resource_type {
            return Ok(json!({
                "resource_id": id,
                "error": "This is a textbook — call get_resource_structure to see its chapters, then create_journey with a chapter_title."
            }));
        }
        match resource.get_content(&AgentResponseInstruction::None).await {
            Ok(content) => Ok(json!({ "resource_id": id, "content": content })),
            Err(e) => Ok(json!({ "resource_id": id, "error": e.to_string() })),
        }
    }
}

#[async_trait]
impl Tool for GetResourceStructureTool {
    fn name(&self) -> &str {
        "get_resource_structure"
    }

    fn description(&self) -> &str {
        "Fetch a resource's structure by id: a textbook's table of contents (chapters + topics), or a document's sections. Use this to see a book's chapters before recommending one."
    }

    fn parameters(&self) -> Parameters {
        vec![Parameter {
            name: "resource_id".to_string(),
            parameter_type: "integer".to_string(),
            description: "The id of the resource whose structure you want.".to_string(),
        }]
    }

    async fn execute(&self, params: Value, _context: &AppContext) -> Result<Value> {
        let id = match params.get("resource_id").and_then(|v| v.as_i64()) {
            Some(id) => id,
            None => return Ok(json!({ "error": "missing required parameter: resource_id" })),
        };

        let resource = match Repository::<Resource>::try_find_by_id(&id)? {
            Some(resource) => resource,
            None => return Ok(json!({ "error": format!("No resource found with id {}", id) })),
        };
        let r = resource.read();
        let structure = match &r.resource_type {
            ResourceType::TextBook(book) => json!({ "table_of_content": book.table_of_content }),
            ResourceType::Document(document) => json!({
                "document_type": document.document_type,
                "table_of_content": document.table_of_content,
            }),
            ResourceType::Question | ResourceType::Solution => {
                json!({ "note": "This resource has no chapter/section structure." })
            }
        };
        Ok(json!({
            "id": r.id,
            "title": r.title,
            "description": r.description,
            "type": resource_type_name(&r.resource_type),
            "structure": structure,
        }))
    }
}

#[async_trait]
impl Tool for GetAvailableBooksTool {
    fn name(&self) -> &str {
        "get_available_books"
    }

    fn description(&self) -> &str {
        "List the textbooks the student has available, with their ids and titles."
    }

    fn parameters(&self) -> Parameters {
        vec![]
    }

    async fn execute(&self, _params: Value, _context: &AppContext) -> Result<Value> {
        let books: Vec<Value> = Repository::<Resource>::all()?
            .iter()
            .filter_map(|p| {
                let r = p.read();
                match r.resource_type {
                    ResourceType::TextBook(_) => Some(json!({ "id": r.id, "title": r.title })),
                    _ => None,
                }
            })
            .collect();

        if books.is_empty() {
            return Ok(json!({ "message": "No textbooks have been uploaded yet." }));
        }
        Ok(json!({ "books": books }))
    }
}

#[async_trait]
impl Tool for SetNotesTool {
    fn name(&self) -> &str {
        "set_notes"
    }

    fn description(&self) -> &str {
        "Overwrite your notes about the student with the full updated version. Must be the complete rewritten notes, not a diff or append. These notes travel with whatever you build so the tutor can personalize."
    }

    fn parameters(&self) -> Parameters {
        vec![Parameter {
            name: "notes".to_string(),
            parameter_type: "string".to_string(),
            description: "The full updated notes about the student and what they want.".to_string(),
        }]
    }

    async fn execute(&self, params: Value, context: &AppContext) -> Result<Value> {
        let notes = match params.get("notes").and_then(|v| v.as_str()) {
            Some(notes) => notes,
            None => return Ok(json!({ "error": "missing required parameter: notes" })),
        };
        context.chat.lock().await.notes = Some(notes.to_string());
        Ok(json!({ "status": "ok" }))
    }
}

#[async_trait]
impl Tool for GetNotesTool {
    fn name(&self) -> &str {
        "get_notes"
    }

    fn description(&self) -> &str {
        "Retrieve your current notes to remind yourself what you've learned about the student so far."
    }

    fn parameters(&self) -> Parameters {
        vec![]
    }

    async fn execute(&self, _params: Value, context: &AppContext) -> Result<Value> {
        let notes = context.chat.lock().await.notes.clone();
        match notes {
            Some(notes) => Ok(json!({ "notes": notes })),
            None => Ok(json!({ "notes": "No notes yet." })),
        }
    }
}

#[async_trait]
impl Tool for SetDoneTool {
    fn name(&self) -> &str {
        "set_done"
    }

    fn description(&self) -> &str {
        "Signal that the conversation is complete when you are not building anything (creating a journey or explanation already finishes the conversation on its own)."
    }

    fn parameters(&self) -> Parameters {
        vec![]
    }

    async fn execute(&self, _params: Value, context: &AppContext) -> Result<Value> {
        context.chat.lock().await.set_done();
        Ok(json!({ "status": "done" }))
    }
}

#[async_trait]
impl Tool for CreateJourneyTool {
    fn name(&self) -> &str {
        "create_journey"
    }

    fn description(&self) -> &str {
        "Build a learning journey (a guided course) from one resource. For a textbook, pass the chapter_title the student wants. For a paper, article, or other document, optionally pass instructions describing what to focus on."
    }

    fn parameters(&self) -> Parameters {
        vec![
            Parameter {
                name: "resource_id".to_string(),
                parameter_type: "integer".to_string(),
                description: "The id of the resource to build the journey from.".to_string(),
            },
            Parameter {
                name: "chapter_title".to_string(),
                parameter_type: "string".to_string(),
                description: "For a textbook: the exact chapter title (from get_resource_structure) the journey should cover. Leave empty for non-textbook resources.".to_string(),
            },
            Parameter {
                name: "instructions".to_string(),
                parameter_type: "string".to_string(),
                description: "Optional guidance on what to focus on when building the journey from a document. Leave empty if not needed.".to_string(),
            },
        ]
    }

    async fn execute(&self, params: Value, context: &AppContext) -> Result<Value> {
        let resource_id = match params.get("resource_id").and_then(|v| v.as_i64()) {
            Some(id) => id,
            None => return Ok(json!({ "error": "missing required parameter: resource_id" })),
        };

        let chapter_title = params
            .get("chapter_title")
            .and_then(|v| v.as_str())
            .map(str::trim)
            .filter(|s| !s.is_empty());
        let instructions = params
            .get("instructions")
            .and_then(|v| v.as_str())
            .map(str::trim)
            .filter(|s| !s.is_empty());

        let instruction = match (chapter_title, instructions) {
            (Some(chapter), _) => AgentResponseInstruction::ChapterTitle(chapter.to_string()),
            (None, Some(instr)) => {
                AgentResponseInstruction::ArtifactGenerationInstructions(instr.to_string())
            }
            (None, None) => AgentResponseInstruction::None,
        };

        let mut chat = context.chat.lock().await;
        let notes = chat.notes.clone().unwrap_or_default();
        chat.is_done = true;
        chat.pending_action = Some(PendingAction::Journey {
            resource_id,
            instruction,
            notes,
        });

        crate::info!("create_journey queued for resource_id={}", resource_id);
        Ok(json!({ "success": true, "resource_id": resource_id }))
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
        let problem_id = match params.get("problem_resource_id").and_then(|v| v.as_i64()) {
            Some(id) => id,
            None => {
                return Ok(json!({ "error": "missing required parameter: problem_resource_id" }))
            }
        };
        let solution_id = match params.get("solution_resource_id").and_then(|v| v.as_i64()) {
            Some(id) => id,
            None => {
                return Ok(json!({ "error": "missing required parameter: solution_resource_id" }))
            }
        };

        let mut chat = context.chat.lock().await;
        let notes = chat.notes.clone().unwrap_or_default();
        chat.is_done = true;
        chat.pending_action = Some(PendingAction::Explainer {
            problem_resource_id: problem_id,
            solution_resource_id: solution_id,
            notes,
        });

        crate::info!(
            "create_explainer queued for problem_resource_id={} solution_resource_id={}",
            problem_id,
            solution_id
        );
        Ok(json!({ "success": true, "problem_resource_id": problem_id, "solution_resource_id": solution_id }))
    }
}

fn resource_type_name(resource_type: &ResourceType) -> &'static str {
    match resource_type {
        ResourceType::TextBook(_) => "textbook",
        ResourceType::Document(_) => "document",
        ResourceType::Question => "question",
        ResourceType::Solution => "solution",
    }
}
