use rusqlite::{
    types::{FromSql, FromSqlError, ToSqlOutput},
    ToSql,
};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq)]
pub enum DialogueKind {
    Explainer,
    Question,
}

impl DialogueKind {
    fn as_str(&self) -> &str {
        match self {
            Self::Question => "Question",
            Self::Explainer => "Explainer",
        }
    }
}
impl FromSql for DialogueKind {
    fn column_result(value: rusqlite::types::ValueRef<'_>) -> rusqlite::types::FromSqlResult<Self> {
        match value.as_str()? {
            "Explainer" => Ok(DialogueKind::Explainer),
            "Question" => Ok(DialogueKind::Question),
            _ => Err(FromSqlError::InvalidType),
        }
    }
}

impl ToSql for DialogueKind {
    fn to_sql(&self) -> rusqlite::Result<rusqlite::types::ToSqlOutput<'_>> {
        let value = self.as_str();
        Ok(ToSqlOutput::from(value))
    }
}

impl Default for DialogueKind{
    fn default() -> Self {
        DialogueKind::Explainer
    }
}
