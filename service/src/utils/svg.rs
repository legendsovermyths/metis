use std::collections::HashMap;

pub fn svg_dimensions(svg: &str) -> Option<(f64, f64)> {
    let head = &svg[..svg.len().min(1024)];
    let svg_open = head.find("<svg")?;
    let svg_close = head[svg_open..].find('>').map(|e| svg_open + e)?;
    let tag = &head[svg_open..=svg_close];
    let w = extract_attr_number(tag, "width")?;
    let h = extract_attr_number(tag, "height")?;
    Some((w, h))
}

#[derive(Debug, Clone, Copy)]
pub struct Bbox {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
}

/// Walks a dvisvgm-emitted SVG and returns an approximate bbox (in canvas pt,
/// origin at viewBox top-left, y growing downward) for every `<g id="...">`
/// group. Nested `transform` attributes are composed; `<use>`, `<text>`,
/// `<rect>`, `<line>`, and `<path>` coordinates are accumulated into each
/// enclosing group's bbox.
pub fn extract_part_bboxes(svg: &str) -> HashMap<String, Bbox> {
    let (vx, vy) = svg_viewbox_origin(svg).unwrap_or((0.0, 0.0));

    let mut result: HashMap<String, Bbox> = HashMap::new();
    let mut transform_stack: Vec<Mat> = vec![Mat::IDENTITY];
    let mut trackers: Vec<(usize, String, BboxAcc)> = Vec::new();
    let mut depth: usize = 0;

    let bytes = svg.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        if bytes[i] != b'<' {
            i += 1;
            continue;
        }
        let end = match svg[i..].find('>') {
            Some(e) => i + e + 1,
            None => break,
        };
        let tag = &svg[i..end];
        let is_close = tag.starts_with("</");
        let is_self = tag.ends_with("/>");
        let name = tag_name(tag);

        if is_close {
            if name == "g" {
                if depth > 0 {
                    depth -= 1;
                }
                if transform_stack.len() > 1 {
                    transform_stack.pop();
                }
                while let Some(last) = trackers.last() {
                    if last.0 > depth {
                        let (_, id, acc) = trackers.pop().unwrap();
                        if let Some(mut bbox) = acc.into_bbox() {
                            bbox.x -= vx;
                            bbox.y -= vy;
                            result.insert(id, bbox);
                        }
                    } else {
                        break;
                    }
                }
            }
            i = end;
            continue;
        }

        let tx = parse_transform(tag).unwrap_or(Mat::IDENTITY);
        let current = *transform_stack.last().unwrap();
        let composed = current.mul(tx);

        match name {
            "g" => {
                transform_stack.push(composed);
                depth += 1;
                if let Some(id) = extract_id(tag) {
                    trackers.push((depth, id, BboxAcc::default()));
                }
                if is_self {
                    if depth > 0 {
                        depth -= 1;
                    }
                    transform_stack.pop();
                    while let Some(last) = trackers.last() {
                        if last.0 > depth {
                            let (_, id, acc) = trackers.pop().unwrap();
                            if let Some(mut bbox) = acc.into_bbox() {
                                bbox.x -= vx;
                                bbox.y -= vy;
                                result.insert(id, bbox);
                            }
                        } else {
                            break;
                        }
                    }
                }
            }
            "use" | "text" => {
                let x = extract_attr_number(tag, "x").unwrap_or(0.0);
                let y = extract_attr_number(tag, "y").unwrap_or(0.0);
                // A glyph anchor only contributes a single point; pad ~5pt
                // vertically so single-baseline runs register a non-zero
                // height in the accumulator.
                add_point(&mut trackers, composed, x, y);
                add_point(&mut trackers, composed, x, y - 5.0);
            }
            "rect" => {
                let x = extract_attr_number(tag, "x").unwrap_or(0.0);
                let y = extract_attr_number(tag, "y").unwrap_or(0.0);
                let w = extract_attr_number(tag, "width").unwrap_or(0.0);
                let h = extract_attr_number(tag, "height").unwrap_or(0.0);
                for (px, py) in [(x, y), (x + w, y), (x, y + h), (x + w, y + h)] {
                    add_point(&mut trackers, composed, px, py);
                }
            }
            "line" => {
                let x1 = extract_attr_number(tag, "x1").unwrap_or(0.0);
                let y1 = extract_attr_number(tag, "y1").unwrap_or(0.0);
                let x2 = extract_attr_number(tag, "x2").unwrap_or(0.0);
                let y2 = extract_attr_number(tag, "y2").unwrap_or(0.0);
                for (px, py) in [(x1, y1), (x2, y2)] {
                    add_point(&mut trackers, composed, px, py);
                }
            }
            "path" => {
                for (px, py) in path_points(tag) {
                    add_point(&mut trackers, composed, px, py);
                }
            }
            _ => {}
        }
        i = end;
    }

    result
}

