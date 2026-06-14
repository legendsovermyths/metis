use std::{
    fs,
    path::{Path, PathBuf},
    process::Command,
};

use crate::error::{MetisError, Result};
pub fn execute_latex(tikz_code: &str, output_path: &str) -> Result<()> {
    let latex = find_latex_binary("latex")?;
    let dvisvgm = find_latex_binary("dvisvgm")?;

    let tmp_dir = tempfile::tempdir()
        .map_err(|e| MetisError::AgentError(format!("Failed to create temp dir: {e}")))?;

    let tex_path = tmp_dir.path().join("figure.tex");
    let dvi_path = tmp_dir.path().join("figure.dvi");

    let document = format!(
        r##"\documentclass[border=10pt]{{standalone}}
\def\pgfsysdriver{{pgfsys-dvisvgm.def}}
\usepackage{{amsmath,amssymb,amsfonts}}
\usepackage{{tikz}}
\usetikzlibrary{{arrows.meta,positioning,calc,decorations.pathreplacing,shapes}}
% Map common Unicode characters that LLMs emit (math, typography, Greek) to
% their LaTeX equivalents. Without this, e.g. a raw U+2212 minus in annotation
% text crashes the compile.
\DeclareUnicodeCharacter{{2212}}{{-}}
\DeclareUnicodeCharacter{{2013}}{{--}}
\DeclareUnicodeCharacter{{2014}}{{---}}
\DeclareUnicodeCharacter{{2018}}{{`}}
\DeclareUnicodeCharacter{{2019}}{{'}}
\DeclareUnicodeCharacter{{201C}}{{``}}
\DeclareUnicodeCharacter{{201D}}{{''}}
\DeclareUnicodeCharacter{{2026}}{{\ldots}}
\DeclareUnicodeCharacter{{00D7}}{{$\times$}}
\DeclareUnicodeCharacter{{00F7}}{{$\div$}}
\DeclareUnicodeCharacter{{00B1}}{{$\pm$}}
\DeclareUnicodeCharacter{{00B7}}{{$\cdot$}}
\DeclareUnicodeCharacter{{22C5}}{{$\cdot$}}
\DeclareUnicodeCharacter{{2192}}{{$\rightarrow$}}
\DeclareUnicodeCharacter{{2190}}{{$\leftarrow$}}
\DeclareUnicodeCharacter{{2194}}{{$\leftrightarrow$}}
\DeclareUnicodeCharacter{{21D2}}{{$\Rightarrow$}}
\DeclareUnicodeCharacter{{21D0}}{{$\Leftarrow$}}
\DeclareUnicodeCharacter{{21D4}}{{$\Leftrightarrow$}}
\DeclareUnicodeCharacter{{2261}}{{$\equiv$}}
\DeclareUnicodeCharacter{{2264}}{{$\leq$}}
\DeclareUnicodeCharacter{{2265}}{{$\geq$}}
\DeclareUnicodeCharacter{{2260}}{{$\neq$}}
\DeclareUnicodeCharacter{{2248}}{{$\approx$}}
\DeclareUnicodeCharacter{{2208}}{{$\in$}}
\DeclareUnicodeCharacter{{2209}}{{$\notin$}}
\DeclareUnicodeCharacter{{2200}}{{$\forall$}}
\DeclareUnicodeCharacter{{2203}}{{$\exists$}}
\DeclareUnicodeCharacter{{2205}}{{$\emptyset$}}
\DeclareUnicodeCharacter{{2229}}{{$\cap$}}
\DeclareUnicodeCharacter{{222A}}{{$\cup$}}
\DeclareUnicodeCharacter{{2282}}{{$\subset$}}
\DeclareUnicodeCharacter{{2286}}{{$\subseteq$}}
\DeclareUnicodeCharacter{{2283}}{{$\supset$}}
\DeclareUnicodeCharacter{{2287}}{{$\supseteq$}}
\DeclareUnicodeCharacter{{221E}}{{$\infty$}}
\DeclareUnicodeCharacter{{2202}}{{$\partial$}}
\DeclareUnicodeCharacter{{2207}}{{$\nabla$}}
\DeclareUnicodeCharacter{{2211}}{{$\sum$}}
\DeclareUnicodeCharacter{{220F}}{{$\prod$}}
\DeclareUnicodeCharacter{{222B}}{{$\int$}}
\DeclareUnicodeCharacter{{221A}}{{$\sqrt{{}}$}}
\DeclareUnicodeCharacter{{03B1}}{{$\alpha$}}
\DeclareUnicodeCharacter{{03B2}}{{$\beta$}}
\DeclareUnicodeCharacter{{03B3}}{{$\gamma$}}
\DeclareUnicodeCharacter{{03B4}}{{$\delta$}}
\DeclareUnicodeCharacter{{03B5}}{{$\epsilon$}}
\DeclareUnicodeCharacter{{03B6}}{{$\zeta$}}
\DeclareUnicodeCharacter{{03B7}}{{$\eta$}}
\DeclareUnicodeCharacter{{03B8}}{{$\theta$}}
\DeclareUnicodeCharacter{{03BB}}{{$\lambda$}}
\DeclareUnicodeCharacter{{03BC}}{{$\mu$}}
\DeclareUnicodeCharacter{{03BD}}{{$\nu$}}
\DeclareUnicodeCharacter{{03BE}}{{$\xi$}}
\DeclareUnicodeCharacter{{03C0}}{{$\pi$}}
\DeclareUnicodeCharacter{{03C1}}{{$\rho$}}
\DeclareUnicodeCharacter{{03C3}}{{$\sigma$}}
\DeclareUnicodeCharacter{{03C4}}{{$\tau$}}
\DeclareUnicodeCharacter{{03C6}}{{$\phi$}}
\DeclareUnicodeCharacter{{03C7}}{{$\chi$}}
\DeclareUnicodeCharacter{{03C8}}{{$\psi$}}
\DeclareUnicodeCharacter{{03C9}}{{$\omega$}}
\DeclareUnicodeCharacter{{0394}}{{$\Delta$}}
\DeclareUnicodeCharacter{{0398}}{{$\Theta$}}
\DeclareUnicodeCharacter{{039B}}{{$\Lambda$}}
\DeclareUnicodeCharacter{{039E}}{{$\Xi$}}
\DeclareUnicodeCharacter{{03A0}}{{$\Pi$}}
\DeclareUnicodeCharacter{{03A3}}{{$\Sigma$}}
\DeclareUnicodeCharacter{{03A6}}{{$\Phi$}}
\DeclareUnicodeCharacter{{03A8}}{{$\Psi$}}
\DeclareUnicodeCharacter{{03A9}}{{$\Omega$}}
\newcommand{{\gid}}[2]{{\begin{{scope}}[local bounding box=gid-#1]\special{{dvisvgm:raw <g id="#1">}}#2\special{{dvisvgm:raw </g>}}\end{{scope}}}}
\begin{{document}}
{tikz_code}
\end{{document}}"##
    );

    fs::write(&tex_path, &document)
        .map_err(|e| MetisError::AgentError(format!("Failed to write .tex file: {e}")))?;

    let dvi_result = Command::new(&latex)
        .args([
            "-interaction=nonstopmode",
            "-halt-on-error",
            "-output-directory",
            &tmp_dir.path().to_string_lossy(),
            &tex_path.to_string_lossy(),
        ])
        .output()
        .map_err(|e| MetisError::AgentError(format!("Failed to run latex: {e}")))?;

    if !dvi_result.status.success() {
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
            "latex compilation failed:\n{log_tail}"
        )));
    }

    if !dvi_path.exists() {
        return Err(MetisError::AgentError(
            "latex ran but no DVI was produced".into(),
        ));
    }

    let svg_result = Command::new(&dvisvgm)
        .args([
            "--no-fonts",
            &format!("--output={}", output_path),
            &dvi_path.to_string_lossy(),
        ])
        .output()
        .map_err(|e| MetisError::AgentError(format!("Failed to run dvisvgm: {e}")))?;

    if !svg_result.status.success() {
        let stderr = String::from_utf8_lossy(&svg_result.stderr);
        return Err(MetisError::AgentError(format!(
            "dvisvgm conversion failed: {stderr}"
        )));
    }

    Ok(())
}

fn find_latex_binary(name: &str) -> Result<PathBuf> {
    const SEARCH_DIRS: &[&str] = &["/Library/TeX/texbin", "/usr/local/bin", "/opt/homebrew/bin"];
    for dir in SEARCH_DIRS {
        let candidate = Path::new(dir).join(name);
        if candidate.exists() {
            return Ok(candidate);
        }
    }
    which::which(name)
        .map_err(|_| MetisError::AgentError(format!(
            "{name} not found. Install BasicTeX and dvisvgm: brew install --cask basictex && brew install dvisvgm"
        )))
}
