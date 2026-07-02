use serde::Deserialize;

use crate::{
    app::dialogue::{
        blackboard::ElementDescriptor,
        segment::{Segment, SegmentAction},
    },
    error::Result,
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMClient,
    },
    prompts::get_prompt_provider,
    utils::format::sanitize_json,
};

#[derive(Deserialize)]
struct CuratorOutput {
    dialogue: String,
    parts: Vec<ElementDescriptor>,
    segments: Vec<Segment>,
}

pub struct CuratorRequest<'a> {
    pub dialogue_content: &'a str,
    pub blackboard_instruction: &'a str,
}

pub struct CuratedResult {
    pub dialogue: String,
    pub parts: Vec<ElementDescriptor>,
    pub segments: Vec<Segment>,
}

pub struct Curator {
    client: Box<dyn LLMClient>,
}

impl<'a> Curator {
    pub fn new() -> Self {
        let client = LLMClientFactory::get_client(ClientType::ClaudeOpus);
        Self { client }
    }

    pub async fn curate(&mut self, request: CuratorRequest<'a>) -> Result<CuratedResult> {
        let prompt = get_prompt_provider()
            .get_curator_prompt(request.dialogue_content, request.blackboard_instruction);

        self.client.set_system_prompt(prompt);
        self.client.set_json_mode(true);

        let response = self
            .client
            .generate("Produce the curation.".to_string())
            .await?;

        let raw = response.text();
        let fixed = sanitize_json(&raw);
        let parsed: CuratorOutput = match serde_json::from_str(&fixed) {
            Ok(v) => v,
            Err(e) => {
                log::error!("[curator] failed to parse LLM response: {e}\nRaw: {raw}");
                return Ok(CuratedResult {
                    dialogue: request.dialogue_content.to_string(),
                    parts: Vec::new(),
                    segments: vec![Segment {
                        text: request.dialogue_content.to_string(),
                        actions: Vec::new(),
                        transcript: None,
                        audio_path: None,
                    }],
                });
            }
        };

        let mut segments = parsed.segments;
        ensure_all_parts_revealed(&mut segments, &parsed.parts);

        Ok(CuratedResult {
            dialogue: parsed.dialogue,
            parts: parsed.parts,
            segments,
        })
    }
}

fn ensure_all_parts_revealed(segments: &mut Vec<Segment>, parts: &[ElementDescriptor]) {
    if segments.is_empty() || parts.is_empty() {
        return;
    }
    let mut addressed = std::collections::HashSet::new();
    for segment in segments.iter() {
        for action in &segment.actions {
            match action {
                SegmentAction::Reveal { targets }
                | SegmentAction::Focus { targets }
                | SegmentAction::Pulse { targets, .. } => {
                    for t in targets {
                        addressed.insert(t.clone());
                    }
                }
                SegmentAction::Morph { from, to, .. } | SegmentAction::Connect { from, to, .. } => {
                    addressed.insert(from.clone());
                    addressed.insert(to.clone());
                }
                SegmentAction::Trace { target, along, .. } => {
                    addressed.insert(target.clone());
                    addressed.insert(along.clone());
                }
            }
        }
    }
    let missing: Vec<String> = parts
        .iter()
        .filter(|p| !addressed.contains(&p.id))
        .map(|p| p.id.clone())
        .collect();
    if missing.is_empty() {
        return;
    }
    log::warn!(
        "[curator] {} part(s) left un-addressed, appending to final segment: {:?}",
        missing.len(),
        missing
    );
    if let Some(last) = segments.last_mut() {
        if let Some(action) = last.actions.iter_mut().find_map(|a| {
            if let SegmentAction::Reveal { targets } = a {
                Some(targets)
            } else {
                None
            }
        }) {
            action.extend(missing);
        } else {
            last.actions
                .push(SegmentAction::Reveal { targets: missing });
        }
    }
}