fn add_point(trackers: &mut [(usize, String, BboxAcc)], m: Mat, x: f64, y: f64) {
    if trackers.is_empty() {
        return;
    }
    let (tx, ty) = m.apply(x, y);
    for t in trackers.iter_mut() {
        t.2.add(tx, ty);
    }
}

fn svg_viewbox_origin(svg: &str) -> Option<(f64, f64)> {
    let head = &svg[..svg.len().min(1024)];
    let svg_open = head.find("<svg")?;
    let svg_close = head[svg_open..].find('>').map(|e| svg_open + e)?;
    let tag = &head[svg_open..=svg_close];
    let needle = " viewBox=";
    let start = tag.find(needle)?;
    let after_eq = start + needle.len();
    let rest = &tag[after_eq..];
    let quote = rest.chars().next()?;
    if quote != '"' && quote != '\'' {
        return None;
    }
    let val_end = rest[1..].find(quote)?;
    let raw = &rest[1..1 + val_end];
    let nums = tokenize_numbers(raw);
    if nums.len() < 2 {
        return None;
    }
    Some((nums[0], nums[1]))
}

fn tag_name(tag: &str) -> &str {
    let inner = tag.trim_start_matches('<').trim_start_matches('/');
    let end = inner
        .find(|c: char| c.is_whitespace() || c == '>' || c == '/')
        .unwrap_or(inner.len());
    &inner[..end]
}

#[derive(Debug, Clone, Copy)]
struct Mat {
    a: f64,
    b: f64,
    c: f64,
    d: f64,
    e: f64,
    f: f64,
}

impl Mat {
    const IDENTITY: Mat = Mat {
        a: 1.0,
        b: 0.0,
        c: 0.0,
        d: 1.0,
        e: 0.0,
        f: 0.0,
    };

    fn mul(self, o: Mat) -> Mat {
        Mat {
            a: self.a * o.a + self.c * o.b,
            b: self.b * o.a + self.d * o.b,
            c: self.a * o.c + self.c * o.d,
            d: self.b * o.c + self.d * o.d,
            e: self.a * o.e + self.c * o.f + self.e,
            f: self.b * o.e + self.d * o.f + self.f,
        }
    }

    fn apply(&self, x: f64, y: f64) -> (f64, f64) {
        (
            self.a * x + self.c * y + self.e,
            self.b * x + self.d * y + self.f,
        )
    }
}

#[derive(Debug, Clone, Copy, Default)]
struct BboxAcc {
    has: bool,
    min_x: f64,
    min_y: f64,
    max_x: f64,
    max_y: f64,
}

impl BboxAcc {
    fn add(&mut self, x: f64, y: f64) {
        if !self.has {
            self.has = true;
            self.min_x = x;
            self.max_x = x;
            self.min_y = y;
            self.max_y = y;
        } else {
            if x < self.min_x {
                self.min_x = x;
            }
            if x > self.max_x {
                self.max_x = x;
            }
            if y < self.min_y {
                self.min_y = y;
            }
            if y > self.max_y {
                self.max_y = y;
            }
        }
    }

    fn into_bbox(self) -> Option<Bbox> {
        if !self.has {
            return None;
        }
        Some(Bbox {
            x: self.min_x,
            y: self.min_y,
            w: self.max_x - self.min_x,
            h: self.max_y - self.min_y,
        })
    }
}

