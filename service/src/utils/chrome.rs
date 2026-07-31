use std::{
    path::{Path, PathBuf},
    process::{Command, Stdio},
    thread,
    time::{Duration, Instant},
};

use uuid::Uuid;

use crate::error::{MetisError, Result};

const CHROME_HEADLESS: &str = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";

fn chrome_bin() -> PathBuf {
    Path::new(CHROME_HEADLESS).to_path_buf()
}

pub fn chrome_convert_html_to_pdf(html: &str) -> Result<String> {
    let tmp_dir = crate::utils::paths::tmp_dir();
    let source = tmp_dir.join(format!("{}.html", Uuid::new_v4()));
    std::fs::write(&source, html).map_err(|e| MetisError::UtilsError(e.to_string()))?;
    let url = format!("file://{}", source.to_string_lossy());
    let pdf = chrome_convert_url_to_pdf(&url);
    let _ = std::fs::remove_file(&source);
    pdf
}

pub fn chrome_convert_url_to_pdf(url: &str) -> Result<String> {
    let chrome_bin = chrome_bin();
    if !chrome_bin.exists() {
        return Err(MetisError::UtilsError("Chrome binary not available".to_string()));
    }

    let tmp_dir = crate::utils::paths::tmp_dir();
    let dest = tmp_dir
        .join(format!("{}.pdf", Uuid::new_v4()))
        .to_string_lossy()
        .into_owned();
    let profile = tmp_dir.join(format!("chrome-profile-{}", Uuid::new_v4()));

    let mut child = Command::new(chrome_bin)
        .args([
            "--headless=new",
            "--disable-gpu",
            "--no-first-run",
            "--no-default-browser-check",
            &format!("--user-data-dir={}", profile.to_string_lossy()),
            "--disable-blink-features=AutomationControlled",
            "--window-size=1280,1696",
            "--user-agent=Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/149.0.0.0 Safari/537.36",
            "--virtual-time-budget=30000",
            &format!("--print-to-pdf={}", &dest),
            url,
        ])
        .stdout(Stdio::null())
        .stderr(Stdio::null())
        .spawn()
        .map_err(|err| MetisError::UtilsError(format!("Error executing chrome command: {}", err)))?;

    let deadline = Instant::now() + Duration::from_secs(60);
    let mut last_size = 0u64;
    loop {
        if matches!(child.try_wait(), Ok(Some(_))) {
            break;
        }
        if Instant::now() > deadline {
            break;
        }
        let size = std::fs::metadata(&dest).map(|m| m.len()).unwrap_or(0);
        if size > 0 && size == last_size {
            break;
        }
        last_size = size;
        thread::sleep(Duration::from_millis(300));
    }
    let _ = child.kill();
    let _ = child.wait();
    let _ = std::fs::remove_dir_all(&profile);

    if std::fs::metadata(&dest).map(|m| m.len()).unwrap_or(0) == 0 {
        return Err(MetisError::UtilsError(
            "chrome produced no output".to_string(),
        ));
    }

    Ok(dest)
}
