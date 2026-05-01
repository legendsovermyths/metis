use std::sync::Arc;

use tauri::Manager;

use crate::{
    api::{request::Request, response::Response},
    app::{init_context, App},
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
pub mod service;
pub mod task;
pub mod utils;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let context = init_context().expect("failed to initialize context");
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![handle_request])
        .plugin(tauri_plugin_dialog::init())
        .setup(|tauri_app| {
            let log_level = if cfg!(debug_assertions) {
                log::LevelFilter::Debug
            } else {
                log::LevelFilter::Info
            };
            let app = App::new(context, tauri_app.app_handle().clone())
                .expect("failed to initialize App");
            tauri_app.manage(app);
            tauri_app.handle().plugin(
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
async fn handle_request(
    app: tauri::State<'_, Arc<App<'_>>>,
    request: Request,
) -> Result<Response, String> {
    let response = app.handle_request(request).await;
    let mut response = match response {
        Ok(val) => Response::ok(val),
        Err(err) => Response::err(err.to_string()),
    };
    let context = app.context.value().await.unwrap();
    response.context = Some(context);
    Ok(response)
}