fn parse_transform(tag: &str) -> Option<Mat> {
    let raw = extract_attr_string(tag, "transform")?;
    let mut out = Mat::IDENTITY;
    let bytes = raw.as_bytes();
    let mut i = 0;
    while i < bytes.len() {
        while i < bytes.len() && !bytes[i].is_ascii_alphabetic() {
            i += 1;
        }
        if i >= bytes.len() {
            break;
        }
        let name_start = i;
        while i < bytes.len() && bytes[i].is_ascii_alphabetic() {
            i += 1;
        }
        let op = &raw[name_start..i];
        while i < bytes.len() && bytes[i] != b'(' {
            i += 1;
        }
        if i >= bytes.len() {
            break;
        }
        let args_start = i + 1;
        while i < bytes.len() && bytes[i] != b')' {
            i += 1;
        }
        if i > bytes.len() {
            break;
        }
        let args = &raw[args_start..i];
        let nums = tokenize_numbers(args);
        let m = match op {
            "translate" => {
                let tx = nums.first().copied().unwrap_or(0.0);
                let ty = nums.get(1).copied().unwrap_or(0.0);
                Mat {
                    a: 1.0,
                    b: 0.0,
                    c: 0.0,
                    d: 1.0,
                    e: tx,
                    f: ty,
                }
            }
            "scale" => {
                let sx = nums.first().copied().unwrap_or(1.0);
                let sy = nums.get(1).copied().unwrap_or(sx);
                Mat {
                    a: sx,
                    b: 0.0,
                    c: 0.0,
                    d: sy,
                    e: 0.0,
                    f: 0.0,
                }
            }
            "matrix" if nums.len() >= 6 => Mat {
                a: nums[0],
                b: nums[1],
                c: nums[2],
                d: nums[3],
                e: nums[4],
                f: nums[5],
            },
            _ => Mat::IDENTITY,
        };
        out = out.mul(m);
        i += 1;
    }
    Some(out)
}

fn path_points(tag: &str) -> Vec<(f64, f64)> {
    let Some(d) = extract_attr_string(tag, "d") else {
        return Vec::new();
    };
    let mut out = Vec::new();
    let chars: Vec<char> = d.chars().collect();
    let mut i = 0;
    let mut cur_x = 0.0f64;
    let mut cur_y = 0.0f64;
    let mut cmd: char = 'M';
    while i < chars.len() {
        let c = chars[i];
        if c.is_ascii_alphabetic() {
            cmd = c;
            i += 1;
            continue;
        }
        if !(c.is_ascii_digit() || c == '.' || c == '-' || c == '+') {
            i += 1;
            continue;
        }
        let n_args: usize = match cmd.to_ascii_uppercase() {
            'M' | 'L' | 'T' => 2,
            'H' | 'V' => 1,
            'C' => 6,
            'S' | 'Q' => 4,
            'A' => 7,
            'Z' => 0,
            _ => 2,
        };
        if n_args == 0 {
            i += 1;
            continue;
        }
        let mut args = Vec::with_capacity(n_args);
        while args.len() < n_args && i < chars.len() {
            let (val, ni) = match read_number(&chars, i) {
                Some(v) => v,
                None => {
                    i += 1;
                    if i >= chars.len() {
                        break;
                    }
                    continue;
                }
            };
            args.push(val);
            i = ni;
        }
        if args.len() < n_args {
            break;
        }
        let absolute = cmd.is_ascii_uppercase();
        let (ex, ey) = match cmd.to_ascii_uppercase() {
            'H' => {
                let x = if absolute { args[0] } else { cur_x + args[0] };
                (x, cur_y)
            }
            'V' => {
                let y = if absolute { args[0] } else { cur_y + args[0] };
                (cur_x, y)
            }
            'M' | 'L' | 'T' => {
                let x = args[0];
                let y = args[1];
                if absolute {
                    (x, y)
                } else {
                    (cur_x + x, cur_y + y)
                }
            }
            'C' => {
                let x = args[4];
                let y = args[5];
                if absolute {
                    (x, y)
                } else {
                    (cur_x + x, cur_y + y)
                }
            }
            'S' | 'Q' => {
                let x = args[2];
                let y = args[3];
                if absolute {
                    (x, y)
                } else {
                    (cur_x + x, cur_y + y)
                }
            }
            'A' => {
                let x = args[5];
                let y = args[6];
                if absolute {
                    (x, y)
                } else {
                    (cur_x + x, cur_y + y)
                }
            }
            _ => (cur_x, cur_y),
        };
        cur_x = ex;
        cur_y = ey;
        out.push((ex, ey));
        if cmd == 'M' {
            cmd = 'L';
        } else if cmd == 'm' {
            cmd = 'l';
        }
    }
    out
}

