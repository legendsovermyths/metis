use serde::Deserialize;

use crate::{app::journey::blackboard::BlackboardInstructions, error::Result, llm_client::{factory::{ClientType, LLMClientFactory}, llm_client::LLMClient}, prompts::get_prompt_provider, utils::format::{fix_json_escapes, strip_json_block}};



#[derive(Deserialize)]
pub struct NarratorOutput {
    pub dialogue: String,
    pub topic_complete: bool,
    pub blackboard_instructions: BlackboardInstructions,
}

pub struct NarrateRequest<'a> {
    pub profile: &'a str,
    pub arc: &'a str,
    pub dialogue_so_far: &'a str,
    pub reference_material: &'a str,
    pub blackboard_state: &'a str,
}

pub struct Narrator {
    client: Box<dyn LLMClient>,
}

impl Narrator {
    pub fn new() -> Self {
        let mut client = LLMClientFactory::get_client(ClientType::GeminiPro);
        client.set_json_mode(true);
        Self { client }
    }

    pub async fn narrate(&mut self, request: NarrateRequest<'_>) -> Result<NarratorOutput> {
        let prompt = get_prompt_provider().get_narrator_prompt(
            request.profile,
            request.arc,
            request.dialogue_so_far,
            request.reference_material,
            request.blackboard_state,
        );
        self.client.set_system_prompt(prompt);

        let response = self
            .client
            .generate("Generate the next dialogue chunk.".to_string())
            .await?;

        let raw = response.text();
        let json_str = strip_json_block(&raw);
        let fixed = fix_json_escapes(json_str);
        Ok(serde_json::from_str(&fixed)?)
    }

}


