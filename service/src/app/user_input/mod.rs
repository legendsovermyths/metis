use std::fs;

use base64::{engine::general_purpose::STANDARD, Engine};
use serde::Deserialize;

use crate::{
    error::{MetisError, Result},
    utils::{
        image::image_bytes_to_pdf,
        pdf::convert_url_to_pdf,
        text::text_to_pdf,
    },
};

#[derive(Deserialize)]
pub enum UserInput {
    File(String),
    Image { src: String, mime: String },
    Url(String),
    Text(String),
}

impl UserInput {
    pub fn to_pdf(&self) -> Result<String> {
        let temp_dir = crate::utils::paths::tmp_dir();
        let destination = temp_dir.join(format!("{}.pdf", uuid::Uuid::new_v4().to_string()));
        match self {
            Self::Url(url) => {
                let pdf_url = convert_url_to_pdf(&url)?;
                fs::copy(pdf_url, &destination)?;
                Ok(destination.to_string_lossy().to_string())
            }
            Self::File(path) => {
                fs::copy(path, &destination)?;
                Ok(destination.to_string_lossy().to_string())
            }
            Self::Image { src, mime: _ } => {
                let bytes = if let Some(rest) = src.strip_prefix("data:") {
                    let data = rest.split_once(',').map(|(_, d)| d).ok_or_else(|| {
                        MetisError::ValueParseError("malformed image data URL".into())
                    })?;
                    STANDARD
                        .decode(data)
                        .map_err(|e| MetisError::ValueParseError(e.to_string()))?
                } else {
                    fs::read(src).map_err(|e| MetisError::FileReadError(e.to_string()))?
                };
                let pdf_bytes = image_bytes_to_pdf(&bytes)?;
                fs::write(&destination, pdf_bytes)?;
                Ok(destination.to_string_lossy().to_string())
            }
            Self::Text(content) => {
                let pdf_path = text_to_pdf(&content)?;
                fs::copy(pdf_path, &destination)?;
                Ok(destination.to_string_lossy().to_string())
            }
        }
    }
}
