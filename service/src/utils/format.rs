pub fn strip_json_block(text: &str) -> &str {
    let text = text.trim();
    if text.starts_with("```json") {
        return text
            .strip_prefix("```json")
            .and_then(|s| s.strip_suffix("```"))
            .map(str::trim)
            .unwrap_or(text);
    }
    if text.starts_with("```") {
        return text
            .strip_prefix("```")
            .and_then(|s| s.strip_suffix("```"))
            .map(str::trim)
            .unwrap_or(text);
    }
    text
}

pub fn extract_json_object(text: &str) -> Option<&str> {
    let start = text.find('{')?;
    let mut depth = 0;
    for (i, ch) in text[start..].char_indices() {
        match ch {
            '{' => depth += 1,
            '}' => {
                depth -= 1;
                if depth == 0 {
                    return Some(&text[start..start + i + 1]);
                }
            }
            _ => {}
        }
    }
    None
}

pub fn clean_page_output(text: &str) -> String {
    let mut s = text.trim().to_string();

    // Strip wrapping ```markdown ... ``` fences
    if s.starts_with("```markdown") {
        s = s.strip_prefix("```markdown").unwrap().to_string();
        if s.ends_with("```") {
            s = s.strip_suffix("```").unwrap().to_string();
        }
        s = s.trim().to_string();
    } else if s.starts_with("```") {
        s = s.strip_prefix("```").unwrap().to_string();
        if s.ends_with("```") {
            s = s.strip_suffix("```").unwrap().to_string();
        }
        s = s.trim().to_string();
    }

    // Strip leading ## Page N header
    if let Some(rest) = s.strip_prefix("## Page") {
        if let Some(pos) = rest.find('\n') {
            s = rest[pos..].trim().to_string();
        }
    }

    s
}

pub fn sanitize_name(name: &str) -> String {
    name.chars()
        .map(|c| {
            if c.is_alphanumeric() || c == '-' || c == '_' {
                c
            } else {
                '_'
            }
        })
        .collect::<String>()
        .trim_matches('_')
        .to_string()
}
