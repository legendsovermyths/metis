pub mod illustrator;

use std::{
    fs,
    sync::{Arc, Mutex},
};

use serde::Deserialize;

use crate::{
    agent::{narrator::illustrator::Illustrator, Agent, AgentResponse},
    api::request::handler::runtime,
    app::{journey::TopicRange, AppContext},
    db::repo::{appdata::AppDataRepo, journeys::JourneysRepo},
    error::{MetisError, Result},
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMClient,
    },
    logs::EventHistory,
    prompts::get_prompt_provider,
    utils::format::strip_json_block,
};

const DIALOGUE_CONTEXT_SIZE: usize = 10;

#[derive(Deserialize)]
pub struct NarratorOutput {
    pub dialogue: String,
    pub topic_complete: bool,
    pub blackboard: Option<String>,
}



pub struct Narrator {
    client: Arc<tokio::sync::Mutex<dyn LLMClient>>,
    context: Arc<Mutex<AppContext>>,
    illustrator: Illustrator
}

impl Narrator {
    pub fn new(context: Arc<Mutex<AppContext>>) -> Self {
        let client = LLMClientFactory::get_client(ClientType::GEMINI);
        let illustrator = Illustrator::with(Arc::clone(&context));
        Self { client, context, illustrator }
    }

    fn load_topic_content(chapter_dir: &str, topic_name: &str) -> String {
        let topic_map_path = format!("{}/topic_map.json", chapter_dir);
        let content_md_path = format!("{}/content.md", chapter_dir);

        let topic_map: Vec<TopicRange> = fs::read_to_string(&topic_map_path)
            .ok()
            .and_then(|s| serde_json::from_str(&s).ok())
            .unwrap_or_default();

        let content = match fs::read_to_string(&content_md_path) {
            Ok(c) => c,
            Err(_) => return String::new(),
        };

        let range = match topic_map.iter().find(|r| r.topic == topic_name) {
            Some(r) => r,
            None => return String::new(),
        };

        let start_marker = format!("<!-- PAGE {} -->", range.start_page);
        let end_marker = format!("<!-- PAGE {} -->", range.end_page + 1);

        let start_pos = content.find(&start_marker).unwrap_or(0);
        let end_pos = content.find(&end_marker).unwrap_or(content.len());

        content[start_pos..end_pos].to_string()
    }
}

impl Agent for Narrator {
    fn generate(&mut self, _message: Option<String>) -> Result<AgentResponse> {
        let ts = self
            .context
            .lock()
            .unwrap()
            .teaching_state
            .clone()
            .ok_or(MetisError::AgentError("No teaching state set".into()))?;

        let current_topic = ts
            .journey
            .journey
            .get_topic(
                ts.progress.arc_idx,
                ts.progress.arcs[ts.progress.arc_idx].topic_idx,
            )
            .ok_or(MetisError::AgentError("All topics completed".into()))?;

        let arc = ts.journey.journey.get_arc(ts.progress.arc_idx).unwrap();
        let arc_json =
            serde_json::to_string_pretty(arc).map_err(|e| MetisError::JsonError(e.to_string()))?;

        let recent = ts.progress.recent_dialogues(DIALOGUE_CONTEXT_SIZE);
        let dialogue_so_far = if recent.is_empty() {
            "(No dialogue yet — this is the first chunk.)".to_string()
        } else {
            recent
                .iter()
                .map(|dialogue| dialogue.content.clone())
                .collect::<Vec<String>>()
                .join("\n\n---\n\n")
        };

        let profile = AppDataRepo::get("user_profile")?.unwrap_or_default();
        let reference_material =
            Self::load_topic_content(&ts.journey.chapter_dir, &current_topic.name);

        let blackboard_state = ts.progress.blackboard_state.clone().unwrap_or_default();

        let prompt = get_prompt_provider().get_narrator_prompt(
            &profile,
            &arc_json,
            &dialogue_so_far,
            &reference_material,
            &blackboard_state,
        );

        let response = runtime().block_on(async {
            let mut client = self.client.lock().await;
            client.set_system_prompt(prompt);
            client
                .generate("Generate the next dialogue chunk.".to_string())
                .await
        })?;

        let raw = response.text();
        let json_str = strip_json_block(&raw);
        let parsed: NarratorOutput = match serde_json::from_str(json_str) {
            Ok(v) => v,
            Err(_) => {
                log::warn!("[narrator] LLM returned non-JSON, treating as raw dialogue");
                NarratorOutput {
                    dialogue: raw.clone(),
                    topic_complete: false,
                    blackboard: None,
                }
            }
        };
        let dialogue = self.illustrator.generate(&parsed)?;

        {
            let mut ctx = self.context.lock().unwrap();
            let ts = ctx.teaching_state.as_mut().unwrap();
            let journey = ts.journey.journey.clone();
            ts.progress.push_dialogue(dialogue.clone(), parsed.topic_complete, &journey);

            if let Some(ref bb) = parsed.blackboard {
                if bb == "clear" {
                    ts.progress.blackboard_state = None;
                } else {
                    ts.progress.blackboard_state = Some(bb.clone());
                }
            }

            let id = ts.journey.id.unwrap_or(0);
            if let Err(e) = JourneysRepo::update_progress(id, &ts.progress) {
                log::error!("[narrator] Failed to persist progress: {}", e);
            }
        }

        Ok(AgentResponse::dialogue(dialogue.content))
    }

    fn get_event_history(&mut self) -> EventHistory {
        EventHistory::new()
    }
}
