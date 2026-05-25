use async_trait::async_trait;
use serde_json::{json, Value};

use crate::{
    app::{journey::dialogue::Dialogue, AppContext},
    db::repo::dialogue::DialoguesRepo,
    error::{MetisError, Result},
    llm_client::tool::{Parameter, Tool},
    utils::narrator::load_topic_content,
};

fn dialogue_to_summary(d: &Dialogue) -> Value {
    json!({
        "id": d.id,
        "arc_idx": d.arc_idx,
        "topic_idx": d.topic_idx,
        "idx": d.idx,
        "heading": d.heading,
        "content": d.content,
        "blackboard": d.blackboard.description,
    })
}

pub struct FetchMoreDialoguesTool;

#[async_trait]
impl Tool for FetchMoreDialoguesTool {
    async fn execute(&self, value: Value, context: &AppContext) -> Result<Value> {
        let direction = value
            .get("direction")
            .and_then(|v| v.as_str())
            .unwrap_or("before")
            .to_string();
        let n = value
            .get("n")
            .and_then(|v| v.as_u64())
            .unwrap_or(5) as usize;

        let dialogue_id = match context.chat.lock().await.dialogue_id {
            Some(id) => id,
            None => {
                return Ok(json!({
                    "error": "No dialogue is currently selected. Cannot fetch surrounding dialogues."
                }));
            }
        };

        let dialogues = match direction.as_str() {
            "before" => DialoguesRepo::get_before_dialogue(dialogue_id, n, false)?,
            "after" => DialoguesRepo::get_after_dialogue(dialogue_id, n)?,
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
                description: "Either 'before' (earlier dialogues) or 'after' (later dialogues).".to_string(),
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
    async fn execute(&self, value: Value, context: &AppContext) -> Result<Value> {
        let topic_title = value
            .get("topic_title")
            .and_then(|v| v.as_str())
            .ok_or_else(|| MetisError::ToolError("missing required parameter: topic_title".into()))?
            .to_string();

        let chapter_dir = {
            let teaching = context.teaching.lock().await;
            teaching
                .artifacts
                .as_ref()
                .map(|a| a.read().chapter_dir.clone())
                .ok_or_else(|| MetisError::ToolError("No journey is loaded.".into()))?
        };

        let excerpt = load_topic_content(&chapter_dir, &topic_title);
        if excerpt.is_empty() {
            return Ok(json!({
                "error": format!("No reference material found for topic '{topic_title}'.")
            }));
        }
        Ok(json!({ "topic": topic_title, "content": excerpt }))
    }

    fn name(&self) -> &str {
        "fetch_reference_material"
    }

    fn description(&self) -> &str {
        "Look up the underlying textbook pages for a specific topic by title. Returns the markdown excerpt of those pages. Use sparingly — only when the student's question needs precise grounding in the source material."
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![Parameter {
            name: "topic_title".to_string(),
            parameter_type: "string".to_string(),
            description: "Exact topic title as listed in the course's topic map.".to_string(),
        }]
    }
}

pub struct ReadTutorNotesTool;

#[async_trait]
impl Tool for ReadTutorNotesTool {
    async fn execute(&self, _value: Value, context: &AppContext) -> Result<Value> {
        let teaching = context.teaching.lock().await;
        let notes = teaching
            .artifacts
            .as_ref()
            .map(|a| a.read().tutor_notes.clone())
            .ok_or_else(|| MetisError::ToolError("No journey is loaded.".into()))?;
        Ok(json!({ "notes": notes }))
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

        let mut teaching = context.teaching.lock().await;
        let artifacts = teaching
            .artifacts
            .as_mut()
            .ok_or_else(|| MetisError::ToolError("No journey is loaded.".into()))?;
        {
            let mut guard = artifacts.write();
            guard.tutor_notes = content;
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
