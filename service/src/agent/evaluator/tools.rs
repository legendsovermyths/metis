use async_trait::async_trait;
use serde_json::{json, Value};

use crate::{
    app::{
        dialogue::{kind::DialogueKind, Dialogue, ArtifactReference},
        journey::artifact,
        AppContext,
    },
    db::repo::Repository,
    error::{MetisError, Result},
    llm_client::tool::{Parameter, Tool},
    utils::narrator::load_topic_content,
};

pub struct FetchArcMaterialTool;

#[async_trait]
impl Tool for FetchArcMaterialTool {
    async fn execute(&self, _value: Value, context: &AppContext) -> Result<Value> {
        let dialogue_id = context.chat.lock().await.dialogue_id.ok_or(
            MetisError::ToolError("chat context doesn't contain dialogue id".to_string()),
        )?;

        let dialogue = Repository::<Dialogue>::find_by_id(&dialogue_id)?;
        let (journey_id, arc_idx) = match dialogue.read().reference {
            ArtifactReference::Journey {
                journey_id,
                arc_idx,
                ..
            } => (journey_id, arc_idx),
            _ => {
                return Ok(json!({
                    "error": "This problem is not attached to a journey arc."
                }))
            }
        };

        let artifacts = Repository::<artifact::JourneyArtifacts>::find_by_id(&journey_id)?;
        let artifacts = artifacts.read();
        let arc = artifacts.get_arc(arc_idx).ok_or(MetisError::ToolError(
            "Referenced arc does not exist.".to_string(),
        ))?;

        let material = arc
            .topics
            .iter()
            .filter(|t| t.generation_kind != DialogueKind::Question)
            .map(|t| load_topic_content(&artifacts.chapter_dir, &t.name))
            .filter(|c| !c.is_empty())
            .collect::<Vec<String>>()
            .join("\n\n");

        if material.is_empty() {
            return Ok(json!({ "error": "No material found for this arc." }));
        }
        Ok(json!({ "content": material }))
    }

    fn name(&self) -> &str {
        "fetch_arc_material"
    }

    fn description(&self) -> &str {
        "Fetch the textbook material for the arc this problem belongs to — the source pages behind every topic the student studied in it."
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![]
    }
}

pub struct ConcludeQuaestioTool;

#[async_trait]
impl Tool for ConcludeQuaestioTool {
    async fn execute(&self, _value: Value, context: &AppContext) -> Result<Value> {
        let dialogue_id = context.chat.lock().await.dialogue_id.ok_or(
            MetisError::ToolError("chat context doesn't contain dialogue id".to_string()),
        )?;

        let mut dialogue = Repository::<Dialogue>::find_by_id(&dialogue_id)?;
        dialogue.write().concluded = true;
        Ok(json!({ "concluded": true }))
    }

    fn name(&self) -> &str {
        "conclude_quaestio"
    }

    fn description(&self) -> &str {
        "Conclude this problem: reveal the full worked solution to the student and unlock the next problem. Call this once the student has reasoned their way to the answer or has clearly asked to see the solution. You need not restate the solution in your reply — concluding reveals it."
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![]
    }
}
