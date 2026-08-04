use proc_macro::TokenStream;
use proc_macro2::TokenStream as TokenStream2;
use quote::quote;
use syn::{parse_macro_input, Attribute, Data, DeriveInput, Field, Fields, LitStr, Type};

#[proc_macro_derive(DbRow, attributes(db))]
pub fn derive_db_row(input: TokenStream) -> TokenStream {
    let input = parse_macro_input!(input as DeriveInput);
    match expand(input) {
        Ok(ts) => ts.into(),
        Err(e) => e.to_compile_error().into(),
    }
}

fn expand(input: DeriveInput) -> syn::Result<TokenStream2> {
    let struct_name = &input.ident;
    let table_name = extract_table_name(&input.attrs)?;

    let Data::Struct(data) = &input.data else {
        return Err(syn::Error::new_spanned(
            &input,
            "DbRow can only be derived for structs",
        ));
    };
    let Fields::Named(fields) = &data.fields else {
        return Err(syn::Error::new_spanned(
            &input,
            "DbRow requires named fields",
        ));
    };

    let mut id_field: Option<syn::Ident> = None;
    let mut id_column: Option<String> = None;
    let mut id_ty: Option<Type> = None;
    let mut from_row_fields = Vec::new();
    let mut to_params_entries = Vec::new();
    let mut insert_params_entries = Vec::new();

    for field in &fields.named {
        let field_name = field.ident.as_ref().unwrap();
        let field_attrs = parse_field_attrs(field)?;
        let column = field_attrs
            .column
            .unwrap_or_else(|| field_name.to_string());

        let read = if field_attrs.is_json {
            if is_option(&field.ty) {
                quote! {
                    #field_name: {
                        let raw: Option<String> = row.get(#column)?;
                        match raw {
                            Some(s) => Some(serde_json::from_str(&s)?),
                            None => None,
                        }
                    }
                }
            } else {
                quote! {
                    #field_name: {
                        let raw: String = row.get(#column)?;
                        serde_json::from_str(&raw)?
                    }
                }
            }
        } else {
            quote! { #field_name: row.get(#column)? }
        };
        from_row_fields.push(read);

        let value = if field_attrs.is_json {
            if is_option(&field.ty) {
                quote! { Box::new(self.#field_name.as_ref().map(|v| serde_json::to_string(v).unwrap_or_default())) as Box<dyn ::rusqlite::ToSql> }
            } else {
                quote! { Box::new(serde_json::to_string(&self.#field_name).unwrap_or_default()) as Box<dyn ::rusqlite::ToSql> }
            }
        } else {
            quote! { Box::new(self.#field_name.clone()) as Box<dyn ::rusqlite::ToSql> }
        };
        let param_entry = quote! { (#column, #value) };

        if field_attrs.is_id {
            if id_field.is_some() {
                return Err(syn::Error::new_spanned(
                    field,
                    "only one field may be marked #[db(id)]",
                ));
            }
            id_field = Some(field_name.clone());
            id_column = Some(column);
            id_ty = Some(field.ty.clone());
            if field_attrs.is_assigned {
                insert_params_entries.push(param_entry);
            }
        } else {
            insert_params_entries.push(param_entry.clone());
            if !field_attrs.is_insert_only {
                to_params_entries.push(param_entry);
            }
        }
    }

    let id_field = id_field.ok_or_else(|| {
        syn::Error::new_spanned(&input, "exactly one field must be marked #[db(id)]")
    })?;
    let id_column = id_column.unwrap();
    let id_ty = id_ty.unwrap();

    let expanded = quote! {
        impl crate::db::object::DbObject for #struct_name {
            type Id = #id_ty;

            fn table_name() -> &'static str { #table_name }
            fn id_column() -> &'static str { #id_column }
            fn id(&self) -> Self::Id { self.#id_field.clone() }

            fn from_row(row: &::rusqlite::Row) -> crate::error::Result<Self> {
                Ok(#struct_name {
                    #(#from_row_fields),*
                })
            }

            fn to_params(&self) -> Vec<(&'static str, Box<dyn ::rusqlite::ToSql>)> {
                vec![ #(#to_params_entries),* ]
            }

            fn insert_params(&self) -> Vec<(&'static str, Box<dyn ::rusqlite::ToSql>)> {
                vec![ #(#insert_params_entries),* ]
            }
        }
    };

    Ok(expanded)
}

fn is_option(ty: &Type) -> bool {
    if let Type::Path(tp) = ty {
        if let Some(seg) = tp.path.segments.last() {
            return seg.ident == "Option";
        }
    }
    false
}

// ---- attribute parsing helpers ----

fn extract_table_name(attrs: &[Attribute]) -> syn::Result<String> {
    for attr in attrs {
        if !attr.path().is_ident("db") {
            continue;
        }
        let mut table: Option<String> = None;
        attr.parse_nested_meta(|meta| {
            if meta.path.is_ident("table") {
                let value: LitStr = meta.value()?.parse()?;
                table = Some(value.value());
                Ok(())
            } else {
                Err(meta.error("unsupported db attribute on struct, expected `table`"))
            }
        })?;
        if let Some(t) = table {
            return Ok(t);
        }
    }
    Err(syn::Error::new(
        proc_macro2::Span::call_site(),
        "missing #[db(table = \"...\")] on struct",
    ))
}

struct FieldAttrs {
    is_id: bool,
    is_json: bool,
    is_insert_only: bool,
    is_assigned: bool,
    column: Option<String>,
}

fn parse_field_attrs(field: &Field) -> syn::Result<FieldAttrs> {
    let mut is_id = false;
    let mut is_json = false;
    let mut is_insert_only = false;
    let mut is_assigned = false;
    let mut column = None;

    for attr in &field.attrs {
        if !attr.path().is_ident("db") {
            continue;
        }
        attr.parse_nested_meta(|meta| {
            if meta.path.is_ident("id") {
                is_id = true;
                Ok(())
            } else if meta.path.is_ident("assigned") {
                is_assigned = true;
                Ok(())
            } else if meta.path.is_ident("json") {
                is_json = true;
                Ok(())
            } else if meta.path.is_ident("insert_only") {
                is_insert_only = true;
                Ok(())
            } else if meta.path.is_ident("column") {
                let value: LitStr = meta.value()?.parse()?;
                column = Some(value.value());
                Ok(())
            } else {
                Err(meta.error(
                    "unsupported db attribute on field, expected `id`, `assigned`, `json`, `insert_only`, or `column`",
                ))
            }
        })?;
    }

    Ok(FieldAttrs {
        is_id,
        is_json,
        is_insert_only,
        is_assigned,
        column,
    })
}
