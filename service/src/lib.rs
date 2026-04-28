use std::sync::Arc;

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
pub mod utils;
pub mod task;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let context = init_context().expect("failed to initialize context");
    let app = App::new(context).expect("failed to initialize App");
    tauri::Builder::default()
        .manage(Arc::new(app))
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
