use crate::{
    app::journey::{
        artifact::JourneyArtifacts,
        blackboard::{Blackboard, BlackboardInstructions, ElementDescriptor, Segment},
        dialogue::Dialogue,
    },
    db::repo::{appdata::AppDataRepo, dialogue::DialoguesRepo, journeys::JourneysRepo},
    error::{MetisError, Result},
    task::tasks::generate_dialogue::{
        curator::{Curator, CuratorRequest},
        illustrator::{IllustrationRequest, IllustrationResult, Illustrator},
        narrator::{NarrateRequest, Narrator, NarratorOutput},
        GenerationParams,
    },
    utils::narrator::load_topic_content,
};

pub struct DialgoueGenerator {
    narrator: Narrator,
    curator: Curator,
    illustrator: Illustrator,
}

impl DialgoueGenerator {
    pub fn new()->Self{
       DialgoueGenerator { narrator: Narrator::new(), curator: Curator::new(), illustrator: Illustrator::new() } 
    }
    pub async fn generate(&mut self, request: &GenerationParams) -> Result<Dialogue> {
        let recent_dialogues =
            DialoguesRepo::get_recent_for_journey(request.id, request.num_dialogues)?;
        let artifacts = JourneysRepo::get_artifacts(request.id)?.ok_or(MetisError::ParamsError(
            "journey id does not exist for generation of dialogues".into(),
        ))?;
        let (arc, topic, blackboard) = artifacts.get_current_state()?.ok_or(
            MetisError::AgentError("Cannot generate dialogue for finished artifact".into()),
        )?;

        let arc_json =
            serde_json::to_string_pretty(arc).map_err(|e| MetisError::JsonError(e.to_string()))?;
        let profile = AppDataRepo::get("user_profile")?.unwrap_or_default();
        let reference_material = load_topic_content(&artifacts.chapter_dir, &topic.name);

        let recent_dialogue_content = recent_dialogues
            .iter()
            .map(|dialogue| dialogue.content.clone())
            .collect::<Vec<String>>()
            .join("\n\n---\n\n");
        let narration = self
            .narrator
            .narrate(NarrateRequest {
                profile: &profile,
                arc: &arc_json,
                dialogue_so_far: &recent_dialogue_content,
                reference_material: &reference_material,
                blackboard_state: &blackboard.description,
            })
            .await?;

        let instruction = match &narration.blackboard_instructions {
            BlackboardInstructions::Detailed(s) => s.as_str(),
            BlackboardInstructions::Clear => "",
        };

        let curated = self
            .curator
            .curate(CuratorRequest {
                dialogue: &narration.dialogue,
                instruction,
                topic: &topic.name,
                previous_image_url: blackboard.image_url.as_deref(),
            })
            .await?;

        let illustration = self
            .illustrate(
                &narration,
                &curated.dialogue,
                &blackboard,
                &artifacts.chapter_dir,
                &topic.name,
                &curated.parts,
            )
            .await?;

        let (final_parts, final_segments) =
            self.finalize_parts_and_segments(curated.parts, curated.segments, &illustration.blackboard);

        let dialogue = self.build_dialogue(
            &artifacts,
            curated.dialogue,
            illustration.blackboard,
            narration.topic_complete,
            final_segments,
            final_parts,
        )?;
        Ok(dialogue)
    }

    fn build_dialogue(
        &self,
        artifacts: &JourneyArtifacts,
        content: String,
        blackboard: Blackboard,
        topic_complete: bool,
        segments: Vec<Segment>,
        elements: Vec<ElementDescriptor>,
    ) -> Result<Dialogue> {
        let progress = &artifacts.progress;
        let heading = artifacts
            .get_topic(progress.arc_idx, progress.topic_idx)
            .map(|t| t.name.clone())
            .unwrap_or_default();

        let last = DialoguesRepo::get_last_for_journey(progress.journey_id)?;
        let idx = match last {
            Some(d) if d.arc_idx == progress.arc_idx && d.topic_idx == progress.topic_idx => {
                d.idx + 1
            }
            _ => 0,
        };

        Ok(Dialogue {
            journey_id: progress.journey_id,
            arc_idx: progress.arc_idx,
            topic_idx: progress.topic_idx,
            idx,
            content,
            blackboard,
            heading,
            marked_complete: topic_complete,
            visible: false,
            segments,
            elements,
        })
    }
    async fn illustrate(
        &mut self,
        narration: &NarratorOutput,
        dialogue: &str,
        previous: &Blackboard,
        chapter_dir: &str,
        topic: &str,
        parts: &[ElementDescriptor],
    ) -> Result<IllustrationResult> {
        let instruction = match &narration.blackboard_instructions {
            BlackboardInstructions::Clear => return Ok(IllustrationResult::empty()),
            BlackboardInstructions::Detailed(s) => s.as_str(),
        };
        self.illustrator
            .illustrate(IllustrationRequest {
                dialogue,
                instruction,
                previous_instruction: &previous.description,
                chapter_dir,
                topic,
                parts,
            })
            .await
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
