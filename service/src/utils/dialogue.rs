use serde_json::{json, Value};

use crate::{app::dialogue::Dialogue, db::repo::dialogue::DialoguesRepo, error::Result};


pub fn format_dialogues(dialogues: &[Dialogue]) -> String {
    if dialogues.is_empty() {
        return String::new();
    }
    let mut s = String::new();
    for d in dialogues {
        s.push_str(&format!(
            "### {} ({}, idx {})\n{}\n",
            d.heading, format_reference(d), d.idx, d.content
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

pub fn format_reference(d: &Dialogue)->String{
    match d.reference{
        crate::app::dialogue::DialogueReference::None => String::new(),
        crate::app::dialogue::DialogueReference::Explanation { explanation_id, step_idx } => format!("step {}", step_idx),
        crate::app::dialogue::DialogueReference::Journey { journey_id, arc_idx, topic_idx } => format!("arc {}, topic {}", arc_idx, topic_idx)
    }
}

pub fn get_before_dialogue(dialogue_id: i64, n: usize, inclusive: bool) -> Result<Vec<Dialogue>> {
    let anchor = DialoguesRepo::get_by_id(dialogue_id)?;
    let all = DialoguesRepo::get_for_parent(anchor.reference.kind(), anchor.reference.parent_id())?;
    let Some(pos) = all.iter().position(|d| d.id == anchor.id) else {
        return Ok(Vec::new());
    };
    let end = if inclusive { pos + 1 } else { pos };
    let start = end.saturating_sub(n);
    Ok(all[start..end].to_vec())
}

pub fn get_after_dialogue(dialogue_id: i64, n: usize) -> Result<Vec<Dialogue>> {
    let anchor = DialoguesRepo::get_by_id(dialogue_id)?;
    let all = DialoguesRepo::get_for_parent(anchor.reference.kind(), anchor.reference.parent_id())?;
    let Some(pos) = all.iter().position(|d| d.id == anchor.id) else {
        return Ok(Vec::new());
    };
    let start = pos + 1;
    let end = (start + n).min(all.len());
    Ok(all[start..end].to_vec())
}
