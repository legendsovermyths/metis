use std::{
    path::{Path, PathBuf},
    process::Command,
};

use uuid::Uuid;

use crate::error::{MetisError, Result};

const CHROME_HEADLESS: &str = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

fn chrome_bin() -> PathBuf {
    Path::new(CHROME_HEADLESS).to_path_buf()
}

pub fn chrome_convert_url_to_pdf(url: &str) -> Result<String> {
    let chrome_bin = chrome_bin();
    if !chrome_bin.exists() {
        return Err(MetisError::UtilsError("Chrome binary not available".to_string()));
    }

    std::fs::create_dir_all("../tmp").map_err(|e| MetisError::UtilsError(e.to_string()))?;
    let dest = format!("../tmp/{}.pdf", Uuid::new_v4());

    let output = Command::new(chrome_bin)
        .args([
            "--headless=new",
            "--disable-gpu",
            "--disable-blink-features=AutomationControlled",
            "--window-size=1280,1696",
            "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
            "--virtual-time-budget=30000",
            &format!("--print-to-pdf={}", &dest),
            url,
        ])
        .output()
        .map_err(|err| {
            MetisError::UtilsError(format!("Error executing chrome command: {}", err))
        })?;

    if !output.status.success() {
        let stderr = String::from_utf8_lossy(&output.stderr);
        return Err(MetisError::UtilsError(format!("chrome error: {}", stderr)));
    }

    Ok(dest)
}
