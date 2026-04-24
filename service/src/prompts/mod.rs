use crate::error::Result;
use std::sync::OnceLock;


static INSTANCE: OnceLock<PromptProvider> = OnceLock::new();

pub fn get_prompt_provider() -> &'static PromptProvider {
    INSTANCE.get_or_init(|| PromptProvider::configure().unwrap())
}

pub struct PromptProvider {
    analyse_book_prompt: String,
    onboarder_system_prompt: String,
    advisor_system_prompt: String,
    architect_course_prompt: String,
    page_range_prompt: String,
    page_to_md_prompt: String,
    topic_mapper_prompt: String,
    content_to_topics_prompt: String,
    narrator_system_prompt: String,
    blackboard_system_prompt: String,
    annotator_system_prompt: String,
    animator_system_prompt: String,
}

impl PromptProvider {
    fn configure() -> Result<Self> {
        Ok(PromptProvider {
            analyse_book_prompt: include_str!("markdowns/analyse_book.md").to_string(),
            onboarder_system_prompt: include_str!("markdowns/onboarder.md").to_string(),
            advisor_system_prompt: include_str!("markdowns/advisor.md").to_string(),
            architect_course_prompt: include_str!("markdowns/architect.md").to_string(),
            page_range_prompt: include_str!("markdowns/page_range.md").to_string(),
            page_to_md_prompt: include_str!("markdowns/page_to_md.md").to_string(),
            topic_mapper_prompt: include_str!("markdowns/topic_mapper.md").to_string(),
            content_to_topics_prompt: include_str!("markdowns/content_to_topics.md").to_string(),
            narrator_system_prompt: include_str!("markdowns/narrator.md").to_string(),
            blackboard_system_prompt: include_str!("markdowns/blackboard.md").to_string(),
            annotator_system_prompt: include_str!("markdowns/annotator.md").to_string(),
            animator_system_prompt: include_str!("markdowns/animator.md").to_string(),
        })
    }

    pub fn get_analyse_book_prompt(&self) -> String {
        self.analyse_book_prompt.clone()
    }
    pub fn get_onboarder_system_prompt(&self) -> String {
        self.onboarder_system_prompt.clone()
    }
    pub fn get_advisor_system_prompt(&self) -> String {
        self.advisor_system_prompt.clone()
    }
    pub fn get_architect_prompt(&self, topics: &str) -> String {
        self.architect_course_prompt.replace("{topics}", topics)
    }
    pub fn get_page_range_prompt(&self, chapter_title: &str) -> String {
        self.page_range_prompt.replace("{chapter_title}", chapter_title)
    }
    pub fn get_page_to_md_raw(&self) -> &str {
        &self.page_to_md_prompt
    }
    pub fn get_topic_mapper_prompt(&self, topics: &str) -> String {
        format!("{}\n\n## Topics to map\n\n{}", self.topic_mapper_prompt, topics)
    }
    pub fn get_content_to_topics_prompt(&self) -> String {
        self.content_to_topics_prompt.clone()
    }
    pub fn get_narrator_prompt(
        &self,
        profiler_output: &str,
        arc: &str,
        dialogue_so_far: &str,
        reference_material: &str,
        blackboard_state: &str,
    ) -> String {
        self.narrator_system_prompt
            .replace("{profiler_output}", profiler_output)
            .replace("{arc}", arc)
            .replace("{dialogue_so_far}", dialogue_so_far)
            .replace(
                "{reference_material}",
                if reference_material.is_empty() {
                    "No reference material available for this topic."
                } else {
                    reference_material
                },
            )
            .replace(
                "{blackboard_state}",
                if blackboard_state.is_empty() {
                    "The blackboard is empty."
                } else {
                    blackboard_state
                },
            )
    }

    pub fn get_blackboard_prompt(
        &self,
        instruction: &str,
        topic: &str,
        dialogue: &str,
        description: &str
    ) -> String {
        self.blackboard_system_prompt
            .replace("{instruction}", instruction)
            .replace("{topic}", topic)
            .replace("{dialogue}", dialogue)
            .replace("{description}", description)
    }

    pub fn get_annotator_prompt(
        &self,
        instruction: &str,
        dialogue: &str,
        source_code: &str,
        tree: &str,
    ) -> String {
        self.annotator_system_prompt
            .replace("{instruction}", instruction)
            .replace("{dialogue}", dialogue)
            .replace("{source_code}", source_code)
            .replace("{tree}", tree)
    }

    pub fn get_animator_prompt(&self, dialogue: &str, elements: &str) -> String {
        self.animator_system_prompt
            .replace("{dialogue}", dialogue)
            .replace("{elements}", elements)
    }
}
