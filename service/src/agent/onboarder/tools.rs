use std::sync::{Arc, Mutex};

use async_trait::async_trait;
use serde_json::{json, Value};

use crate::{
    app::AppContext,
    db::repo::appdata::{self, AppDataRepo},
    error::Result,
    llm_client::tool::{Parameter, Parameters, Tool},
};

pub struct SetNotesTool;

#[async_trait]
impl Tool for SetNotesTool {
    async fn execute(&self, value: Value, context: &AppContext) -> Result<Value> {
        let notes = value.get("notes").and_then(|v| v.as_str()).ok_or_else(|| {
            crate::error::MetisError::ToolError("missing required parameter: notes".into())
        })?;
        context.chat.lock().await.notes = Some(notes.to_string());
        appdata::AppDataRepo::set("user_profile", &notes)?;

        Ok(json!({ "status": "ok" }))
    }

    fn name(&self) -> &str {
        "set_notes"
    }

    fn parameters(&self) -> Parameters {
        vec![Parameter {
            name: "notes".to_string(),
            parameter_type: "string".to_string(),
            description: "The full updated markdown notes about the student. Must be the complete rewritten notes, not a diff or append.".to_string(),
        }]
    }

    fn description(&self) -> &str {
        "Overwrite your notes about the student with the full updated version. Call this after each conversation turn to keep your notes current."
    }
}

pub struct GetNotesTool;

#[async_trait]
impl Tool for GetNotesTool {
    async fn execute(&self, _value: Value, context: &AppContext) -> Result<Value> {
        let notes = context.chat.lock().await.notes.clone();
        if notes.is_none() {
            return Ok(json!({ "notes": "No notes yet." }));
        }
        Ok(json!({ "notes": notes.unwrap() }))
    }

    fn name(&self) -> &str {
        "get_notes"
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![]
    }

    fn description(&self) -> &str {
        "Retrieve your current notes about the student. Use this to remind yourself what you've learned so far."
    }
}

pub struct SetDoneTool;

#[async_trait]
impl Tool for SetDoneTool {
    async fn execute(&self, _value: Value, context: &AppContext) -> Result<Value> {
        let mut ctx = context.chat.lock().await;
        if ctx.notes.is_none() {
            return Ok(
                json!({ "status": "error", "message": "Cannot finish without notes. Call set_notes first." }),
            );
        }
        let user_profile = ctx.notes.clone().unwrap();
        AppDataRepo::set("user_profile", &user_profile)?;
        ctx.set_done();
        Ok(json!({ "status": "done", "message": "Onboarding complete." }))
    }

    fn name(&self) -> &str {
        "set_done"
    }

    fn parameters(&self) -> Vec<Parameter> {
        vec![]
    }

    fn description(&self) -> &str {
        "Signal that onboarding is complete. Only call when you have gathered all required information and updated your notes."
    }
}
