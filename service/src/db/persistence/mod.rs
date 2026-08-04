pub mod guard;

use serde::{Deserialize, Serialize};

use crate::db::{persistence::guard::PersistentGuard, object::FromDbRow};

#[derive(Deserialize, Serialize, Clone, Debug)]
#[serde(transparent)]
pub struct Persistent<T: FromDbRow> {
    data: T,
}

impl<T: FromDbRow + Send + Sync> Persistent<T> {
    pub fn write(&mut self) -> PersistentGuard<'_, T> {
        PersistentGuard {
            inner: &mut self.data,
        }
    }

    pub fn read(&self) -> &T {
        &self.data
    }

    pub fn escape(self) -> T {
        self.data
    }

    pub fn new(data: T) -> Self {
        Self { data }
    }
}
