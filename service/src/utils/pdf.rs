
use std::{fs, path::Path};

use lopdf::Document;

use crate::error::{MetisError, Result};
const MAX_PAGES: u32 = 50;

pub fn copy_pdf(src: &str) -> Result<String> {
    let src_path = Path::new(src);
    let file_name = src_path
        .file_name()
        .ok_or(MetisError::FileNotFound)?
        .to_str()
        .ok_or(MetisError::UtilsError("File name not supported".to_string()))?;

    fs::create_dir_all("../books").map_err(|e| MetisError::UtilsError(e.to_string()))?;
    let dest = format!("../books/{}", file_name);
    fs::copy(src, &dest).map_err(|e| MetisError::UtilsError(e.to_string()))?;

    Ok(dest)
}

pub fn truncated_copy(src: &str) -> Result<String> {
    let mut doc = Document::load(src).map_err(|err| MetisError::UtilsError(err.to_string()))?;
    let total_pages = doc.get_pages().len() as u32;

    if total_pages <= MAX_PAGES {
        return Ok(src.to_string());
    }

    let pages_to_remove: Vec<u32> = (MAX_PAGES + 1..=total_pages).collect();
    doc.delete_pages(&pages_to_remove);

    let truncated_path = format!("{}.truncated.pdf", src.trim_end_matches(".pdf"));
    doc.save(&truncated_path).map_err(|e| MetisError::UtilsError(e.to_string()))?;
    Ok(truncated_path)
}

pub fn extract_page_range(src: &str, start: u32, end: u32, dest: &str) -> Result<String> {
    let mut doc = Document::load(src).map_err(|e| MetisError::UtilsError(e.to_string()))?;
    let total_pages = doc.get_pages().len() as u32;

    if start < 1 || end > total_pages || start > end {
        return Err(MetisError::UtilsError(format!(
            "Invalid page range {}-{} for PDF with {} pages",
            start, end, total_pages
        )));
    }

    let mut to_remove: Vec<u32> = (1..start).collect();
    to_remove.extend((end + 1)..=total_pages);
    doc.delete_pages(&to_remove);

    if let Some(parent) = Path::new(dest).parent() {
        fs::create_dir_all(parent).map_err(|e| MetisError::UtilsError(e.to_string()))?;
    }
    doc.save(dest).map_err(|e| MetisError::UtilsError(e.to_string()))?;
    Ok(dest.to_string())
}

