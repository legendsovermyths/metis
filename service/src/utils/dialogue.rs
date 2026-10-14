use serde_json::{json, Value};

use crate::{
    app::{
        dialogue::{
            blackboard::{Blackboard, ElementDescriptor},
            kind::DialogueKind,
            segment::Segment,
            Dialogue,
        },
        journey::{ArcTopic, JourneyArc},
    },
    db::{
        persistence::Persistent,
        repo::{dialogue::DialoguesRepo, Repository},
    },
    error::{MetisError, Result},
};

pub fn pedagogy_arc_json(arc: Option<&JourneyArc>) -> Result<String> {
    let mut value = to_value(&arc)?;
    if let Some(topics) = value.get_mut("topics").and_then(Value::as_array_mut) {
        let question = to_value(&DialogueKind::Question)?;
        topics.retain(|t| t.get("generation_kind") != Some(&question));
        for topic in topics.iter_mut() {
            if let Some(object) = topic.as_object_mut() {
                object.remove("generation_kind");
            }
        }
    }
    to_pretty(&value)
}

pub fn pedagogy_topic_json(topic: &ArcTopic) -> Result<String> {
    let mut value = to_value(&topic)?;
    if let Some(object) = value.as_object_mut() {
        object.remove("generation_kind");
    }
    to_pretty(&value)
}

fn to_value<T: serde::Serialize>(value: &T) -> Result<Value> {
    serde_json::to_value(value).map_err(|e| MetisError::JsonError(e.to_string()))
}

fn to_pretty(value: &Value) -> Result<String> {
    serde_json::to_string_pretty(value).map_err(|e| MetisError::JsonError(e.to_string()))
}

pub fn format_dialogues(dialogues: &[Dialogue]) -> String {
    if dialogues.is_empty() {
        return String::new();
    }
    let mut s = String::new();
    for d in dialogues {
        s.push_str(&format!(
            "### {} ({}, idx {})\n{}\n",
            d.heading,
            format_reference(d),
            d.idx,
            d.content
        ));
        if !d.blackboard.description.trim().is_empty() {
            s.push_str(&format!("Blackboard: {}\n", d.blackboard.description));
        }
        s.push('\n');
    }
    s
}

pub fn dialogue_to_summary(d: &Dialogue) -> Value {
    json!({
        "id": d.id,
        "reference": format_reference(d),
        "idx": d.idx,
        "heading": d.heading,
        "content": d.content,
        "blackboard": d.blackboard.description,
    })
}

pub fn format_reference(d: &Dialogue) -> String {
    match d.reference {
        crate::app::dialogue::ArtifactReference::None => String::new(),
        crate::app::dialogue::ArtifactReference::Explanation {
            explanation_id: _,
            step_idx,
        } => format!("step {}", step_idx),
        crate::app::dialogue::ArtifactReference::Journey {
            journey_id: _,
            arc_idx,
            topic_idx,
        } => format!("arc {}, topic {}", arc_idx, topic_idx),
    }
}

pub fn get_before_dialogue(dialogue_id: i64, n: usize, inclusive: bool) -> Result<Vec<Dialogue>> {
    let anchor = Repository::<Dialogue>::find_by_id(&dialogue_id)?;
    let anchor = anchor.read();
    let all = DialoguesRepo::get_for_parent(anchor.reference.kind(), anchor.reference.parent_id())?;
    let Some(pos) = all.iter().position(|p| p.read().id == anchor.id) else {
        return Ok(Vec::new());
    };
    let end = if inclusive { pos + 1 } else { pos };
    let start = end.saturating_sub(n);
    Ok(all
        .into_iter()
        .skip(start)
        .take(end.saturating_sub(start))
        .map(Persistent::escape)
        .collect())
}

pub fn get_after_dialogue(dialogue_id: i64, n: usize) -> Result<Vec<Dialogue>> {
    let anchor = Repository::<Dialogue>::find_by_id(&dialogue_id)?;
    let anchor = anchor.read();
    let all = DialoguesRepo::get_for_parent(anchor.reference.kind(), anchor.reference.parent_id())?;
    let Some(pos) = all.iter().position(|p| p.read().id == anchor.id) else {
        return Ok(Vec::new());
    };
    let start = pos + 1;
    let end = (start + n).min(all.len());
    Ok(all
        .into_iter()
        .skip(start)
        .take(end.saturating_sub(start))
        .map(Persistent::escape)
        .collect())
}

pub fn finalize_parts_and_segments(
    parts: Vec<ElementDescriptor>,
    segments: Vec<Segment>,
    blackboard: &Blackboard,
) -> (Vec<ElementDescriptor>, Vec<Segment>) {
    if blackboard.image_url.is_some() {
        return (parts, segments);
    }
    let joined_text = segments
        .iter()
        .map(|s| s.text.as_str())
        .collect::<Vec<_>>()
        .join("");
    let fallback = vec![Segment {
        text: joined_text,
        actions: Vec::new(),
        transcript: None,
        audio_path: None,
    }];
    (Vec::new(), fallback)
}
