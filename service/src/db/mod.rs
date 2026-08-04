pub mod object;
pub mod persistence;
pub mod repo;
use rusqlite::{Connection, ToSql};
use std::{
    sync::{Mutex, OnceLock},
};

use crate::{
    db::object::DbObject,
    error::{MetisError, Result},
};

static DB_INSTANCE: OnceLock<Db> = OnceLock::new();

fn get_database() -> &'static Db {
    DB_INSTANCE.get_or_init(|| Db::open(crate::utils::paths::db_path()).unwrap())
}
pub struct Db {
    pub conn: Mutex<Connection>,
}

impl Db {
    pub fn open<P: AsRef<std::path::Path>>(path: P) -> Result<Self> {
        let path = path.as_ref();
        let conn = Connection::open(path)?;
        let db = Db {
            conn: Mutex::new(conn),
        };
        db.run_migrations()?;
        Ok(db)
    }

    fn run_migrations(&self) -> rusqlite::Result<()> {
        let conn = self.conn.lock().unwrap();
        conn.execute_batch(include_str!("../../migrations/0002_create_journeys.sql"))?;
        conn.execute_batch(include_str!("../../migrations/0003_create_appdata.sql"))?;
        conn.execute_batch(include_str!("../../migrations/0004_create_dialogues.sql"))?;
        conn.execute_batch(include_str!("../../migrations/0005_create_tasks.sql"))?;
        conn.execute_batch(include_str!(
            "../../migrations/0006_create_dialogue_events.sql"
        ))?;
        conn.execute_batch(include_str!("../../migrations/0007_create_resources.sql"))?;
        conn.execute_batch(include_str!(
            "../../migrations/0008_create_explanations.sql"
        ))?;
        conn.execute_batch(include_str!("../../migrations/0009_create_folders.sql"))?;
        conn.execute_batch(include_str!("../../migrations/0010_create_notes.sql"))?;
        Ok(())
    }
    fn fetch_one_by<T: DbObject, K>(&self, column: &str, value: &K) -> Result<T>
    where
        K: ToSql + ToString,
    {
        let conn = self.conn.lock().unwrap();
        let sql = format!(
            "SELECT * FROM {} WHERE {} = ?1 LIMIT 1",
            T::table_name(),
            column
        );

        let mut stmt = conn.prepare(&sql)?;
        let mut rows = stmt.query(rusqlite::params![value])?;

        match rows.next()? {
            Some(row) => Ok(T::from_row(row)?),
            None => Err(MetisError::ParamsError(format!(
                "no entry found for at the table {}, for column {} with value {}",
                T::table_name(),
                column,
                value.to_string()
            ))),
        }
    }

    fn try_fetch_one_by<T: DbObject, K>(&self, column: &str, value: &K) -> Result<Option<T>>
    where
        K: ToSql + ToString,
    {
        let conn = self.conn.lock().unwrap();
        let sql = format!(
            "SELECT * FROM {} WHERE {} = ?1 LIMIT 1",
            T::table_name(),
            column
        );

        let mut stmt = conn.prepare(&sql)?;
        let mut rows = stmt.query(rusqlite::params![value])?;

        match rows.next()? {
            Some(row) => Ok(Some(T::from_row(row)?)),
            None => Ok(None),
        }
    }
    fn update_by_id<T: DbObject>(&self, obj: &T) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let params = obj.to_params();

        let set_clause = params
            .iter()
            .enumerate()
            .map(|(i, (col, _))| format!("{col} = ?{}", i + 1))
            .collect::<Vec<_>>()
            .join(", ");

        let sql = format!(
            "UPDATE {} SET {set_clause} WHERE {} = ?{}",
            T::table_name(),
            T::id_column(),
            params.len() + 1
        );

        let mut bound: Vec<&dyn rusqlite::ToSql> = params.iter().map(|(_, v)| v.as_ref()).collect();
        let id = obj.id();
        bound.push(&id);

