fn main() {
    tauri_build::build();
    let target = std::env::var("TARGET").unwrap_or_default();
    println!("cargo:rustc-env=METIS_TARGET_TRIPLE={}", target);
}
