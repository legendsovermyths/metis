use std::time::{SystemTime, UNIX_EPOCH};
const FILE_URI_TTL_SECS: u64 = 48 * 60 * 60;

pub fn is_file_uri_valid(uploaded_at: i64) -> bool {
    let now = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap()
        .as_secs();
    now.saturating_sub(uploaded_at as u64) < FILE_URI_TTL_SECS
}
