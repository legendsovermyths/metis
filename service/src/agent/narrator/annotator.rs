use std::fs;

use serde::Deserialize;

use crate::{
    app::journey::blackboard::ElementDescriptor,
    error::{MetisError, Result},
    llm_client::{
        factory::{ClientType, LLMClientFactory},
        llm_client::LLMClient,
    },
    prompts::get_prompt_provider,
    utils::format::{fix_json_escapes, strip_json_block},
};

#[derive(Deserialize)]
struct Rename {
    from: String,
    to: String,
}

#[derive(Deserialize)]
struct AnnotatorOutput {
    #[serde(default)]
    renames: Vec<Rename>,
    #[serde(default)]
    elements: Vec<ElementDescriptor>,
}

pub struct AnnotationResult {
    pub elements: Vec<ElementDescriptor>,
}

pub struct Annotator {
    client: Box<dyn LLMClient>,
}

impl Annotator {
    pub fn with() -> Self {
        let client = LLMClientFactory::get_client(ClientType::GeminiFlash);
        Self { client }
    }

    pub async fn annotate(
        &mut self,
        svg_path: &str,
        source_code: &str,
        instruction: &str,
        dialogue: &str,
    ) -> Result<AnnotationResult> {
        let svg = fs::read_to_string(svg_path)
            .map_err(|e| MetisError::AgentError(format!("Failed to read svg: {e}")))?;

        let tree = svg_tree(&svg);

        let prompt = get_prompt_provider().get_annotator_prompt(instruction, dialogue, source_code, &tree);
        self.client.set_system_prompt(prompt);
        self.client.set_json_mode(true);

        let response = self
            .client
            .generate("Produce the renames and elements.".to_string())
            .await?;

        let raw = response.text();
        let json_str = strip_json_block(&raw);
        let fixed = fix_json_escapes(json_str);
        let parsed: AnnotatorOutput = match serde_json::from_str(&fixed) {
            Ok(v) => v,
            Err(e) => {
                log::error!("[annotator] failed to parse LLM response: {e}\nRaw: {raw}");
                return Ok(AnnotationResult { elements: Vec::new() });
            }
        };

        let patched = apply_renames(&svg, &parsed.renames);
        if patched != svg {
            if let Err(e) = fs::write(svg_path, &patched) {
                log::error!("[annotator] failed to write patched svg: {e}");
            }
        }

        Ok(AnnotationResult { elements: parsed.elements })
    }
}

/// Walks the SVG and produces an indented list of `<g id="...">` elements with
/// a short content hint per node. Returns only what the annotator needs to reason about.
fn svg_tree(svg: &str) -> String {
    let mut out = String::new();
    let bytes = svg.as_bytes();
    let mut depth: usize = 0;
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] != b'<' {
            i += 1;
            continue;
        }
        if svg[i..].starts_with("</g>") {
            depth = depth.saturating_sub(1);
            i += 4;
            continue;
        }
        if svg[i..].starts_with("<g ") || svg[i..].starts_with("<g\n") || svg[i..].starts_with("<g\t") {
            let end = match svg[i..].find('>') {
                Some(e) => i + e + 1,
                None => break,
            };
            let tag = &svg[i..end];
            if let Some(id) = extract_id(tag) {
                let hint = hint_after(svg, end);
                for _ in 0..depth {
                    out.push_str("  ");
                }
                out.push_str(&id);
                if let Some(h) = hint {
                    out.push_str("  ");
                    out.push_str(&h);
                }
                out.push('\n');
            }
            depth += 1;
            i = end;
            continue;
        }
        i += 1;
    }
    out
}

fn extract_id(tag: &str) -> Option<String> {
    let idx = tag.find("id=")?;
    let rest = &tag[idx + 3..];
    let quote = rest.chars().next()?;
    if quote != '"' && quote != '\'' {
        return None;
    }
    let rest = &rest[1..];
    let end = rest.find(quote)?;
    Some(rest[..end].to_string())
}

/// Looks at what immediately follows a `<g>` opening tag and returns a short content hint.
/// Picks up the first `<path d="...">` prefix or `<text>content</text>` within a small window.
fn hint_after(svg: &str, from: usize) -> Option<String> {
    let window_end = (from + 400).min(svg.len());
    let window = &svg[from..window_end];

    if let Some(p) = window.find("<path") {
        if let Some(d_rel) = window[p..].find("d=") {
            let d_eq = p + d_rel + 2;
            if let Some(q) = window[d_eq..].chars().next() {
                if q == '"' || q == '\'' {
                    let d_from = d_eq + 1;
                    let d_to = window[d_from..].find(q).map(|e| d_from + e).unwrap_or(window.len());
                    let raw = window[d_from..d_to].trim();
                    let snippet: String = raw.chars().take(40).collect();
                    return Some(format!("path: {}", snippet));
                }
            }
        }
    }

    if let Some(t) = window.find("<text") {
        if let Some(gt) = window[t..].find('>') {
            let text_from = t + gt + 1;
            if let Some(close) = window[text_from..].find("</text>") {
                let content = window[text_from..text_from + close].trim();
                if !content.is_empty() {
                    let snippet: String = content.chars().take(40).collect();
                    return Some(format!("text: \"{}\"", snippet));
                }
            }
        }
    }

    None
}

/// Replaces `id="from"` with `id="to"` for each rename, skipping invalid ones.
/// Handles both double-quoted (matplotlib) and single-quoted (dvisvgm) id attributes.
fn apply_renames(svg: &str, renames: &[Rename]) -> String {
    let mut out = svg.to_string();
    let mut used_targets: Vec<&str> = Vec::new();
    for r in renames {
        if r.from.is_empty() || r.to.is_empty() {
            continue;
        }
        let from_dq = format!("id=\"{}\"", r.from);
        let from_sq = format!("id='{}'", r.from);
        let present_dq = out.contains(&from_dq);
        let present_sq = out.contains(&from_sq);
        if !present_dq && !present_sq {
            log::warn!("[annotator] rename target not found in svg: {}", r.from);
            continue;
        }
        let to_dq = format!("id=\"{}\"", r.to);
        let to_sq = format!("id='{}'", r.to);
        let collides = used_targets.contains(&r.to.as_str())
            || (r.from != r.to && (out.contains(&to_dq) || out.contains(&to_sq)));
        if collides {
            log::warn!("[annotator] rename would collide: {} -> {}", r.from, r.to);
            continue;
        }
        if present_dq {
            out = out.replace(&from_dq, &to_dq);
        }
        if present_sq {
            out = out.replace(&from_sq, &to_sq);
        }
        used_targets.push(r.to.as_str());
    }
    out
}
