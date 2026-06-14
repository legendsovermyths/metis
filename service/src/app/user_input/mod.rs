use serde::Deserialize;

use crate::{
    app::user_input::resource::Resource,
    error::Result,
    utils::{
        image::convert_image_to_markdown,
        journey::convert_to_markdown,
        pdf::{convert_url_to_pdf, get_page_count},
        text::convert_text_to_markdown,
    },
};
pub mod resource;

#[derive(Deserialize)]
pub enum UserInput {
    File(String),
    Image(String),
    Url(String),
    Text(String),
}

impl UserInput {
    pub async fn to_markdown(&self) -> Result<String> {
        match self {
            Self::Url(url) => {
                let pdf_url = convert_url_to_pdf(&url)?;
                let num_pages = get_page_count(&pdf_url)?;
                Ok(convert_to_markdown(&pdf_url, num_pages as usize).await?)
            }
            Self::File(path) => {
                let num_pages = get_page_count(path)?;
                Ok(convert_to_markdown(path, num_pages as usize).await?)
            }
            Self::Image(path) => Ok(convert_image_to_markdown(path).await?),
            Self::Text(content) => Ok(convert_text_to_markdown(content).await?),
        }
    }
}
