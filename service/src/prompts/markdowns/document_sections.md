# Document structure — Section extraction

You are given a PDF document (a paper, article, tutorial, or similar). Extract its structure as a list of sections and their sub-sections.

## Output format

Respond with a single JSON object, no other text or markdown fences:

```json
{
  "table_of_content": [
    {
      "title": "Section title",
      "sub_sections": [
        { "title": "Sub-section title" },
        { "title": "Another sub-section" }
      ]
    }
  ]
}
```

- `table_of_content`: array of section objects.
- Each section has a `title` and a `sub_sections` array (may be empty).
- Each sub-section has a single field `title`.

If the document has no explicit sections, infer a reasonable structure from its headings. Ensure the JSON is valid and parseable.
