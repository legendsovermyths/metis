use serde::Deserialize;
use serde_json::Value;

use crate::{
    app::book::Book,
    db::repo::{self, books::BooksRepo},
    error::Result,
};

#[derive(Deserialize)]
pub struct GetAllBooksParams;
pub fn get_all_books(_: GetAllBooksParams) -> Result<Value> {
    let books: Vec<Book> = BooksRepo::list()?
        .iter()
        .map(|item| Book::new(item.id, item.title.clone(), item.toc.clone()))
        .collect();
    Ok(serde_json::to_value(books)?)
}
