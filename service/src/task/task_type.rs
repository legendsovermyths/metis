#[derive(Clone, Copy)]
pub enum TaskType {
    CreateJourney,
    AnalyseBook,
    GenerateDialogues,
    InvalidTask,
}

impl Into<String> for TaskType {
    fn into(self) -> String {
        match self {
            Self::CreateJourney => String::from("create_journey"),
            Self::AnalyseBook => String::from("analyse_book"),
            Self::GenerateDialogues => String::from("generate_dialogues"),
            Self::InvalidTask => String::from("invalid_tasks"),
        }
    }
}

impl TryFrom<&str> for TaskType {
    type Error = ();

    fn try_from(value: &str) -> std::result::Result<Self, Self::Error> {
        match value {
            "create_journey" => Ok(Self::CreateJourney),
            "analyse_book" => Ok(Self::AnalyseBook),
            "generate_dialogues" => Ok(Self::GenerateDialogues),
            _ => Err(()),
        }
    }
}
