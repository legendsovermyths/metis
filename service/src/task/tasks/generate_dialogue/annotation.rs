use serde::Deserialize;

#[derive(Debug, Clone, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Annotation {
    Header { text: String },
    Footer { text: String },
    DidYouKnow { text: String },
    Sidenote { target_gid: String, text: String },
    Callout { target_gid: String, text: String },
    Label { target_gid: String, text: String },
}

#[derive(Debug, Default, Deserialize)]
pub struct EnhancerOutput {
    #[serde(default)]
    pub annotations: Vec<Annotation>,
}

impl Annotation {
    pub fn target_gid(&self) -> Option<&str> {
        match self {
            Annotation::Sidenote { target_gid, .. }
            | Annotation::Callout { target_gid, .. }
            | Annotation::Label { target_gid, .. } => Some(target_gid.as_str()),
            _ => None,
        }
    }

    pub fn text(&self) -> &str {
        match self {
            Annotation::Header { text }
            | Annotation::Footer { text }
            | Annotation::DidYouKnow { text }
            | Annotation::Sidenote { text, .. }
            | Annotation::Callout { text, .. }
            | Annotation::Label { text, .. } => text,
        }
    }
}
