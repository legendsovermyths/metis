use std::fs;

use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{
    app::explanation::{Explanation, Step},
    db::repo::{appdata::AppDataRepo, explanations::ExplanationsRepo, resources::ResourcesRepo},
    error::{MetisError, Result},
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMClient,
    },
    prompts::get_prompt_provider,
    task::{context::TaskContext, gaurd::TaskGaurd, manager::TaskFuture},
    utils::format::strip_json_block,
};

#[derive(Deserialize)]
pub struct CreateExplanationParams {
    problem_resource_id: i64,
    solution_resource_id: i64,
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

        let problem = ResourcesRepo::get(params.problem_resource_id)?;
        let solution = ResourcesRepo::get(params.solution_resource_id)?;

        let reference_material = format!(
            "## Problem\n\n{}\n\n## Solution\n\n{}",
            problem.content, solution.content
        );

        let explanation_dir = format!("../explanations/{}", uuid::Uuid::new_v4());
        fs::create_dir_all(&explanation_dir).map_err(|e| MetisError::UtilsError(e.to_string()))?;
        fs::write(format!("{}/content.md", explanation_dir), &reference_material)
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
        let text = strip_json_block(&raw);
        let output: ArchitectOutput =
            serde_json::from_str(text).map_err(|e| MetisError::JsonError(e.to_string()))?;

        let explanation = Explanation { steps: output.steps };
        let id = ExplanationsRepo::insert(&output.title, &explanation_dir, &explanation)?;

        Ok(json!({ "id": id, "title": output.title }))
    })
}
