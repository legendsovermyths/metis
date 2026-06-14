
use std::collections::HashMap;
use std::sync::OnceLock;

use log::warn;
use serde_json::{json, Value};
use tauri::{AppHandle, Emitter};
use tokio::sync::{oneshot, Mutex};

use crate::{app::user_input::resource::Resource, db::repo::resources::ResourcesRepo, error::{MetisError, Result}};

const REQUEST_EVENT: &str = "agent:request_input";

pub struct UserInputBridge {
    app_handle: AppHandle,
    pending: Mutex<HashMap<String, oneshot::Sender<i64>>>,
}

static BRIDGE: OnceLock<UserInputBridge> = OnceLock::new();

pub fn init(app_handle: AppHandle) {
    let _ = BRIDGE.set(UserInputBridge {
        app_handle,
        pending: Mutex::new(HashMap::new()),
    });
}

fn bridge() -> Result<&'static UserInputBridge> {
    BRIDGE
        .get()
        .ok_or_else(|| MetisError::InternalError("user_input bridge not initialised".into()))
}

impl UserInputBridge {
    pub async fn request(payload: Value) -> Result<Resource> {
        let bridge = bridge()?;
        let request_id = uuid::Uuid::new_v4().to_string();

        let (tx, rx) = oneshot::channel();
        bridge.pending.lock().await.insert(request_id.clone(), tx);

        let mut obj = match payload {
            Value::Object(map) => map,
            _ => serde_json::Map::new(),
        };
        obj.insert("request_id".to_string(), json!(request_id));

        bridge
            .app_handle
            .emit(REQUEST_EVENT, Value::Object(obj))
            .map_err(|e| MetisError::InternalError(e.to_string()))?;

        let id = rx.await
            .map_err(|_| MetisError::AgentError("user input request was cancelled".into()))?;
        
        ResourcesRepo::get(id)
        
    }

    pub async fn resolve(request_id: &str, id: i64) {
        if let Some(bridge) = BRIDGE.get() {
            if let Some(tx) = bridge.pending.lock().await.remove(request_id) {
                let _ = tx.send(id);
            }
        }
    }
}
