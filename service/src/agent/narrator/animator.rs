use std::collections::HashSet;

use serde::Deserialize;

use crate::{
    app::journey::blackboard::{ElementDescriptor, Segment},
    error::Result,
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMClient,
    },
    prompts::get_prompt_provider,
    utils::format::{fix_json_escapes, strip_json_block},
};

#[derive(Deserialize)]
struct AnimatorOutput {
    segments: Vec<Segment>,
}

pub struct Animator {
    client: Box<dyn LLMClient>,
}

impl Animator {
    pub fn with() -> Self {
        let client = LLMClientFactory::get_client(ClientType::ClaudeOpus);
        Self { client }
    }

    pub async fn animate(
        &mut self,
        dialogue: &str,
        elements: &[ElementDescriptor],
    ) -> Result<Vec<Segment>> {
        if elements.is_empty() {
            return Ok(vec![Segment {
                text: dialogue.to_string(),
                reveals: Vec::new(),
                focus: Vec::new(),
            }]);
        }

        let elements_json = serde_json::to_string_pretty(elements)
            .unwrap_or_else(|_| "[]".to_string());

        let prompt = get_prompt_provider().get_animator_prompt(dialogue, &elements_json);
        self.client.set_system_prompt(prompt);
        self.client.set_json_mode(true);

        let response = self
            .client
            .generate("Produce the segments.".to_string())
            .await?;

        let raw = response.text();
        let json_str = strip_json_block(&raw);
        let fixed = fix_json_escapes(json_str);
        let mut parsed: AnimatorOutput = match serde_json::from_str(&fixed) {
            Ok(v) => v,
            Err(e) => {
                log::error!("[animator] failed to parse LLM response: {e}\nRaw: {raw}");
                return Ok(vec![Segment {
                    text: dialogue.to_string(),
                    reveals: Vec::new(),
                    focus: Vec::new(),
                }]);
            }
        };

        ensure_all_elements_revealed(&mut parsed.segments, elements);

        Ok(parsed.segments)
    }
}

/// Safety net: if the animator left any element unrevealed, append the missing
/// ids to the last segment's `reveals` so the student eventually sees the full figure.
fn ensure_all_elements_revealed(segments: &mut Vec<Segment>, elements: &[ElementDescriptor]) {
    if segments.is_empty() || elements.is_empty() {
        return;
    }
    let revealed: HashSet<&str> = segments
        .iter()
        .flat_map(|s| s.reveals.iter().map(String::as_str))
        .collect();
    let missing: Vec<String> = elements
        .iter()
        .filter(|e| !revealed.contains(e.id.as_str()))
        .map(|e| e.id.clone())
        .collect();
    if missing.is_empty() {
        return;
    }
    log::warn!(
        "[animator] {} element(s) left un-revealed, appending to final segment: {:?}",
        missing.len(),
        missing
    );
    if let Some(last) = segments.last_mut() {
        last.reveals.extend(missing);
    }
}
