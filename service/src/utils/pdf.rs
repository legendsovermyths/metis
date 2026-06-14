use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
};

use crate::{
    error::{MetisError, Result},
    utils::chrome::chrome_convert_url_to_pdf,
};

const MAX_PAGES: u32 = 50;
const TARGET_TRIPLE: &str = env!("METIS_TARGET_TRIPLE");

pub fn copy_pdf(src: &str) -> Result<String> {
    let src_path = Path::new(src);
    let file_name = src_path
        .file_name()
        .ok_or(MetisError::FileNotFound)?
        .to_str()
        .ok_or(MetisError::UtilsError(
            "File name not supported".to_string(),
        ))?;

    fs::create_dir_all("../books").map_err(|e| MetisError::UtilsError(e.to_string()))?;
    let dest = format!("../books/{}", file_name);
    fs::copy(src, &dest).map_err(|e| MetisError::UtilsError(e.to_string()))?;
    Ok(dest)
}

pub fn convert_url_to_pdf(url: &str) -> Result<String> {
    chrome_convert_url_to_pdf(url)
}

pub fn truncated_copy(src: &str) -> Result<String> {
    let qpdf = find_qpdf()?;
    let total = get_page_count(src)?;

    if total <= MAX_PAGES {
        return Ok(src.to_string());
    }

    let truncated_path = format!("{}.truncated.pdf", src.trim_end_matches(".pdf"));
    run_qpdf(
        &qpdf,
        &[
            src,
            "--pages",
            ".",
            &format!("1-{}", MAX_PAGES),
            "--",
            &truncated_path,
        ],
    )?;
    Ok(truncated_path)
}

pub fn extract_page_range(src: &str, start: u32, end: u32, dest: &str) -> Result<String> {
    let qpdf = find_qpdf()?;
    let total = get_page_count(src)?;

    if start < 1 || end > total || start > end {
        return Err(MetisError::UtilsError(format!(
            "Invalid page range {}-{} for PDF with {} pages",
            start, end, total
        )));
    }

    if let Some(parent) = Path::new(dest).parent() {
        fs::create_dir_all(parent).map_err(|e| MetisError::UtilsError(e.to_string()))?;
    }

    run_qpdf(
        &qpdf,
        &[
            src,
            "--pages",
            ".",
            &format!("{}-{}", start, end),
            "--",
            dest,
        ],
    )?;
    Ok(dest.to_string())
}

fn find_qpdf() -> Result<PathBuf> {
    if let Ok(exe) = std::env::current_exe() {
        if let Some(dir) = exe.parent() {
            let named = dir.join(format!("qpdf-{}", TARGET_TRIPLE));
            if named.exists() {
                return Ok(named);
            }
            let plain = dir.join("qpdf");
            if plain.exists() {
                return Ok(plain);
            }
        }
    }
    which::which("qpdf").map_err(|_| {
        MetisError::UtilsError("qpdf not found. Install it: brew install qpdf".to_string())
    })
}

pub fn get_page_count(src: &str) -> Result<u32> {
    let qpdf = find_qpdf()?;
    let out = Command::new(qpdf)
        .args(["--show-npages", src])
        .env("DYLD_LIBRARY_PATH", "/opt/homebrew/lib")
        .output()
        .map_err(|e| MetisError::UtilsError(format!("qpdf failed: {}", e)))?;

    if !out.status.success() {
        let stderr = String::from_utf8_lossy(&out.stderr);
        return Err(MetisError::UtilsError(format!("qpdf error: {}", stderr)));
    }

    String::from_utf8_lossy(&out.stdout)
        .trim()
        .parse::<u32>()
        .map_err(|e| MetisError::UtilsError(format!("Failed to parse page count: {}", e)))
}

fn run_qpdf(qpdf: &Path, args: &[&str]) -> Result<()> {
    let out = Command::new(qpdf)
        .args(args)
        .env("DYLD_LIBRARY_PATH", "/opt/homebrew/lib")
        .output()
        .map_err(|e| MetisError::UtilsError(format!("qpdf failed: {}", e)))?;

    if !out.status.success() {
        let stderr = String::from_utf8_lossy(&out.stderr);
        return Err(MetisError::UtilsError(format!("qpdf error: {}", stderr)));
    }
    Ok(())
}
