use serde::de::DeserializeOwned;


pub fn json_col_to_vec<T: DeserializeOwned>(raw: Option<String>) -> Vec<T> {
    match raw {
        None => Vec::new(),
        Some(s) if s.is_empty() => Vec::new(),
        Some(s) => serde_json::from_str(&s).unwrap_or_default(),
    }
}
