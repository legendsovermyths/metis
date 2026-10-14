use serde::Deserialize;

use crate::{
    app::{
        dialogue::{blackboard::BlackboardInstructions, DialogueReference},
        journey::artifact::JourneyArtifacts,
    },
    constants::QUESTION_COUNT_PER_ARC,
    db::repo::Repository,
    error::{MetisError, Result},
    llm_client::{
        factory::{GeminiModel, LLMClientFactory},
        clients::gemini::client::GeminiClient,
        llm_client::LLMClient,
    },
    prompts::get_prompt_provider,
    task::tasks::draft_dialogues::DialogueDraft,
    utils::{
        dialogue::pedagogy_arc_json,
        format::sanitize_json,
        journey::get_arc_questions,
    },
};

pub struct Questioner {
    client: GeminiClient,
}

#[derive(Deserialize)]
struct QuestionerLLMOutput {
    title: String,
    content: String,
    blackboard_instruction: BlackboardInstructions,
}

pub struct QuestionerOutput {
    pub title: String,
    pub content: String,
    pub blackboard_instruction: BlackboardInstructions,
    pub is_complete: bool,
}

pub struct QuestionerRequest {
    pub dialogue_reference: DialogueReference,
}

impl Questioner {
    pub fn new() -> Self {
        let mut client = LLMClientFactory::get_gemini_client(GeminiModel::Pro);
        client.set_json_mode(true);
        Self { client }
    }

    pub async fn prepare(&mut self, request: QuestionerRequest) -> Result<QuestionerOutput> {
        let (journey_id, arc_idx) = match request.dialogue_reference {
            DialogueReference::Journey {
                journey_id,
                arc_idx,
                ..
            } => (journey_id, arc_idx),
            _ => {
                return Err(MetisError::ParamsError(
                    "questioner requires a journey reference".to_string(),
                ))
            }
        };

        let artifact = Repository::<JourneyArtifacts>::find_by_id(&journey_id)?;
        let artifact = artifact.read();
        if artifact.get_arc(arc_idx).is_none() {
            return Err(MetisError::ParamsError(
                "invalid arc index for questioner".to_string(),
            ));
        }
        let arc_json = pedagogy_arc_json(artifact.get_arc(arc_idx))?;
        let chapter_pdf = format!("{}/chapter.pdf", artifact.chapter_dir);

        let previous = get_arc_questions(arc_idx, journey_id)?;
        let previous_joined = previous.join("\n\n---\n\n");

        let prompt = get_prompt_provider().get_questioner_prompt(&arc_json, &previous_joined);
        self.client.set_system_prompt(prompt);

        let response = self
            .client
            .generate_with_file("Produce the next problem.".to_string(), &chapter_pdf)
            .await?;
        let fixed = sanitize_json(&response.text());
        let output: QuestionerLLMOutput = serde_json::from_str(&fixed)?;

        let is_complete = get_arc_questions(arc_idx, journey_id)?.len() + 1 >= QUESTION_COUNT_PER_ARC;

        Ok(QuestionerOutput {
            title: output.title,
            content: output.content,
            blackboard_instruction: output.blackboard_instruction,
            is_complete,
        })
    }
}

impl From<QuestionerOutput> for DialogueDraft {
    fn from(output: QuestionerOutput) -> Self {
        DialogueDraft {
            title: output.title,
            content: output.content,
            blackboard_instructions: output.blackboard_instruction.to_string(),
            topic_complete: output.is_complete,
        }
    }
}
