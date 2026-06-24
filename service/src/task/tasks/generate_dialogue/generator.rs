use crate::{
    app::{
        dialogue::{
            blackboard::{Blackboard, BlackboardInstructions, ElementDescriptor},
            segment::Segment,
            Dialogue, DialogueReference,
        },
        journey::artifact::JourneyArtifacts,
    },
    db::repo::{appdata::AppDataRepo, dialogue::DialoguesRepo, journeys::JourneysRepo},
    error::{MetisError, Result},
    task::tasks::generate_dialogue::{
        curator::{Curator, CuratorRequest},
        enhancer::{Enhancer, EnhancerRequest},
        illustrator::{IllustrationRequest, IllustrationResult, Illustrator},
        narrator::{NarrateRequest, Narrator, NarratorOutput},
        GenerationParams,
    },
};

pub struct DialgoueGenerator {
    narrator: Narrator,
    curator: Curator,
    illustrator: Illustrator,
    enhancer: Enhancer,
}

impl DialgoueGenerator {
    pub fn new() -> Self {
        DialgoueGenerator {
            narrator: Narrator::new(),
            curator: Curator::new(),
            illustrator: Illustrator::new(),
            enhancer: Enhancer::new(),
        }
    }
    pub async fn generate(&mut self, request: &GenerationParams) -> Result<Dialogue> {
        let narration = self
            .narrator
            .narrate(NarrateRequest {
                dialogue_reference: request.dialogue_reference.clone(),
                parent_id: request.parent_id,
            })
            .await?;

        let blackboard_instruction = match &narration.blackboard_instructions {
            BlackboardInstructions::Detailed(s) => s.as_str(),
            BlackboardInstructions::Clear => "",
        };

        let curated = self
            .curator
            .curate(CuratorRequest {
                dialogue_content: &narration.dialogue,
                blackboard_instruction,
            })
            .await?;

        let directory = request.dialogue_reference.get_directory()?;

        let illustration = self
            .illustrator
            .illustrate(IllustrationRequest {
                dialogue: &narration.dialogue,
                instruction: blackboard_instruction,
                directory: &directory,
                parts: &curated.parts,
            })
            .await?;

        let enhanced = self
            .enhancer
            .enhance(EnhancerRequest {
                source_code: illustration.source_code.as_deref(),
                library: illustration.library.as_deref(),
                fallback_blackboard: illustration.blackboard,
                parts: curated.parts,
                segments: curated.segments,
                dialogue: &curated.dialogue,
                instruction: blackboard_instruction,
                title: &narration.title,
                chapter_dir: &directory,
            })
            .await?;

        let (final_parts, final_segments) = self.finalize_parts_and_segments(
            enhanced.parts,
            enhanced.segments,
            &enhanced.blackboard,
        );

        let dialogue = self.build_dialogue(
            narration.title,
            curated.dialogue,
            enhanced.blackboard,
            narration.topic_complete,
            final_segments,
            final_parts,
            request.dialogue_reference.clone()
        )?;
        Ok(dialogue)
    }

    fn build_dialogue(
        &self,
        heading: String,
        content: String,
        blackboard: Blackboard,
        topic_complete: bool,
        segments: Vec<Segment>,
        elements: Vec<ElementDescriptor>,
        reference: DialogueReference,
    ) -> Result<Dialogue> {
        let dialogues = DialoguesRepo::get_for_parent(reference.kind(), reference.parent_id())?;
        let last_dialogue = dialogues.last();
        let idx = match last_dialogue {
            Some(d) => d.idx + 1,
            _ => 0,
        };

        let mut dialogue_blackboard = blackboard;
        dialogue_blackboard.elements = elements;

        Ok(Dialogue {
            id: None,
            reference,
            idx,
            is_ready: true,
            content,
            blackboard: dialogue_blackboard,
            heading,
            marked_complete: topic_complete,
            visible: false,
            segments,
        })
    }

    fn finalize_parts_and_segments(
        &self,
        parts: Vec<ElementDescriptor>,
        segments: Vec<Segment>,
        blackboard: &Blackboard,
    ) -> (Vec<ElementDescriptor>, Vec<Segment>) {
        if blackboard.image_url.is_some() {
            return (parts, segments);
        }
        let joined_text = segments
            .iter()
            .map(|s| s.text.as_str())
            .collect::<Vec<_>>()
            .join("");
        let fallback = vec![Segment {
            text: joined_text,
            actions: Vec::new(),
        }];
        (Vec::new(), fallback)
    }
}
