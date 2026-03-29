# Book analysis — Table of contents extraction

You are given a PDF document. Your task is to extract the **book title** and **table of contents (TOC)** from it.

## Instructions

1. **Scope**: Consider only the **first 50 pages** of the document. If the document has fewer than 50 pages, use the entire document.
2. **Book title**: Identify the main title of the book (from the cover or title page).
3. **Table of contents**: Extract the hierarchical structure:
   - **Chapters** (top-level sections, e.g. "Chapter 1: Introduction").
   - **Topics** (subsections or main bullet points under each chapter).

## Output format

Respond with **only** a single JSON object, no other text or markdown. Use this exact structure:

```json
{
  "title": "Book Title Here",
  "table_of_content": [
    {
      "title": "Chapter title",
      "topics": [
        { "title": "Topic or subsection title" },
        { "title": "Another topic" }
      ]
    }
  ]
}
```

- `title`: string, the book title.
- `table_of_content`: array of chapter objects.
- Each chapter has:
  - `title`: string, chapter title.
  - `topics`: array of topic objects, each with one field `title`: string.

If the document has no clear TOC, infer a structure from headings and section titles in the first 50 pages. Ensure the JSON is valid and parseable.
