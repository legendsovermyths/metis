use std::{collections::HashSet, fs, path::Path};

use crate::{
    app::dialogue::{blackboard::{Blackboard, ElementDescriptor}, segment::{Segment, SegmentAction}}, error::{MetisError, Result}, llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMClient,
    }, prompts::get_prompt_provider, task::tasks::generate_dialogue::{
        annotation::EnhancerOutput,
        layout::{layout, LayoutInput, LayoutOutput},
        templates::COORDINATE_SAVE,
    }, utils::{
        format::sanitize_json, latex::execute_latex, svg::{extract_part_bboxes, svg_dimensions}
    }
};

const TIKZPICTURE_END: &str = "\\end{tikzpicture}";
const PARSE_RETRIES: usize = 1;

pub struct EnhancerRequest<'a> {
    pub source_code: Option<&'a str>,
    pub library: Option<&'a str>,
    pub fallback_blackboard: Blackboard,
    pub parts: Vec<ElementDescriptor>,
    pub segments: Vec<Segment>,
    pub dialogue: &'a str,
    pub instruction: &'a str,
    pub title: &'a str,
    pub chapter_dir: &'a str,
}

pub struct EnhancementResult {
    pub blackboard: Blackboard,
    pub parts: Vec<ElementDescriptor>,
    pub segments: Vec<Segment>,
}

pub struct Enhancer {
    client: Box<dyn LLMClient>,
}