fn read_number(chars: &[char], mut i: usize) -> Option<(f64, usize)> {
    while i < chars.len()
        && !chars[i].is_ascii_digit()
        && chars[i] != '.'
        && chars[i] != '-'
        && chars[i] != '+'
    {
        i += 1;
    }
    if i >= chars.len() {
        return None;
    }
    let start = i;
    if chars[i] == '-' || chars[i] == '+' {
        i += 1;
    }
    let mut saw_dot = false;
    let mut saw_digit = false;
    while i < chars.len() {
        let ch = chars[i];
        if ch.is_ascii_digit() {
            saw_digit = true;
            i += 1;
        } else if ch == '.' && !saw_dot {
            saw_dot = true;
            i += 1;
        } else {
            break;
        }
    }
    if !saw_digit {
        return None;
    }
    if i < chars.len() && (chars[i] == 'e' || chars[i] == 'E') {
        i += 1;
        if i < chars.len() && (chars[i] == '-' || chars[i] == '+') {
            i += 1;
        }
        while i < chars.len() && chars[i].is_ascii_digit() {
            i += 1;
        }
    }
    let s: String = chars[start..i].iter().collect();
    s.parse::<f64>().ok().map(|v| (v, i))
}

fn tokenize_numbers(s: &str) -> Vec<f64> {
    let chars: Vec<char> = s.chars().collect();
    let mut nums = Vec::new();
    let mut i = 0;
    while i < chars.len() {
        let c = chars[i];
        let could_start = c.is_ascii_digit()
            || c == '.'
            || ((c == '-' || c == '+')
                && i + 1 < chars.len()
                && (chars[i + 1].is_ascii_digit() || chars[i + 1] == '.'));
        if !could_start {
            i += 1;
            continue;
        }
        let start = i;
        if c == '-' || c == '+' {
            i += 1;
        }
        let mut saw_dot = false;
        while i < chars.len() {
            let ch = chars[i];
            if ch.is_ascii_digit() {
                i += 1;
            } else if ch == '.' && !saw_dot {
                saw_dot = true;
                i += 1;
            } else {
                break;
            }
        }
        if i < chars.len() && (chars[i] == 'e' || chars[i] == 'E') {
            i += 1;
            if i < chars.len() && (chars[i] == '-' || chars[i] == '+') {
                i += 1;
            }
            while i < chars.len() && chars[i].is_ascii_digit() {
                i += 1;
            }
        }
        let num_str: String = chars[start..i].iter().collect();
        if let Ok(n) = num_str.parse::<f64>() {
            nums.push(n);
        }
    }
    nums
}

fn extract_attr_string(tag: &str, attr: &str) -> Option<String> {
    let needle = format!(" {}=", attr);
    let start = tag.find(&needle)?;
    let after_eq = start + needle.len();
    let rest = &tag[after_eq..];
    let quote = rest.chars().next()?;
    if quote != '"' && quote != '\'' {
        return None;
    }
    let val = &rest[1..];
    let val_end = val.find(quote)?;
    Some(val[..val_end].to_string())
}

fn extract_attr_number(tag: &str, attr: &str) -> Option<f64> {
    let needle = format!(" {}=", attr);
    let start = tag.find(&needle)?;
    let after_eq = start + needle.len();
    let rest = &tag[after_eq..];
    let quote = rest.chars().next()?;
    if quote != '"' && quote != '\'' {
        return None;
    }
    let val = &rest[1..];
    let val_end = val.find(quote)?;
    let raw = &val[..val_end];
    let num: String = raw
        .chars()
        .take_while(|c| c.is_ascii_digit() || *c == '.' || *c == '-')
        .collect();
    num.parse::<f64>().ok()
}

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
