
use serde::Deserialize;
use serde_json::{json, Value};

use crate::{
    app::{user_input::{resource::Resource, UserInput}, AppContext},
    bridges::user_input::UserInputBridge,
    db::repo::resources::ResourcesRepo,
    service::handler::BoxFuture,
};

#[derive(Deserialize)]
pub struct SubmitUserInputParams {
    pub request_id: String,
    pub inputs: Vec<UserInput>,
    pub notes: String,
}

pub fn submit_user_input(params: SubmitUserInputParams, _context: &AppContext) -> BoxFuture {
    let mut markdown = String::new();
    let mut source_count = 1;
    Box::pin(async move {
        for input in params.inputs {
            let content = input.to_markdown().await?;
            markdown.push_str(&format!("\n\n---Source-{}---\n\n", source_count));
            markdown.push_str(&content);
            source_count += 1;
        }
        
        let resource = Resource::new(markdown, params.notes.clone());
        let id = ResourcesRepo::insert(&resource)?;
        UserInputBridge::resolve(&params.request_id, id).await;
        Ok(json!({ "success": true }).into())
    })
}
