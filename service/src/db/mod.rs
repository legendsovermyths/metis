pub mod repo;

use rusqlite::Connection;
use std::sync::{Mutex, OnceLock};

use crate::error::Result;

static DB_INSTANCE: OnceLock<Db> = OnceLock::new();

fn get_database() -> &'static Db {
    DB_INSTANCE.get_or_init(|| Db::open("./data/metis.db").unwrap())
}
pub struct Db {
    pub conn: Mutex<Connection>,
}

impl Db {
    pub fn open(path: &str) -> Result<Self> {
        if let Some(parent) = std::path::Path::new(path).parent() {
            std::fs::create_dir_all(parent).ok();
        }
        let conn = Connection::open(path)?;
        let db = Db {
            conn: Mutex::new(conn),
        };
        db.run_migrations()?;
        Ok(db)
    }

    fn run_migrations(&self) -> rusqlite::Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(include_str!("../../migrations/0001_create_books.sql"))?;
        conn.execute_batch(include_str!("../../migrations/0002_create_journeys.sql"))?;
        conn.execute_batch(include_str!("../../migrations/0003_create_appdata.sql"))?;
        Ok(())
    }
}
