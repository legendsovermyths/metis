use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::{LazyLock, Mutex};

use chrono::Local;

const PREVIEW_LIMIT: usize = 200;

static LOGGER: LazyLock<Mutex<Logger>> = LazyLock::new(|| Mutex::new(Logger::new()));

#[derive(Clone, Copy, PartialEq, Eq, PartialOrd, Ord)]
pub enum Level {
    Debug,
    Info,
    Warn,
    Error,
}

impl Level {
    fn label(self) -> &'static str {
        match self {
            Level::Debug => "DEBUG",
            Level::Info => "INFO ",
            Level::Warn => "WARN ",
            Level::Error => "ERROR",
        }
    }
}

fn min_level() -> Level {
    if cfg!(debug_assertions) {
        Level::Debug
    } else {
        Level::Info
    }
}

pub fn init() {
    LazyLock::force(&LOGGER);
}

pub fn log(level: Level, target: &str, message: String) {
    if level < min_level() {
        return;
    }
    LOGGER
        .lock()
        .expect("logger lock poisoned")
        .write(level, target, &message);
}

pub trait Loggable {
    fn log_target(&self) -> &'static str;
    fn log_summary(&self) -> String;
    fn log_level(&self) -> Level {
        Level::Info
    }
}

pub fn record(item: &impl Loggable) {
    log(item.log_level(), item.log_target(), item.log_summary());
}

pub fn preview(content: &str) -> String {
    let flat = flatten(content);
    let count = flat.chars().count();
    if count > PREVIEW_LIMIT {
        let head: String = flat.chars().take(PREVIEW_LIMIT).collect();
        format!("{head}… ({count} chars)")
    } else {
        flat
    }
}

fn flatten(s: &str) -> String {
    s.replace(['\n', '\r'], " ")
}

struct Logger {
    log_file: PathBuf,
}

impl Logger {
    fn new() -> Self {
        let log_dir = crate::utils::paths::logs_dir();

        let session_ts = Local::now().format("%Y-%m-%d_%H-%M-%S");
        let log_file = log_dir.join(format!("session_{session_ts}.log"));

        let header = format!("METIS V2 - Session Log\nStarted at {session_ts}\n\n");
        let mut file = fs::File::create(&log_file).expect("Failed to create log file");
        file.write_all(header.as_bytes())
            .expect("Failed to write log header");

        Self { log_file }
    }

    fn write(&self, level: Level, target: &str, message: &str) {
        let ts = Local::now().format("%H:%M:%S");
        let line = format!(
            "[{ts}] {level} {target} — {message}\n",
            level = level.label(),
            message = flatten(message),
        );

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.log_file)
            .expect("Failed to open log file");
        file.write_all(line.as_bytes())
            .expect("Failed to write log line");

        print!("{line}");
        let _ = std::io::stdout().flush();
    }
}

#[macro_export]
macro_rules! debug {
    ($($arg:tt)*) => {
        $crate::logs::log($crate::logs::Level::Debug, module_path!(), format!($($arg)*))
    };
}

#[macro_export]
macro_rules! info {
    ($($arg:tt)*) => {
        $crate::logs::log($crate::logs::Level::Info, module_path!(), format!($($arg)*))
    };
}

#[macro_export]
macro_rules! warn {
    ($($arg:tt)*) => {
        $crate::logs::log($crate::logs::Level::Warn, module_path!(), format!($($arg)*))
    };
}

#[macro_export]
macro_rules! error {
    ($($arg:tt)*) => {
        $crate::logs::log($crate::logs::Level::Error, module_path!(), format!($($arg)*))
    };
}
