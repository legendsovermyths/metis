use std::sync::{Arc, Mutex};

use serde::Deserialize;
use serde_json::Value;

use crate::{
    api::request::handler::BoxFuture,
    app::{book::Book, AppContext},
    db::repo::{self, books::BooksRepo},
    error::Result,
};

#[derive(Deserialize)]
pub struct GetAllBooksParams;
pub fn get_all_books(_: GetAllBooksParams, _context: &AppContext) -> BoxFuture {
    Box::pin(async move {
        let books: Vec<Book> = BooksRepo::list()?
            .iter()
            .map(|item| Book::new(item.id, item.title.clone(), item.toc.clone()))
            .collect();
        Ok(serde_json::to_value(books)?)
    })
}
