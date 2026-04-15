use std::{
    ops::{Deref, DerefMut},
};

use crate::db::persistence::DbObject;

pub struct PersistentGuard<'a, T: DbObject> {
    pub inner: &'a mut T,
}

impl<'a, T: DbObject> Deref for PersistentGuard<'a, T> {
    type Target = T;
    fn deref(&self) -> &Self::Target {
        &self.inner
    }
}

impl<'a, T: DbObject> DerefMut for PersistentGuard<'a, T> {
    fn deref_mut(&mut self) -> &mut Self::Target {
        &mut self.inner
    }
}

impl<'a, T: DbObject> Drop for PersistentGuard<'a, T> {
    fn drop(&mut self) {
        match self.save() {
            Err(_val) => (),
            _ => (),
        }
    }
}
