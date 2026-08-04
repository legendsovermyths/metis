use std::ops::{Deref, DerefMut};

use crate::db::{get_database, object::FromDbRow};

pub struct PersistentGuard<'a, T: FromDbRow> {
    pub inner: &'a mut T,
}

impl<'a, T: FromDbRow> Deref for PersistentGuard<'a, T> {
    type Target = T;
    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl<'a, T: FromDbRow> DerefMut for PersistentGuard<'a, T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.inner
    }
}

impl<'a, T: FromDbRow> Drop for PersistentGuard<'a, T> {
    fn drop(&mut self) {
        let row = self.inner.into_row_type();
        if let Err(e) = get_database().update_by_id(&row) {
            crate::error!("[PersistentGuard] failed to save on drop: {e}");
        }
    }
}
