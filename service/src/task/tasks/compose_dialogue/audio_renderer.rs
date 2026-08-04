use std::{fs, path::Path};

use crate::{
    app::dialogue::segment::Segment,
    constants::{GEMINI_TTS_MODEL, GEMINI_TTS_VOICE},
    error::{MetisError, Result},
    llm_client::clients::gemini::client::GeminiClient,
    utils::{audio::transcribe, text::short_hash},
};

const TTS_DIRECTION: &str = "Read as a calm, warm woman narrating a one-on-one lesson to a student. Keep an easy, slightly brisk pace with gentle warmth and a touch of curious personality.";

pub struct AudioRendererInput {
    pub segments: Vec<Segment>,
    pub directory: String
}

pub struct AudioRendererOutput {
    pub segments: Vec<Segment>,
}

pub struct AudioRenderer;

impl AudioRenderer {
    pub fn new() -> Self {
        AudioRenderer
    }

    pub async fn render(&self, request: AudioRendererInput) -> Result<AudioRendererOutput> {
        let audio_dir = self.prepare_audio_dir(&request.directory)?;
        let segments = request.segments;

        let handles: Vec<_> = segments
            .into_iter()
            .map(|mut segment| {
                let audio_dir = audio_dir.clone();
                tokio::spawn(async move {
                    let transcript = transcribe(&segment.text).await?;
                    let audio = GeminiClient::with_model(GEMINI_TTS_MODEL)
                        .synthesize_speech(&transcript, GEMINI_TTS_VOICE, TTS_DIRECTION)
                        .await?;
                    let filename = format!("seg_{}.mp3", short_hash(&transcript));
                    let path = audio_dir.join(&filename);
                    fs::write(&path, &audio).map_err(|e| {
                        MetisError::FileReadError(format!("Failed to write audio: {e}"))
                    })?;
                    segment.transcript = Some(transcript);
                    segment.audio_path = Some(path.to_string_lossy().to_string());
                    Ok::<_, MetisError>(segment)
                })
            })
            .collect();
        let segment_results = futures::future::join_all(handles).await;
        let mut segments = Vec::new();

        for segment in segment_results {
            segments.push(segment??);
        }

        Ok(AudioRendererOutput { segments })
    }

    fn prepare_audio_dir(&self, directory: &str) -> Result<std::path::PathBuf> {
        let audio_dir = Path::new(&directory).join("audio");
        fs::create_dir_all(&audio_dir)
            .map_err(|e| MetisError::AgentError(format!("Failed to create audio dir: {e}")))?;
        fs::canonicalize(&audio_dir)
            .map_err(|e| MetisError::AgentError(format!("Failed to resolve audio path: {e}")))
    }
}
