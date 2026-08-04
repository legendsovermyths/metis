use serde::Deserialize;

#[derive(Debug, Clone, Copy, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskType {
    CreateJourney,
    CreateExplanation,
    DraftDialogue,
    ComposeDialogue
}

impl Into<String> for TaskType {
    fn into(self) -> String {
        match self {
            Self::CreateJourney => String::from("create_journey"),
            Self::CreateExplanation => String::from("create_explanation"),
            Self::DraftDialogue => String::from("draft_dialogue"),
            Self::ComposeDialogue => String::from("compose_dialogue")
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
            "compose_dialogue" => Ok(Self::ComposeDialogue),
            _ => Err(()),
        }
    }
}
