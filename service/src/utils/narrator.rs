use crate::app::journey::artifact::TopicRange;


pub fn load_topic_content(chapter_dir: &str, topic_name: &str) -> String {
    let topic_map_path = format!("{}/topic_map.json", chapter_dir);
    let content_md_path = format!("{}/content.md", chapter_dir);

    let topic_map: Vec<TopicRange> = std::fs::read_to_string(&topic_map_path)
        .ok()
        .and_then(|s| serde_json::from_str(&s).ok())
        .unwrap_or_default();

    let content = match std::fs::read_to_string(&content_md_path) {
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
