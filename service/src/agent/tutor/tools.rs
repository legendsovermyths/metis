use crate::{
    app::{
        dialogue::{DialogueReference, ReferenceKind},
        journey::artifact,
        AppContext,
    },
    db::repo::{dialogue::DialoguesRepo, explanations::ExplanationsRepo, journeys::JourneysRepo},
    utils::dialogue::{dialogue_to_summary, get_after_dialogue, get_before_dialogue},
};
use async_trait::async_trait;
use serde_json::{json, Value};

use crate::{
    app::dialogue::Dialogue,
    error::{MetisError, Result},
    llm_client::tool::{Parameter, Tool},
    utils::narrator::{load_explanation_material, load_topic_content},
};

pub struct FetchMoreDialoguesTool;

#[async_trait]
impl Tool for FetchMoreDialoguesTool {
    async fn execute(&self, value: Value, context: &AppContext) -> Result<Value> {
        let direction = value
            .get("direction")
            .and_then(|v| v.as_str())
            .unwrap_or("before")
            .to_string();
        let n = value.get("n").and_then(|v| v.as_u64()).unwrap_or(5) as usize;

        let dialogue_id = match context.chat.lock().await.dialogue_id {
            Some(id) => id,
            None => {
                return Ok(json!({
                    "error": "No dialogue is currently selected. Cannot fetch surrounding dialogues."
                }));
            }
        };

        let dialogues = match direction.as_str() {
            "before" => get_before_dialogue(dialogue_id, n, false)?,
            "after" => get_after_dialogue(dialogue_id, n)?,
            other => {
                return Ok(json!({
                    "error": format!("Unknown direction '{other}'. Use 'before' or 'after'.")
                }));
            }
        };

        let summaries: Vec<Value> = dialogues.iter().map(dialogue_to_summary).collect();
        Ok(json!({ "dialogues": summaries }))
    }

    fn name(&self) -> &str {
        "fetch_more_dialogues"
    }

    fn description(&self) -> &str {
        "Fetch n dialogues immediately before or after the dialogue the student is currently looking at. Use this when you need wider course context than what's in your system prompt."
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![
            Parameter {
                name: "direction".to_string(),
                parameter_type: "string".to_string(),
                description: "Either 'before' (earlier dialogues) or 'after' (later dialogues)."
                    .to_string(),
            },
            Parameter {
                name: "n".to_string(),
                parameter_type: "integer".to_string(),
                description: "How many dialogues to fetch in that direction.".to_string(),
            },
        ]
    }
}

pub struct FetchReferenceMaterialTool;

#[async_trait]
impl Tool for FetchReferenceMaterialTool {
    async fn execute(&self, value: Value, _context: &AppContext) -> Result<Value> {
        let dialogue_id = value
            .get("dialogue_id")
            .and_then(|v| v.as_i64())
            .ok_or_else(|| MetisError::ToolError("missing required parameter: dialogue_id".into()))?;

        let dialogue = DialoguesRepo::get_by_id(dialogue_id)?;

        let content = match &dialogue.reference {
            DialogueReference::Journey {
                journey_id,
                arc_idx,
                topic_idx,
            } => {
                let artifacts = JourneysRepo::get_artifacts(*journey_id)?;
                let topic = artifacts.get_topic(*arc_idx, *topic_idx).ok_or(
                    MetisError::ToolError("Referenced topic does not exist.".to_string()),
                )?;
                load_topic_content(&artifacts.chapter_dir, &topic.name)
            }
            DialogueReference::Explanation { explanation_id, .. } => {
                let artifacts = ExplanationsRepo::get_artifacts(*explanation_id)?;
                load_explanation_material(&artifacts.explanation_directory)
            }
            DialogueReference::None => {
                return Ok(json!({
                    "error": "Dialogue has no reference material."
                }));
            }
        };

        if content.is_empty() {
            return Ok(json!({ "error": "No reference material found." }));
        }
        Ok(json!({ "content": content }))
    }

    fn name(&self) -> &str {
        "fetch_reference_material"
    }

