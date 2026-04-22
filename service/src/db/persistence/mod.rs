pub mod guard;

use serde::{Deserialize, Serialize};

use crate::{db::persistence::guard::PersistentGuard, error::Result};

#[derive(Deserialize, Serialize, Clone, Debug)]
pub struct Persistent<T: DbObject> {
    data: T,
}

impl<T: DbObject + Send + Sync> Persistent<T> {
    pub fn write(&mut self) -> PersistentGuard<'_, T> {
        PersistentGuard {
            inner: &mut self.data,
        }
    }

    pub fn read(&self) -> &T {
        &self.data
    }

    pub fn new(data: T) -> Self {
        Self { data }
    }
}

pub trait DbObject {
    fn save(&mut self) -> Result<()>;
}
