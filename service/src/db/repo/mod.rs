use std::marker::PhantomData;

use rusqlite::ToSql;

use crate::{
    db::{
        get_database,
        object::{DbObject, FromDbRow},
        persistence::Persistent,
    },
    error::Result,
};

pub mod appdata;
pub mod dialogue;
pub mod dialogue_events;
pub mod explanations;
pub mod folders;
pub mod journeys;
pub mod notes;
pub mod resources;
pub mod task;

pub struct Repository<T: FromDbRow> {
    marker: PhantomData<T>,
}

impl<T: FromDbRow + Send + Sync> Repository<T> {
    pub fn find_by_id(id: &<T::DbRow as DbObject>::Id) -> Result<Persistent<T>> {
        let fetched = get_database().fetch_one_by::<T::DbRow, _>(T::DbRow::id_column(), id)?;
        Ok(Persistent::new(T::from_row_type(fetched)?))
    }

    pub fn try_find_by_id(id: &<T::DbRow as DbObject>::Id) -> Result<Option<Persistent<T>>> {
        match get_database().try_fetch_one_by::<T::DbRow, _>(T::DbRow::id_column(), id)? {
            Some(row) => Ok(Some(Persistent::new(T::from_row_type(row)?))),
            None => Ok(None),
        }
    }

    pub fn find_one_by(column_str: &str, value: impl ToSql + ToString) -> Result<Persistent<T>> {
        let fetched = get_database().fetch_one_by(column_str, &value)?;
        Ok(Persistent::new(T::from_row_type(fetched)?))
    }

    pub fn find_all_by(column: &str, value: impl ToSql + ToString) -> Result<Vec<Persistent<T>>> {
        let rows = get_database().fetch_all_by::<T::DbRow, _>(column, &value)?;
        rows.into_iter()
            .map(|r| Ok(Persistent::new(T::from_row_type(r)?)))
            .collect()
    }

    pub fn all() -> Result<Vec<Persistent<T>>> {
        let rows = get_database().all::<T::DbRow>()?;
        rows.into_iter()
            .map(|r| Ok(Persistent::new(T::from_row_type(r)?)))
            .collect()
    }

    pub fn query(sql: &str, params: &[&dyn ToSql]) -> Result<Vec<Persistent<T>>> {
        let records: Vec<T::DbRow> = {
            let conn = get_database().conn.lock().unwrap();
            let mut stmt = conn.prepare(sql)?;
            let mut rows = stmt.query(params)?;
            let mut out = Vec::new();
            while let Some(row) = rows.next()? {
                out.push(<T::DbRow as DbObject>::from_row(row)?);
            }
            out
        };
        records
            .into_iter()
            .map(|r| Ok(Persistent::new(T::from_row_type(r)?)))
            .collect()
    }

    pub fn delete(id: &<T::DbRow as DbObject>::Id) -> Result<()> {
        T::on_delete(id)?;
        get_database().delete_by_id::<T::DbRow>(id)
    }

    pub fn insert(domain: &T) -> Result<()> {
        get_database().insert(&domain.into_row_type())?;
        Ok(())
    }

    pub fn insert_many(domains: &[T]) -> Result<()> {
        let rows: Vec<T::DbRow> = domains.iter().map(|d| d.into_row_type()).collect();
        get_database().insert_many(&rows)
    }

    pub fn count(predicate: &str, params: &[&dyn ToSql]) -> Result<i64> {
        get_database().count::<T::DbRow>(predicate, params)
    }

    pub fn exists(predicate: &str, params: &[&dyn ToSql]) -> Result<bool> {
        Ok(Self::count(predicate, params)? > 0)
    }

    pub fn delete_where(predicate: &str, params: &[&dyn ToSql]) -> Result<()> {
        get_database().delete_where::<T::DbRow>(predicate, params)
    }

    pub fn update_where(set: &str, predicate: &str, params: &[&dyn ToSql]) -> Result<()> {
        get_database().update_where::<T::DbRow>(set, predicate, params)
    }
}

impl<T: FromDbRow + Send + Sync> Repository<T>
where
    <T::DbRow as DbObject>::Id: From<i64>,
{
    pub fn create(domain: T) -> Result<Persistent<T>> {
        let row = domain.into_row_type();
        let id = get_database().insert(&row)?;
        Self::find_by_id(&<T::DbRow as DbObject>::Id::from(id))
    }
}
