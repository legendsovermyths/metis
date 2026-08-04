use std::fs;

use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{
    agent::AgentResponseInstruction,
    app::{
        explanation::{artifact::ExplanationArtifacts, progress::ExplanationProgress, Explanation, Step},
        resource::resource::Resource,
    },
    db::repo::{appdata::AppDataRepo, Repository},
    error::MetisError,
    llm_client::factory::{ClientType, LLMClientFactory},
    prompts::get_prompt_provider,
    task::{context::TaskContext, gaurd::TaskGaurd, manager::TaskFuture},
    utils::format::sanitize_json,
};

#[derive(Deserialize)]
pub struct CreateExplanationParams {
    problem_resource_id: i64,
    solution_resource_id: i64,
    #[serde(default)]
    notes: String,
}

impl TaskGaurd for CreateExplanationParams {}

#[derive(Default, Serialize, Deserialize)]
pub struct CreateExplanationCheckpoint {}

#[derive(Deserialize)]
struct ArchitectOutput {
    title: String,
    steps: Vec<Step>,
}

pub fn create_explanation(context: TaskContext) -> TaskFuture {
    Box::pin(async move {
        let params: CreateExplanationParams = serde_json::from_value(context.params)?;

        let problem = Repository::<Resource>::find_by_id(&params.problem_resource_id)?;
        let solution = Repository::<Resource>::find_by_id(&params.solution_resource_id)?;

        let reference_material = format!(
            "## Problem\n\n{}\n\n## Solution\n\n{}",
            problem
                .read()
                .get_content(&AgentResponseInstruction::None)
                .await?,
            solution
                .read()
                .get_content(&AgentResponseInstruction::None)
                .await?
        );

        let explanation_dir = crate::utils::paths::explanations_dir()
            .join(uuid::Uuid::new_v4().to_string())
            .to_string_lossy()
            .into_owned();
        fs::create_dir_all(&explanation_dir).map_err(|e| MetisError::UtilsError(e.to_string()))?;
        fs::write(
            format!("{}/content.md", explanation_dir),
            &reference_material,
        )
        .map_err(|e| MetisError::UtilsError(e.to_string()))?;

        let profile = AppDataRepo::get("user_profile")?.unwrap_or_default();

        let prompt =
            get_prompt_provider().get_explanation_architect_prompt(&profile, &reference_material);
        let mut client = LLMClientFactory::get_client(ClientType::ClaudeOpus);
        client.set_json_mode(true);
        client.set_system_prompt(prompt);

        let response = client
            .generate("Plan the explanation route.".to_string())
            .await?;
        let raw = response.text();
        let text = sanitize_json(&raw);
        let output: ArchitectOutput =
            serde_json::from_str(&text).map_err(|e| MetisError::JsonError(e.to_string()))?;

        let explanation = Explanation {
            steps: output.steps,
        };
        let created_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;
        let created = Repository::<ExplanationArtifacts>::create(ExplanationArtifacts {
            id: None,
            title: output.title.clone(),
            explanation_directory: explanation_dir,
            explanation,
            folder_id: None,
            created_at,
            progress: ExplanationProgress::new(0),
            tutor_notes: params.notes,
        })?;
        let id = created.read().id.unwrap();

        Ok(json!({ "id": id, "title": output.title }))
    })
}