        conn.execute(&sql, bound.as_slice())?;
        Ok(())
    }

    fn insert<T: DbObject>(&self, obj: &T) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        let params = obj.insert_params();

        let columns: Vec<&str> = params.iter().map(|(col, _)| *col).collect();
        let placeholders: Vec<String> = (1..=params.len()).map(|i| format!("?{i}")).collect();

        let sql = format!(
            "INSERT INTO {} ({}) VALUES ({})",
            T::table_name(),
            columns.join(", "),
            placeholders.join(", ")
        );

        let bound: Vec<&dyn rusqlite::ToSql> = params.iter().map(|(_, v)| v.as_ref()).collect();
        conn.execute(&sql, bound.as_slice())?;

        Ok(conn.last_insert_rowid())
    }

    fn fetch_all_by<T: DbObject, K>(&self, column: &str, value: &K) -> Result<Vec<T>>
    where
        K: ToSql + ToString,
    {
        let conn = self.conn.lock().unwrap();
        let sql = format!("SELECT * FROM {} WHERE {} = ?1", T::table_name(), column);
        let mut stmt = conn.prepare(&sql)?;
        let mut rows = stmt.query(rusqlite::params![value])?;
        let mut out = Vec::new();
        while let Some(row) = rows.next()? {
            out.push(T::from_row(row)?);
        }
        Ok(out)
    }

    fn all<T: DbObject>(&self) -> Result<Vec<T>> {
        let conn = self.conn.lock().unwrap();
        let sql = format!("SELECT * FROM {}", T::table_name());
        let mut stmt = conn.prepare(&sql)?;
        let mut rows = stmt.query([])?;
        let mut out = Vec::new();
        while let Some(row) = rows.next()? {
            out.push(T::from_row(row)?);
        }
        Ok(out)
    }

    fn delete_by_id<T: DbObject>(&self, id: &T::Id) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let sql = format!("DELETE FROM {} WHERE {} = ?1", T::table_name(), T::id_column());
        conn.execute(&sql, rusqlite::params![id])?;
        Ok(())
    }

    fn count<T: DbObject>(&self, predicate: &str, params: &[&dyn ToSql]) -> Result<i64> {
        let conn = self.conn.lock().unwrap();
        let sql = format!("SELECT COUNT(*) FROM {} WHERE {}", T::table_name(), predicate);
        let n: i64 = conn.query_row(&sql, params, |row| row.get(0))?;
        Ok(n)
    }

    fn delete_where<T: DbObject>(&self, predicate: &str, params: &[&dyn ToSql]) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let sql = format!("DELETE FROM {} WHERE {}", T::table_name(), predicate);
        conn.execute(&sql, params)?;
        Ok(())
    }

    fn update_where<T: DbObject>(
        &self,
        set: &str,
        predicate: &str,
        params: &[&dyn ToSql],
    ) -> Result<()> {
        let conn = self.conn.lock().unwrap();
        let sql = format!("UPDATE {} SET {} WHERE {}", T::table_name(), set, predicate);
        conn.execute(&sql, params)?;
        Ok(())
    }

    fn insert_many<T: DbObject>(&self, rows: &[T]) -> Result<()> {
        let Some(first) = rows.first() else {
            return Ok(());
        };
        let conn = self.conn.lock().unwrap();
        let columns: Vec<&str> = first.insert_params().iter().map(|(col, _)| *col).collect();
        let placeholders: Vec<String> = (1..=columns.len()).map(|i| format!("?{i}")).collect();
        let sql = format!(
            "INSERT INTO {} ({}) VALUES ({})",
            T::table_name(),
            columns.join(", "),
            placeholders.join(", ")
        );
        let mut stmt = conn.prepare(&sql)?;
        for row in rows {
            let params = row.insert_params();
            let bound: Vec<&dyn rusqlite::ToSql> = params.iter().map(|(_, v)| v.as_ref()).collect();
            stmt.execute(bound.as_slice())?;
        }
        Ok(())
    }
}


