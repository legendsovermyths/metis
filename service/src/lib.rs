use std::sync::Mutex;

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
        .manage(Mutex::new(app))
        .invoke_handler(tauri::generate_handler![handle_request])
        .setup(|app| {
            if cfg!(debug_assertions) {
                app.handle().plugin(
                    tauri_plugin_log::Builder::default()
                        .level(log::LevelFilter::Info)
                        .build(),
                )?;
            }
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[tauri::command]
fn handle_request(app: tauri::State<Mutex<App>>, request: Request) -> Response {
    let response = app.lock().unwrap().handle_request(request);
    match response {
        Ok(val) => Response::ok(val),
        Err(err) => Response::err(err.to_string()),
    }
}
