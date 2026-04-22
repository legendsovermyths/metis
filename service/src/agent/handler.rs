use std::collections::HashMap;

use serde::Deserialize;
use serde_json::Value;
use tokio::sync::Mutex;

use crate::{
    agent::{advisor::Advisor, narrator::Narrator, onboarder::Onboarder, Agent},
    app::{state::MetisPhase, AppContext},
    error::{MetisError, Result},
};

#[derive(Deserialize)]
pub struct AgentRequestParams {
    message: Option<String>,
}

pub struct AgentHandler<'a> {
    agents: HashMap<MetisPhase, Mutex<Box<dyn Agent + 'a>>>,
    context: &'a AppContext,
}

impl<'a> AgentHandler<'a> {
    pub fn with(context: &'a AppContext) -> Self {
        let mut agents: HashMap<MetisPhase, Mutex<Box<dyn Agent + 'a>>> = HashMap::new();
        agents.insert(
            MetisPhase::Onboarding,
            Mutex::new(Box::new(Onboarder::new(context))),
        );
        agents.insert(
            MetisPhase::Advising,
            Mutex::new(Box::new(Advisor::new(context))),
        );
        agents.insert(
            MetisPhase::Idle,
            Mutex::new(Box::new(Advisor::new(context))),
        );
        agents.insert(
            MetisPhase::Teaching,
            Mutex::new(Box::new(Narrator::new(context))),
        );
        Self { agents, context }
    }

    pub async fn handle(&self, params: Value) -> Result<Value> {
        let params: AgentRequestParams = serde_json::from_value(params)?;
        let phase = self.context.chat.lock().await.phase;
        let agent_slot = self.agents.get(&phase).ok_or_else(|| {
            MetisError::AgentError(format!("no agent registered for phase {:?}", phase))
        })?;

        let mut agent = agent_slot.lock().await;
        let response = agent.generate(params.message).await?;
        self.context.chat.lock().await.event_history = agent.get_event_history().await;
        Ok(serde_json::to_value(response)?)
    }
}
