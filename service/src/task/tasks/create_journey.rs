use std::{
    fs::{self, create_dir_all},
    path::Path,
};

use serde::{Deserialize, Serialize};

use crate::{
    agent::AgentResponseInstruction,
    app::{
        journey::{artifact::JourneyArtifacts, progress::JourneyProgress, Journey},
        resource::resource::Resource,
    },
    db::repo::Repository,
    task::{
        context::TaskContext,
        gaurd::TaskGaurd,
        manager::TaskFuture,
        progress::{TaskProgress, TaskStatus},
    },
    utils::journey::{
        create_topic_map, extract_topics_from_content,
        generate_journey,
    },
};

#[derive(Deserialize)]
pub struct CreateJourneyParams {
    resource_id: i64,
    response_instruction: AgentResponseInstruction,
    advisor_notes: String,
}

impl TaskGaurd for CreateJourneyParams {}

#[derive(Deserialize, Serialize)]
pub struct CreateJourneyCheckpoint {
    journey_dir: Option<String>,
    content_md: Option<String>,
    topics: Option<Vec<String>>,
    journey: Option<Journey>,
    generated_topic_map: bool,
}

#[derive(Clone, Serialize, Deserialize)]
pub struct PageRange {
    pub chapter_start: u32,
    pub chapter_end: u32,
}

pub fn create_journey(context: TaskContext) -> TaskFuture {
    Box::pin(async move {
        let params: CreateJourneyParams = serde_json::from_value(context.params)?;
        let mut checkpoint: CreateJourneyCheckpoint = serde_json::from_value(context.checkpoint)?;

        if checkpoint.journey_dir.is_none() {
            let artifact_dir = crate::utils::paths::artifact_dir();
            let journey_dir = artifact_dir.join(uuid::Uuid::new_v4().to_string());
            create_dir_all(&journey_dir)?;
            let _ = context.progress_tx.send(TaskProgress {
                task_id: context.id.clone(),
                checkpoint: serde_json::to_value(&checkpoint)?,
                status: TaskStatus::Running,
                message: "Created Directory for Journey".into(),
            });
            checkpoint.journey_dir = Some(journey_dir.to_string_lossy().to_string().clone());
        }

        let journey_dir = checkpoint.journey_dir.clone().unwrap();

        let resource = Repository::<Resource>::find_by_id(&params.resource_id)?;
        let resource = resource.read();
        if checkpoint.content_md.is_none() {
            let content = resource
                .get_content(&params.response_instruction)
                .await?;
            let content_md_path = Path::new(&journey_dir).join("content.md");

            fs::write(content_md_path, &content)?;

            checkpoint.content_md = Some(content);
            let _ = context.progress_tx.send(TaskProgress {
                task_id: context.id.clone(),
                checkpoint: serde_json::to_value(&checkpoint)?,
                status: TaskStatus::Running,
                message: "Extracted content from resource".into(),
            });
        }

        let content_md = checkpoint.content_md.clone().unwrap();

        if checkpoint.topics.is_none() {
            let topics =
                extract_topics_from_content(&content_md, &params.response_instruction)
                    .await?;
            checkpoint.topics = Some(topics);
            let _ = context.progress_tx.send(TaskProgress {
                task_id: context.id.clone(),
                checkpoint: serde_json::to_value(&checkpoint)?,
                status: TaskStatus::Running,
                message: "Extracted topics from chapter".into(),
            });
        }

        let topics = checkpoint.topics.clone().unwrap();

        if checkpoint.journey.is_none() {
            let journey = generate_journey(topics).await?;
            checkpoint.journey = Some(journey);
            let _ = context.progress_tx.send(TaskProgress {
                task_id: context.id.clone(),
                checkpoint: serde_json::to_value(&checkpoint)?,
                status: TaskStatus::Running,
                message: "Created Journey".into(),
            });
        }

        let journey = checkpoint.journey.clone().unwrap();

        if !checkpoint.generated_topic_map {
            let _ = create_topic_map(&journey_dir, &journey).await?;
            checkpoint.generated_topic_map = true;
            let _ = context.progress_tx.send(TaskProgress {
                task_id: context.id.clone(),
                checkpoint: serde_json::to_value(&checkpoint)?,
                status: TaskStatus::Running,
                message: "Created Topic Map".into(),
            });
        }
        let created_at = std::time::SystemTime::now()
            .duration_since(std::time::UNIX_EPOCH)
            .unwrap()
            .as_secs() as i64;

        let chapter_title = match &params.response_instruction {
            AgentResponseInstruction::ChapterTitle(title) => title.clone(),
            _ => resource.title.clone(),
        };

        let artifacts = JourneyArtifacts {
            id: None,
            chapter_title,
            chapter_dir: journey_dir,
            journey,
            advisor_notes: params.advisor_notes,
            tutor_notes: String::new(),
            folder_id: None,
            created_at,
            progress: JourneyProgress::new(0),
            generation_progress: JourneyProgress::new(0)
        };

        let created = Repository::<JourneyArtifacts>::create(artifacts)?;
        Ok(serde_json::to_value(created.read())?)
    })
}

impl Default for CreateJourneyCheckpoint {
    fn default() -> Self {
        CreateJourneyCheckpoint {
            journey_dir: None,
            content_md: None,
            topics: None,
            journey: None,
            generated_topic_map: false,
        }
    }
}