impl<'a> Enhancer {
    pub fn new() -> Self {
        let mut client = LLMClientFactory::get_client(ClientType::ClaudeOpus);
        client.set_json_mode(true);
        Self { client }
    }

    pub async fn enhance(&mut self, request: EnhancerRequest<'a>) -> Result<EnhancementResult> {
        let source_code = match Self::applicable_source(&request) {
            Some(code) => code,
            None => return Ok(Self::keep_unenhanced(request)),
        };

        let parts_listing = Self::format_parts(&request.parts);
        let prompt = get_prompt_provider().get_enhancer_prompt(
            request.instruction,
            request.title,
            request.dialogue,
            &parts_listing,
        );
        self.client.set_system_prompt(prompt);

        let parsed = match self.fetch_annotations().await? {
            Some(p) => p,
            None => return Ok(Self::keep_unenhanced(request)),
        };

        if parsed.annotations.is_empty() {
            log::info!("[enhancer] no annotations proposed; keeping un-enhanced figure");
            return Ok(Self::keep_unenhanced(request));
        }

        let svg_str = match Self::read_fallback_svg(&request.fallback_blackboard) {
            Some(s) => s,
            None => return Ok(Self::keep_unenhanced(request)),
        };
        let canvas = svg_dimensions(&svg_str).unwrap_or((0.0, 0.0));
        let bboxes = extract_part_bboxes(&svg_str);

        let existing_ids: HashSet<String> =
            request.parts.iter().map(|p| p.id.clone()).collect();

        let layout_out = layout(LayoutInput {
            annotations: parsed.annotations,
            bboxes,
            canvas,
            segments: &request.segments,
            existing_part_ids: existing_ids,
        });

        if layout_out.snippets.is_empty() {
            log::info!("[enhancer] layout produced no snippets; keeping un-enhanced figure");
            return Ok(Self::keep_unenhanced(request));
        }

        let spliced = match Self::splice(&source_code, &layout_out.snippets) {
            Some(s) => s,
            None => {
                log::error!("[enhancer] could not find `{TIKZPICTURE_END}` in illustrator source");
                return Ok(Self::keep_unenhanced(request));
            }
        };

        let output_path = self.get_output_path(request.chapter_dir)?;
        match execute_latex(&spliced, &output_path) {
            Ok(()) if Path::new(&output_path).exists() => {
                log::info!("[enhancer] enhanced figure saved to {output_path}");
                let EnhancerRequest {
                    fallback_blackboard,
                    parts,
                    segments,
                    ..
                } = request;
                Ok(build_enhanced(
                    fallback_blackboard.description,
                    output_path,
                    parts,
                    segments,
                    layout_out,
                ))
            }
            Ok(()) => {
                log::error!("[enhancer] latex succeeded but no file at {output_path}");
                Ok(Self::keep_unenhanced(request))
            }
            Err(e) => {
                log::error!("[enhancer] latex compile failed: {e}");
                Ok(Self::keep_unenhanced(request))
            }
        }
    }

    async fn fetch_annotations(&mut self) -> Result<Option<EnhancerOutput>> {
        let mut user_message = "Produce the enhancement.".to_string();
        for attempt in 0..=PARSE_RETRIES {
            let response = self.client.generate(user_message.clone()).await?;
            if let Some(parsed) = Self::parse_output(&response.text()) {
                return Ok(Some(parsed));
            }
            if attempt < PARSE_RETRIES {
                log::warn!("[enhancer] parse failed; retrying with stricter instruction");
                user_message = "Your previous response was not valid JSON matching the schema. \
                                Respond again with only the JSON object — no markdown, no commentary."
                    .to_string();
            }
        }
        log::error!("[enhancer] giving up after {PARSE_RETRIES} parse retries");
        Ok(None)
    }

    fn applicable_source(request: &EnhancerRequest) -> Option<String> {
        match (request.source_code, request.library) {
            (Some(code), Some(lib)) if lib == "tikz" => Some(code.to_string()),
            _ => None,
        }
    }

    fn parse_output(raw: &str) -> Option<EnhancerOutput> {
        let fixed = sanitize_json(raw);
        match serde_json::from_str::<EnhancerOutput>(&fixed) {
            Ok(v) => Some(v),
            Err(e) => {
                log::error!("[enhancer] failed to parse LLM response: {e}\nRaw: {raw}");
                None
            }
        }
    }

    fn format_parts(parts: &[ElementDescriptor]) -> String {
        if parts.is_empty() {
            return "(no named parts in this figure)".to_string();
        }
        parts
            .iter()
            .map(|p| format!("- {}: {}", p.id, p.desc))
            .collect::<Vec<_>>()
            .join("\n")
    }

    fn read_fallback_svg(blackboard: &Blackboard) -> Option<String> {
        let path = blackboard.image_url.as_deref()?;
        match fs::read_to_string(path) {
            Ok(s) => Some(s),
            Err(e) => {
                log::warn!("[enhancer] could not read illustrator SVG at {path}: {e}");
                None
            }
        }
    }

    fn get_output_path(&self, chapter_dir: &str) -> Result<String> {
        let illustrations_dir = Path::new(chapter_dir).join("illustrations");
        fs::create_dir_all(&illustrations_dir).map_err(|e| {
            MetisError::AgentError(format!("Failed to create illustrations dir: {e}"))
        })?;
        let illustrations_dir = fs::canonicalize(&illustrations_dir).map_err(|e| {
            MetisError::AgentError(format!("Failed to resolve illustrations path: {e}"))
        })?;
        let filename = format!(
            "fig_enh_{}.svg",
            chrono::Utc::now().format("%Y%m%d_%H%M%S_%3f")
        );
        Ok(illustrations_dir
            .join(&filename)
            .to_string_lossy()
            .to_string())
    }

    fn splice(source: &str, snippets: &[(String, String)]) -> Option<String> {
        let idx = source.rfind(TIKZPICTURE_END)?;
        let mut block = String::from("\n% --- enhancer additions ---\n");
        block.push_str(COORDINATE_SAVE);
        block.push('\n');
        for (gid, snippet) in snippets {
            block.push_str(&format!("\\gid{{{gid}}}{{{snippet}}}\n"));
        }
        let mut out = String::with_capacity(source.len() + block.len());
        out.push_str(&source[..idx]);
        out.push_str(&block);
        out.push_str(&source[idx..]);
        Some(out)
    }

    fn keep_unenhanced(request: EnhancerRequest<'a>) -> EnhancementResult {
        EnhancementResult {
            blackboard: request.fallback_blackboard,
            parts: request.parts,
            segments: request.segments,
        }
    }
}

fn build_enhanced(
    description: String,
    output_path: String,
    mut parts: Vec<ElementDescriptor>,
    segments: Vec<Segment>,
    layout_out: LayoutOutput,
) -> EnhancementResult {
    let blackboard = Blackboard::new(description, Some(output_path));
    parts.extend(layout_out.new_parts);
    let segments = apply_reveals(segments, layout_out.reveals);
    EnhancementResult {
        blackboard,
        parts,
        segments,
    }
}

fn apply_reveals(mut segments: Vec<Segment>, reveals: Vec<(String, usize)>) -> Vec<Segment> {
    if segments.is_empty() {
        return segments;
    }
    let last_idx = segments.len() - 1;
    for (gid, seg_idx) in reveals {
        let idx = seg_idx.min(last_idx);
        append_reveal(&mut segments[idx], gid);
    }
    segments
}

fn append_reveal(segment: &mut Segment, gid: String) {
    if let Some(targets) = segment.actions.iter_mut().find_map(|act| {
        if let SegmentAction::Reveal { targets } = act {
            Some(targets)
        } else {
            None
        }
    }) {
        targets.push(gid);
    } else {
        segment.actions.push(SegmentAction::Reveal {
            targets: vec![gid],
        });
    }
}
