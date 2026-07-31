use rusqlite::ToSql;

use crate::error::Result;

pub trait DbObject: Sized + Send + Sync {
    type Id: ToSql + ToString;
    fn table_name() -> &'static str;
    fn id_column() -> &'static str {
        "id"
    }
    fn id(&self) -> Self::Id;
    fn from_row(row: &rusqlite::Row) -> Result<Self>;
    fn to_params(&self) -> Vec<(&'static str, Box<dyn rusqlite::ToSql>)>;
    fn insert_params(&self) -> Vec<(&'static str, Box<dyn rusqlite::ToSql>)>;
}

pub trait FromDbRow: Sized {
    type DbRow: DbObject;
    fn from_row_type(row: Self::DbRow) -> Result<Self>;
    fn into_row_type(&self) -> Self::DbRow;
    fn on_delete(_id: &<Self::DbRow as DbObject>::Id) -> Result<()> {
        Ok(())
    }
}
