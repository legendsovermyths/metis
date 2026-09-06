use serde::Deserialize;

use crate::{
    app::{dialogue::Dialogue, AppContext},
    db::repo::Repository,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct CommitAttemptParams {
    pub dialogue_id: i64,
    pub chosen: String,
    pub reasoning: String,
}

pub fn commit_attempt(params: CommitAttemptParams, _: &AppContext) -> BoxFuture<'_> {
    Box::pin(async move {
        let mut dialogue = Repository::<Dialogue>::find_by_id(&params.dialogue_id)?;
        {
            let mut guard = dialogue.write();
            guard.content.push_str(&format!(
                "\n\n### Attempt\n\nChosen: {}\n\nReasoning: {}\n",
                params.chosen.trim(),
                params.reasoning.trim(),
            ));
        }
        Ok(serde_json::to_value(dialogue.read())?.into())
    })
}
