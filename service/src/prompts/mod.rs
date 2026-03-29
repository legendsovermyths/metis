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
    pub fn get_page_to_md_prompt(&self, page_number: usize) -> String {
        format!("{}\n\nExtract page {} of this PDF.", self.page_to_md_prompt, page_number)
    }
    pub fn get_topic_mapper_prompt(&self, topics: &str) -> String {
        format!("{}\n\n## Topics to map\n\n{}", self.topic_mapper_prompt, topics)
    }
}
