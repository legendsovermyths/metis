// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


fn main() {
    dotenvy::dotenv().ok();
    dotenvy::from_path(app_lib::utils::paths::base().join(".env")).ok();
    app_lib::run();
}
