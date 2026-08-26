# Book analysis — Table of contents extraction

You are given a textbook PDF. Extract the **book title** and its **table of contents (TOC)** by reading the book's own printed Table of Contents.

**Scope**: You receive only the opening pages of the book, not the whole thing — it is truncated on purpose to keep the load light. The Table of Contents lives at the start, so everything you need to list the full structure is already in these pages. Treat the printed Table of Contents as your single source of truth; the surrounding pages are there only so you can reach it.

## Instructions

1. **Read the printed TOC.** A textbook lists its full structure on the Table of Contents pages in its front matter. Find those pages and transcribe what they list, exactly and in order. The TOC often runs across several pages — read all of them and carry through to the final chapter.
2. **Book title**: Take the main title from the cover or title page.
3. **Transcribe exactly what the TOC prints — and only that.** The printed Table of Contents is your only source.
   - **Chapters** — the top-level entries as printed (e.g. "Chapter 1: Introduction", parts, or numbered sections). Include every one, from the first to the last.
   - **Topics** — a chapter's sub-entries *only when the TOC itself prints them* beneath that chapter. When the TOC lists chapters without sub-entries, leave each chapter's topics empty. Keep the detail level uniform across the whole book: give every chapter the sub-entries the TOC prints for it, and nothing more.
   Take entries from the Table of Contents pages alone. The body pages exist only so you can find the TOC — read a chapter's body for nothing, and leave out any section headings, summaries, exercises, or solutions the TOC does not itself list.

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

If the book prints no Table of Contents at all, build the structure from the chapter and section headings you can see, in order. Ensure the JSON is valid and parseable.
