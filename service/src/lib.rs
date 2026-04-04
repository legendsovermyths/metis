use std::sync::{Arc, Mutex};

use crate::{
    api::{request::Request, response::Response},
    app::App,
};

pub mod agent;
pub mod api;
pub mod app;
pub mod constants;
pub mod db;
pub mod error;
pub mod llm_client;
pub mod logs;
pub mod prompts;
pub mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let app = App::new().expect("failed to initialize App");
    tauri::Builder::default()
        .manage(Arc::new(Mutex::new(app)))
        .invoke_handler(tauri::generate_handler![handle_request])
        .plugin(tauri_plugin_dialog::init())
        .setup(|app| {
            let log_level = if cfg!(debug_assertions) {
                log::LevelFilter::Debug
            } else {
                log::LevelFilter::Info
            };
            app.handle().plugin(
                tauri_plugin_log::Builder::default()
                    .level(log_level)
                    .build(),
            )?;
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
async fn handle_request(app: tauri::State<'_, Arc<Mutex<App>>>, request: Request) -> Result<Response, String> {
    let app = Arc::clone(&app);
    let result = tokio::task::spawn_blocking(move || {
        let mut guard = app.lock().unwrap();
        let response = guard.handle_request(request);
        let mut response = match response {
            Ok(val) => Response::ok(val),
            Err(err) => Response::err(err.to_string()),
        };
        response.context = Some(guard.context.lock().unwrap().clone());
        response
    })
    .await
    .map_err(|e| e.to_string())?;
    Ok(result)
}
