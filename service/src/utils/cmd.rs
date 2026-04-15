use std::{
    path::{Path, PathBuf},
    process::Command,
};

use crate::error::{MetisError, Result};

const VENV_DIR: &str = "../data/python_venv";
const REQUIRED_PACKAGES: &[&str] = &["matplotlib", "numpy", "seaborn"];

fn venv_python() -> PathBuf {
    Path::new(VENV_DIR).join("bin/python3")
}

pub fn ensure_venv() -> Result<()> {
    let python = venv_python();
    if python.exists() {
        return Ok(());
    }

    let create = Command::new("python3")
        .args(["-m", "venv", VENV_DIR])
        .output();

    match create {
        Ok(out) if out.status.success() => {
            let pip = Path::new(VENV_DIR).join("bin/pip");
            let install = Command::new(pip)
                .arg("install")
                .args(REQUIRED_PACKAGES)
                .output();

            match install {
                Ok(out) if !out.status.success() => {
                    let stderr = String::from_utf8_lossy(&out.stderr);
                    return Err(MetisError::UtilsError(format!("pip install failed: {}", stderr)));
                }
                Err(e) => return Err(MetisError::UtilsError(e.to_string())),
                Ok(_) => return Ok(()),
            }
        }
        Ok(out) => {
            let stderr = String::from_utf8_lossy(&out.stderr);
            return Err(MetisError::UtilsError(format!(
                "Failed to create venv: {}",
                stderr
            )));
        }
        Err(e) => {
            return Err(MetisError::UtilsError(format!(
                "Failed to run python3 -m venv: {}",
                e
            )))
        }
    }
}

pub fn execute_python(code: &str) -> Result<()> {
    let python = venv_python();
    if !python.exists() {
        return Err(MetisError::UtilsError(
            "Python venv not available. Check logs for setup errors.".into(),
        ));
    }

    let result = Command::new(python)
        .arg("-c")
        .arg(code)
        .output()
        .map_err(|e| MetisError::AgentError(format!("Failed to run python: {}", e)))?;

    if !result.status.success() {
        let stderr = String::from_utf8_lossy(&result.stderr);
        return Err(MetisError::AgentError(format!("Python error: {}", stderr)));
    }
    Ok(())
}
