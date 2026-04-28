pub fn svg_tree(svg: &str) -> String {
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
