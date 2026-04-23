use std::{
    fs,
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

    if !python.exists() {
        log::info!("[venv] creating python venv at {VENV_DIR}");
        let create = Command::new("python3")
            .args(["-m", "venv", VENV_DIR])
            .output();

        match create {
            Ok(out) if !out.status.success() => {
                let stderr = String::from_utf8_lossy(&out.stderr);
                return Err(MetisError::UtilsError(format!("Failed to create venv: {}", stderr)));
            }
            Err(e) => {
                return Err(MetisError::UtilsError(format!("Failed to run python3 -m venv: {}", e)));
            }
            Ok(_) => {}
        }
    }
    
    let mut missing: Vec<&str> = Vec::new();
    for pkg in REQUIRED_PACKAGES {
        let check = Command::new(&python)
            .args(["-c", &format!("import {pkg}")])
            .output();
        if !matches!(check, Ok(ref out) if out.status.success()) {
            missing.push(pkg);
        }
    }

    if !missing.is_empty() {
        log::info!("[venv] installing missing packages: {}", missing.join(", "));
        let pip = Path::new(VENV_DIR).join("bin/pip");
        let install = Command::new(pip)
            .arg("install")
            .args(&missing)
            .output();

        match install {
            Ok(out) if !out.status.success() => {
                let stderr = String::from_utf8_lossy(&out.stderr);
                return Err(MetisError::UtilsError(format!("pip install failed: {}", stderr)));
            }
            Err(e) => return Err(MetisError::UtilsError(e.to_string())),
            Ok(_) => log::info!("[venv] packages installed successfully"),
        }
    }

    Ok(())
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

/// Wraps TikZ code in a standalone LaTeX document, compiles to PDF, converts to SVG.
pub fn execute_latex(tikz_code: &str, output_path: &str) -> Result<()> {
    let pdflatex = find_latex_binary("pdflatex")?;
    let pdf2svg = find_latex_binary("pdf2svg")?;

    let tmp_dir = tempfile::tempdir()
        .map_err(|e| MetisError::AgentError(format!("Failed to create temp dir: {e}")))?;

    let tex_path = tmp_dir.path().join("figure.tex");
    let pdf_path = tmp_dir.path().join("figure.pdf");

    let document = format!(
        r#"\documentclass[tikz,border=10pt]{{standalone}}
\usepackage{{amsmath,amssymb,amsfonts}}
\usepackage{{tikz}}
\usetikzlibrary{{arrows.meta,positioning,calc,decorations.pathreplacing,shapes}}
\begin{{document}}
{tikz_code}
\end{{document}}"#
    );

    fs::write(&tex_path, &document)
        .map_err(|e| MetisError::AgentError(format!("Failed to write .tex file: {e}")))?;

    let pdf_result = Command::new(&pdflatex)
        .args([
            "-interaction=nonstopmode",
            "-halt-on-error",
            "-output-directory",
            &tmp_dir.path().to_string_lossy(),
            &tex_path.to_string_lossy(),
        ])
        .output()
        .map_err(|e| MetisError::AgentError(format!("Failed to run pdflatex: {e}")))?;

    if !pdf_result.status.success() {
        let log_path = tmp_dir.path().join("figure.log");
        let log_tail = fs::read_to_string(&log_path)
            .unwrap_or_default()
            .lines()
            .rev()
            .take(30)
            .collect::<Vec<_>>()
            .into_iter()
            .rev()
            .collect::<Vec<_>>()
            .join("\n");
        return Err(MetisError::AgentError(format!(
            "pdflatex compilation failed:\n{log_tail}"
        )));
    }

    if !pdf_path.exists() {
        return Err(MetisError::AgentError(
            "pdflatex ran but no PDF was produced".into(),
        ));
    }

    let svg_result = Command::new(&pdf2svg)
        .args([&pdf_path.to_string_lossy().to_string(), &output_path.to_string()])
        .output()
        .map_err(|e| MetisError::AgentError(format!("Failed to run pdf2svg: {e}")))?;

    if !svg_result.status.success() {
        let stderr = String::from_utf8_lossy(&svg_result.stderr);
        return Err(MetisError::AgentError(format!(
            "pdf2svg conversion failed: {stderr}"
        )));
    }

    Ok(())
}

fn find_latex_binary(name: &str) -> Result<PathBuf> {
    const SEARCH_DIRS: &[&str] = &[
        "/Library/TeX/texbin",
        "/usr/local/bin",
        "/opt/homebrew/bin",
    ];
    for dir in SEARCH_DIRS {
        let candidate = Path::new(dir).join(name);
        if candidate.exists() {
            return Ok(candidate);
        }
    }
    which::which(name)
        .map_err(|_| MetisError::AgentError(format!(
            "{name} not found. Install BasicTeX: brew install --cask basictex && brew install pdf2svg"
        )))
}
