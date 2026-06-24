//! Deterministic layout engine: turns semantic annotations from the enhancer
//! into TikZ snippets, gids, segment reveals, and part descriptors. The
//! enhancer never touches geometry — this module is the single source of
//! placement truth.
//!
//! Positioning itself is delegated to TikZ via named bounding boxes
//! (`gid-<target>`) and saved figure-edge coordinates (`fig-east` /
//! `fig-west`). What this module decides in Rust:
//!  - **gutter side** per anchored annotation (left or right, by which canvas
//!    half the target sits in);
//!  - **ordering** within each gutter (sorted by `target.y`);
//!  - **overflow push-down** — the yshift each slot needs so its top doesn't
//!    overlap the previous slot's bottom. This uses a heuristic text-height
//!    estimate; we can't ask TikZ for the rendered height ahead of time.
//!
//! Splice order matters: `COORDINATE_SAVE` first (so the gutter x freezes
//! before our additions extend the bbox), then anchored items, then header,
//! footer, did-you-know. Standalones evaluate `current bounding box.north/
//! south` at placement time and re-center over the combined bbox.

use std::collections::{HashMap, HashSet};

use crate::{
    app::dialogue::{blackboard::ElementDescriptor, segment::{Segment, SegmentAction}}, task::tasks::generate_dialogue::{annotation::Annotation, templates}, utils::svg::Bbox
};

pub struct LayoutInput<'a> {
    pub annotations: Vec<Annotation>,
    pub bboxes: HashMap<String, Bbox>,
    pub canvas: (f64, f64),
    pub segments: &'a [Segment],
    pub existing_part_ids: HashSet<String>,
}

#[derive(Default)]
pub struct LayoutOutput {
    pub snippets: Vec<(String, String)>,
    pub new_parts: Vec<ElementDescriptor>,
    pub reveals: Vec<(String, usize)>,
}

const LINE_HEIGHT_PT: f64 = 11.0;
const CHARS_PER_LINE: f64 = 26.0;
const SLOT_MIN_GAP_PT: f64 = 10.0;

pub fn layout(input: LayoutInput) -> LayoutOutput {
    let LayoutInput {
        annotations,
        bboxes,
        canvas: (canvas_w, _),
        segments,
        existing_part_ids,
    } = input;

    let mut counter = GidCounter::new(existing_part_ids);
    let mut out = LayoutOutput::default();

    let mut header: Option<&Annotation> = None;
    let mut footer: Option<&Annotation> = None;
    let mut dyk: Option<&Annotation> = None;
    let mut anchored: Vec<(&Annotation, Bbox)> = Vec::new();

    for ann in &annotations {
        match ann {
            Annotation::Header { .. } => {
                header.get_or_insert(ann);
            }
            Annotation::Footer { .. } => {
                footer.get_or_insert(ann);
            }
            Annotation::DidYouKnow { .. } => {
                dyk.get_or_insert(ann);
            }
            _ => {
                let Some(target) = ann.target_gid() else { continue };
                match bboxes.get(target) {
                    Some(bb) => anchored.push((ann, *bb)),
                    None => log::warn!(
                        "[layout] dropping annotation; unknown target_gid '{}'",
                        target
                    ),
                }
            }
        }
    }

    anchored.sort_by(|a, b| {
        a.1.y
            .partial_cmp(&b.1.y)
            .unwrap_or(std::cmp::Ordering::Equal)
    });

    // Per-gutter "next available y" cursor, in canvas coords (y grows down).
    // A slot whose target.y is below the cursor sits at target.y; otherwise it
    // gets pushed down to (cursor) and the cursor advances by the slot's
    // estimated height + gap.
    let mut right_cursor: f64 = f64::NEG_INFINITY;
    let mut left_cursor: f64 = f64::NEG_INFINITY;

    for (ann, bbox) in &anchored {
        let on_right = bbox.x + bbox.w / 2.0 >= canvas_w / 2.0;
        let cursor = if on_right {
            &mut right_cursor
        } else {
            &mut left_cursor
        };

        let target_gid = ann.target_gid().expect("non-anchored slipped through");
        let text = ann.text();

        let desired_y = bbox.y; // top of target in canvas coords
        let actual_y = desired_y.max(*cursor);
        let pushdown_canvas_pt = actual_y - desired_y;
        // canvas y grows down; TikZ y grows up → yshift is negative for push-down.
        let yshift_pt = -pushdown_canvas_pt;
        let est_h = estimate_height(text);
        *cursor = actual_y + est_h + SLOT_MIN_GAP_PT;

        let gid = counter.next(slot_kind(ann));
        let snippet = match ann {
            Annotation::Sidenote { .. } => {
                templates::sidenote(&gid, target_gid, on_right, yshift_pt, text)
            }
            Annotation::Callout { .. } => {
                templates::callout(&gid, target_gid, on_right, yshift_pt, text)
            }
            Annotation::Label { .. } => {
                templates::label(&gid, target_gid, on_right, yshift_pt, text)
            }
            _ => continue,
        };
        let seg = find_reveal_segment(segments, target_gid);
        push(&mut out, gid, snippet, descify(slot_kind(ann), text), seg);
    }

    let last_seg = segments.len().saturating_sub(1);

    if let Some(Annotation::Header { text }) = header {
        let gid = counter.next("header");
        push(&mut out, gid, templates::header(text), descify("Header", text), 0);
    }
    if let Some(Annotation::Footer { text }) = footer {
        let gid = counter.next("footer");
        push(&mut out, gid, templates::footer(text), descify("Footer", text), last_seg);
    }
    if let Some(Annotation::DidYouKnow { text }) = dyk {
        let gid = counter.next("did-you-know");
        push(&mut out, gid, templates::did_you_know(text), descify("Did you know", text), last_seg);
    }

    out
}

fn slot_kind(ann: &Annotation) -> &'static str {
    match ann {
        Annotation::Sidenote { .. } => "sidenote",
        Annotation::Callout { .. } => "callout",
        Annotation::Label { .. } => "label",
        _ => "anchored",
    }
}

fn push(out: &mut LayoutOutput, gid: String, snippet: String, desc: String, seg: usize) {
    out.snippets.push((gid.clone(), snippet));
    out.new_parts.push(ElementDescriptor {
        id: gid.clone(),
        desc,
    });
    out.reveals.push((gid, seg));
}

fn estimate_height(text: &str) -> f64 {
    let len = text.chars().count() as f64;
    let lines = (len / CHARS_PER_LINE).ceil().max(1.0);
    lines * LINE_HEIGHT_PT + 4.0
}

fn descify(kind: &str, text: &str) -> String {
    let snippet: String = text.chars().take(60).collect();
    format!("{kind}: {snippet}")
}

fn find_reveal_segment(segments: &[Segment], target_gid: &str) -> usize {
    for (i, seg) in segments.iter().enumerate() {
        for action in &seg.actions {
            if let SegmentAction::Reveal { targets } = action {
                if targets.iter().any(|t| t == target_gid) {
                    return i;
                }
            }
        }
    }
    0
}

struct GidCounter {
    existing: HashSet<String>,
    per_kind: HashMap<String, usize>,
}

impl GidCounter {
    fn new(existing: HashSet<String>) -> Self {
        Self {
            existing,
            per_kind: HashMap::new(),
        }
    }

    fn next(&mut self, kind: &str) -> String {
        loop {
            let n = self.per_kind.entry(kind.to_string()).or_insert(0);
            *n += 1;
            let candidate = format!("{kind}-{n}");
            if !self.existing.contains(&candidate) {
                self.existing.insert(candidate.clone());
                return candidate;
            }
        }
    }
}
