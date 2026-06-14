use std::{
    path::{Path, PathBuf},
    process::Command,
};

use uuid::Uuid;

use crate::error::{MetisError, Result};

const CHROME_HEADLESS: &str = "../binaries/chrome-headless-shell-mac-arm64/chrome-headless-shell";

fn chrome_bin() -> PathBuf {
    Path::new(CHROME_HEADLESS).to_path_buf()
}

pub fn chrome_convert_url_to_pdf(url: &str) -> Result<String> {
    let chrome_bin = chrome_bin();
    let filename = Uuid::new_v4().to_string();
    if chrome_bin.exists() {
        let output = Command::new(chrome_bin)
            .args([
                "--no-sandbox",
                "--disable-gpu",
                &format!("--print-to-pdf=../tmp/{}.pdf", &filename),
                url,
            ])
            .output();
        if let Err(err) = output {
            return Err(MetisError::UtilsError(format!(
                "Error executing chrome command: {}",
                err.to_string()
            )));
        }
        return Ok(filename);
    }

    Err(MetisError::UtilsError(
        "Chrome binary not available".to_string(),
    ))
}
