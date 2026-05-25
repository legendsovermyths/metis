use crate::app::journey::dialogue::Dialogue;

pub fn format_dialogues(dialogues: &[Dialogue]) -> String {
    if dialogues.is_empty() {
        return String::new();
    }
    let mut s = String::new();
    for d in dialogues {
        s.push_str(&format!(
            "### {} (arc {}, topic {}, idx {})\n{}\n",
            d.heading, d.arc_idx, d.topic_idx, d.idx, d.content
        ));
        if !d.blackboard.description.trim().is_empty() {
            s.push_str(&format!("Blackboard: {}\n", d.blackboard.description));
        }
        s.push('\n');
    }
    s
}
