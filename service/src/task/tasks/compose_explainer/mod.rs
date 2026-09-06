pub mod annotation;
pub mod audio_renderer;
pub mod curator;
pub mod enhancer;
pub mod illustrator;
pub mod layout;
pub mod templates;

use serde::{Deserialize, Serialize};
use serde_json::json;

use crate::{
    app::dialogue::Dialogue,
    db::repo::Repository,
    task::{
        context::TaskContext,
        gaurd::TaskGaurd,
        manager::TaskFuture,
        progress::{TaskProgress, TaskStatus},
        tasks::compose_explainer::{
            audio_renderer::{AudioRenderer, AudioRendererInput},
            curator::{CuratedResult, Curator},
            enhancer::{EnhancementResult, Enhancer, EnhancerRequest},
            illustrator::{IllustrationResult, Illustrator},
        },
    },
    utils::dialogue::finalize_parts_and_segments,
};


#[derive(Serialize, Deserialize)]
pub struct ComposeParam {
    dialogue_id: i64,
}

#[derive(Deserialize, Serialize)]
pub struct ComposeExplainerCheckpoint {
    curation_output: Option<CuratedResult>,
    illustration_output: Option<IllustrationResult>,
    enhancer_output: Option<EnhancementResult>,
}

pub fn compose_explainer(context: TaskContext) -> TaskFuture {
    Box::pin(async move {
        let params: ComposeParam = serde_json::from_value(context.params)?;
        let mut dialogue = Repository::<Dialogue>::find_by_id(&params.dialogue_id)?;
        let dialogue_draft = dialogue.read();

        let dialogue_content = &dialogue_draft.content;
        let blackboard_instructions = &dialogue_draft.blackboard.description;

        let mut curator = Curator::new();
        let mut illustrator = Illustrator::new();
        let mut enhancer = Enhancer::new();
        let audio_renderer = AudioRenderer::new();

        let mut checkpoint: ComposeExplainerCheckpoint = serde_json::from_value(context.checkpoint)?;

        if checkpoint.curation_output.is_none() {
            let curated = curator
                .curate(curator::CuratorRequest {
                    dialogue_content: &dialogue_draft.content,
                    blackboard_instruction: &dialogue_draft.blackboard.description,
                })
                .await?;
            checkpoint.curation_output = Some(curated);
            let _ = context
                .progress_tx
                .send(TaskProgress {
                    task_id: context.id.clone(),
                    message: format!("Curation generated for dialogue: {}", params.dialogue_id),
                    checkpoint: serde_json::to_value(&checkpoint)?,
                    status: TaskStatus::Running,
                })
                .await;
        }

        let curated = checkpoint.curation_output.clone().unwrap();

        let directory = dialogue_draft.reference.get_directory()?;

        if checkpoint.illustration_output.is_none() {
            let illustration = illustrator
                .illustrate(illustrator::IllustrationRequest {
                    dialogue: dialogue_content,
                    instruction: blackboard_instructions,
                    directory: &directory,
                    parts: &curated.parts,
                })
                .await?;
            checkpoint.illustration_output = Some(illustration);
            let _ = context
                .progress_tx
                .send(TaskProgress {
                    task_id: context.id.clone(),
                    message: format!(
                        "illustration generated for dialogue: {}",
                        params.dialogue_id
                    ),
                    checkpoint: serde_json::to_value(&checkpoint)?,
                    status: TaskStatus::Running,
                })
                .await;
        }
        let illustration = checkpoint.illustration_output.clone().unwrap();

        if checkpoint.enhancer_output.is_none() {
            let enhanced = enhancer
                .enhance(EnhancerRequest {
                    source_code: illustration.source_code.as_deref(),
                    library: illustration.library.as_deref(),
                    fallback_blackboard: illustration.blackboard,
                    parts: curated.parts,
                    segments: curated.segments,
                    dialogue: &curated.dialogue,
                    instruction: blackboard_instructions,
                    title: &dialogue_draft.heading,
                    chapter_dir: &directory,
                })
                .await?;
            checkpoint.enhancer_output = Some(enhanced);
            let _ = context
                .progress_tx
                .send(TaskProgress {
                    task_id: context.id.clone(),
                    message: format!("enhancement generated for dialogue: {}", params.dialogue_id),
                    checkpoint: serde_json::to_value(&checkpoint)?,
                    status: TaskStatus::Running,
                })
                .await;
        }
        let enhanced = checkpoint.enhancer_output.clone().unwrap();

        let (final_parts, final_segments) =
            finalize_parts_and_segments(enhanced.parts, enhanced.segments, &enhanced.blackboard);

        let segments = audio_renderer
            .render(AudioRendererInput {
                segments: final_segments,
                directory,
            })
            .await?
            .segments;

        let mut dialogue = dialogue.write();
        let mut blackboard = enhanced.blackboard;
        blackboard.elements = final_parts;

        dialogue.blackboard = blackboard;
        dialogue.segments = segments;
        dialogue.content = curated.dialogue;
        dialogue.is_ready = true;

        Ok(json!({}))
    })
}

impl TaskGaurd for ComposeParam {
    fn identity(&self) -> Option<String> {
        Some(format!("ComposeDialogue:{}", self.dialogue_id.to_string()))
    }
}

impl Default for ComposeExplainerCheckpoint {
    fn default() -> Self {
        ComposeExplainerCheckpoint {
            curation_output: None,
            illustration_output: None,
            enhancer_output: None,
        }
    }
}
