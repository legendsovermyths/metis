use serde::Deserialize;

#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskType {
    CreateJourney,
    CreateExplanation,
    DraftDialogue,
    ComposeExplainer,
    ComposeQuestion
}

impl Into<String> for TaskType {
    fn into(self) -> String {
        match self {
            Self::CreateJourney => String::from("create_journey"),
            Self::CreateExplanation => String::from("create_explanation"),
            Self::DraftDialogue => String::from("draft_dialogue"),
            Self::ComposeExplainer => String::from("compose_explainer"),
            Self::ComposeQuestion => String::from("compose_question")
        }
    }
}

impl TryFrom<&str> for TaskType {
    type Error = ();

    fn try_from(value: &str) -> std::result::Result<Self, Self::Error> {
        match value {
            "create_journey" => Ok(Self::CreateJourney),
            "create_explanation" => Ok(Self::CreateExplanation),
            "draft_dialogue" => Ok(Self::DraftDialogue),
            "compose_explainer" => Ok(Self::ComposeExplainer),
            "compose_question" => Ok(Self::ComposeQuestion),
            _ => Err(()),
        }
    }
}
