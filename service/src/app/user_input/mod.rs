use std::io::Write;

use base64::{engine::general_purpose::STANDARD, Engine};
use serde::Deserialize;

use crate::{
    app::user_input::resource::Resource,
    error::{MetisError, Result},
    utils::{
        image::convert_image_to_markdown,
        journey::convert_to_markdown,
        page::is_usable_page,
        pdf::{convert_url_to_pdf, get_page_count},
        text::convert_text_to_markdown,
    },
};
pub mod resource;

#[derive(Deserialize)]
pub enum UserInput {
    File(String),
    Image { src: String, mime: String },
    Url(String),
    Text(String),
}

impl UserInput {
    pub async fn to_markdown(&self) -> Result<String> {
        match self {
            Self::Url(url) => {
                let pdf_url = convert_url_to_pdf(&url)?;
                let num_pages = get_page_count(&pdf_url)?;
                let markdown = convert_to_markdown(&pdf_url, num_pages as usize).await?;
                if !is_usable_page(&markdown).await? {
                    return Err(MetisError::UtilsError(
                        "Couldn't read that page — it's behind a bot check or returned no content. Paste the text or upload the PDF instead.".into(),
                    ));
                }
                Ok(markdown)
            }
            Self::File(path) => {
                let num_pages = get_page_count(path)?;
                Ok(convert_to_markdown(path, num_pages as usize).await?)
            }
            Self::Image { src, mime } => match src.strip_prefix("data:") {
                Some(rest) => {
                    let data = rest
                        .split_once(',')
                        .map(|(_, d)| d)
                        .ok_or_else(|| MetisError::ValueParseError("malformed image data URL".into()))?;
                    let bytes = STANDARD
                        .decode(data)
                        .map_err(|e| MetisError::ValueParseError(e.to_string()))?;
                    let mut file = tempfile::Builder::new().suffix(".img").tempfile()?;
                    file.write_all(&bytes)?;
                    let path = file.path().to_string_lossy().into_owned();
                    Ok(convert_image_to_markdown(&path, mime).await?)
                }
                None => Ok(convert_image_to_markdown(src, mime).await?),
            },
            Self::Text(content) => Ok(convert_text_to_markdown(content).await?),
        }
    }
}