    fn description(&self) -> &str {
        "Fetch the source material behind a dialogue — for a course, the textbook pages for its topic; for an explanation, the full problem and worked solution."
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![Parameter {
            name: "dialogue_id".to_string(),
            parameter_type: "integer".to_string(),
            description: "The id of the dialogue whose source material you want.".to_string(),
        }]
    }
}

pub struct GetCurrentDialogueIdTool;

#[async_trait]
impl Tool for GetCurrentDialogueIdTool {
    async fn execute(&self, _value: Value, context: &AppContext) -> Result<Value> {
        match context.chat.lock().await.dialogue_id {
            Some(id) => Ok(json!({ "dialogue_id": id })),
            None => Ok(json!({ "error": "No dialogue is currently selected." })),
        }
    }

    fn name(&self) -> &str {
        "get_current_dialogue_id"
    }

    fn description(&self) -> &str {
        "Get the id of the dialogue the student is currently looking at."
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![]
    }
}

pub struct ReadTutorNotesTool;

#[async_trait]
impl Tool for ReadTutorNotesTool {
    async fn execute(&self, _value: Value, context: &AppContext) -> Result<Value> {
        let chat = context.chat.lock().await;
        let dialogue_id = chat.dialogue_id.ok_or(MetisError::ToolError(
            "chat context doesn't contain dialogue id".to_string(),
        ))?;

        let dialogue = DialoguesRepo::get_by_id(dialogue_id)?;

        match dialogue.reference.kind() {
            ReferenceKind::Journey => {
                let journey_artifacts =
                    JourneysRepo::get_artifacts(dialogue.reference.parent_id())?;
                Ok(json!({"notes": journey_artifacts.tutor_notes}))
            }
            ReferenceKind::Explanation => {
                let explanation_artifacts =
                    ExplanationsRepo::get_artifacts(dialogue.reference.parent_id())?;
                Ok(json!({"notes": explanation_artifacts.tutor_notes}))
            }
            ReferenceKind::None => Err(MetisError::InternalDataError(
                "Dialgoue doesn't have reference kind set".to_string(),
            )),
        }
    }

    fn name(&self) -> &str {
        "read_tutor_notes"
    }

    fn description(&self) -> &str {
        "Read your freeform notebook about this student in this journey. Past confusions, things they understand, how they reason."
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![]
    }
}

pub struct SetTutorNotesTool;

#[async_trait]
impl Tool for SetTutorNotesTool {
    async fn execute(&self, value: Value, context: &AppContext) -> Result<Value> {
        let content = value
            .get("content")
            .and_then(|v| v.as_str())
            .ok_or_else(|| MetisError::ToolError("missing required parameter: content".into()))?
            .to_string();

        let dialogue_id = context.chat.lock().await.dialogue_id.ok_or(MetisError::ToolError(
            "chat context doesn't contain dialogue id".to_string(),
        ))?;

        let dialogue = DialoguesRepo::get_by_id(dialogue_id)?;

        match dialogue.reference.kind() {
            ReferenceKind::Journey => {
                let mut artifacts = JourneysRepo::get_artifacts(dialogue.reference.parent_id())?;
                artifacts.tutor_notes = content;
                JourneysRepo::update(&artifacts)?;
            }
            ReferenceKind::Explanation => {
                let mut artifacts =
                    ExplanationsRepo::get_artifacts(dialogue.reference.parent_id())?;
                artifacts.tutor_notes = content;
                ExplanationsRepo::update(&artifacts)?;
            }
            ReferenceKind::None => {
                return Err(MetisError::InternalDataError(
                    "Dialgoue doesn't have reference kind set".to_string(),
                ));
            }
        }
        Ok(json!({ "success": true }))
    }

    fn name(&self) -> &str {
        "set_tutor_notes"
    }

    fn description(&self) -> &str {
        "Overwrite your tutor notebook with a full new version. Pass the entire updated notes string — your previous notes will be replaced. Keep it terse and prune aggressively."
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![Parameter {
            name: "content".to_string(),
            parameter_type: "string".to_string(),
            description: "The full new contents of the notebook. Freeform string.".to_string(),
        }]
    }
}
