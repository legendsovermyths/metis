use printpdf::{Mm, Op, PdfDocument, PdfPage, PdfSaveOptions, RawImage, XObjectTransform};

use crate::{
    error::{MetisError, Result},
    llm_client::{clients::gemini::client::GeminiClient, llm_client::LLMClient},
    prompts::get_prompt_provider,
};

pub async fn convert_image_to_markdown(image_path: &str, mime: &str) -> Result<String> {
    let mut convertor_client = GeminiClient::new();
    convertor_client.set_file_mime_type(mime);
    let system_prompt = get_prompt_provider().get_image_to_markdown();

    convertor_client.set_system_prompt(system_prompt.to_string());

    let content = convertor_client
        .generate_with_file(String::from("Convert this file to markdown"), image_path)
        .await?
        .text();

    Ok(content)
}

pub fn image_bytes_to_pdf(image_bytes: &[u8]) -> Result<Vec<u8>> {
    let mut warnings = Vec::new();

    let raw_image = RawImage::decode_from_bytes(image_bytes, &mut warnings).map_err(|err| {
        MetisError::ValueParseError(format!("Cannot read image bytes: {}", err.to_string()))
    })?;

    let width_mm = Mm(raw_image.width as f32 * 0.264583);
    let height_mm = Mm(raw_image.height as f32 * 0.264583);

    let mut doc = PdfDocument::new("image");

    let image_id = doc.add_image(&raw_image);

    let page = PdfPage::new(
        width_mm,
        height_mm,
        vec![Op::UseXobject {
            id: image_id,
            transform: XObjectTransform {
                dpi: Some(96.0),
                ..Default::default()
            },
        }],
    );

    doc.with_pages(vec![page]);

    let mut pdf_warnings = Vec::new();

    let save_options = PdfSaveOptions {
        image_optimization: None,
        ..PdfSaveOptions::default()
    };
    let pdf_bytes = doc.save(&save_options, &mut pdf_warnings);

    Ok(pdf_bytes)
}
