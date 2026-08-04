use std::path::PathBuf;
use std::sync::OnceLock;

static BASE: OnceLock<PathBuf> = OnceLock::new();

pub fn base() -> &'static PathBuf {
    BASE.get_or_init(|| {
        if cfg!(debug_assertions) {
            PathBuf::from("..")
        } else {
            dirs::data_dir()
                .expect("no OS data directory available")
                .join("Metis")
        }
    })
}

fn ensured(path: PathBuf) -> PathBuf {
    let _ = std::fs::create_dir_all(&path);
    path
}

pub fn data_dir() -> PathBuf {
    ensured(base().join("data"))
}

pub fn db_path() -> PathBuf {
    data_dir().join("metis.db")
}

pub fn venv_dir() -> PathBuf {
    ensured(data_dir().join("python_venv"))
}

pub fn books_dir() -> PathBuf {
    ensured(base().join("books"))
}

pub fn resources_dir() -> PathBuf {
    ensured(base().join("Resources"))
}

pub fn artifact_dir() -> PathBuf {
    ensured(base().join("Artifacts"))
}

pub fn explanations_dir() -> PathBuf {
    ensured(base().join("explanations"))
}

pub fn logs_dir() -> PathBuf {
    ensured(base().join("metis_logs"))
}

pub fn tmp_dir() -> PathBuf {
    ensured(base().join("tmp"))
}
