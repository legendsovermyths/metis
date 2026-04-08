use std::{
    collections::HashMap, sync::{Arc, Mutex}
};

use serde::Deserialize;
use serde_json::Value;

use crate::{
    agent::{advisor::Advisor, narrator::Narrator, onboarder::Onboarder, Agent, AgentResponse},
    app::{state::MetisPhase, AppContext},
    error::Result,
};

#[derive(Deserialize)]
pub struct AgentRequestParams {
    message: Option<String>,
}

pub struct AgentHandler {
    agents: HashMap<MetisPhase, Box<dyn Agent>>,
    context: Arc<Mutex<AppContext>>,
}

impl AgentHandler {
    pub fn with(context: Arc<Mutex<AppContext>>) -> Self {
        Self {
            agents: HashMap::new(),
            context,
        }
    }
    fn ensure_agent(&mut self) {
        let active_phase = self.context.lock().unwrap().chat_state.phase;
        if !self.agents.contains_key(&active_phase) {
            let agent = self.create_agent(active_phase);
            self.agents.insert(active_phase, agent);
        }
    }

    fn create_agent(&self, phase: MetisPhase) -> Box<dyn Agent> {
        match phase {
            MetisPhase::Onboarding => Box::new(Onboarder::new(Arc::clone(&self.context))),
            MetisPhase::Advising => Box::new(Advisor::new(Arc::clone(&self.context))),
            MetisPhase::Idle => Box::new(Advisor::new(Arc::clone(&self.context))),
            MetisPhase::Teaching => Box::new(Narrator::new(Arc::clone(&self.context))),
        }
    }

    fn get_agent(&mut self) -> &mut Box<dyn Agent> {
        self.ensure_agent();
        self.agents
            .get_mut(&self.context.lock().unwrap().chat_state.phase)
            .unwrap()
    }

    pub fn generate(&mut self, message: Option<String>)->Result<AgentResponse> {
        let agent = self.get_agent();
        let response = agent.generate(message);
        response
    }

    pub fn handle(&mut self, params: Value) -> Result<Value> {
        let params: AgentRequestParams = serde_json::from_value(params)?;
        let response = self.generate(params.message)?;
        self.context.lock().unwrap().chat_state.event_history = self.get_agent().get_event_history();
        Ok(serde_json::to_value(response)?)

    }
}
