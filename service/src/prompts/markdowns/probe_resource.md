# Resource classification

You are given a PDF. Classify it and describe it.

## Resource types

- `TextBook` — a full textbook or a substantial book-length work with chapters.
- `Document` — a shorter self-contained piece: research paper, blog post, technical document, documentation, infographic, tutorial, or FAQ.
- `Question` — a problem, exercise, or question statement to be solved (no worked solution).
- `Solution` — a worked solution, editorial, or answer to a problem.

## Document types

If and only if the resource type is `Document`, also pick a `document_type` from:
`ResearchPaper`, `BlogPost`, `TechnicalDocument`, `Documentation`, `Infographic`, `Tutorial`, `FAQ`.

## Output

Respond with a single JSON object, no other text or markdown fences:

```json
{
  "resource_type": "TextBook | Document | Question | Solution",
  "document_type": "ResearchPaper | BlogPost | TechnicalDocument | Documentation | Infographic | Tutorial | FAQ",
  "title": "A concise, human-readable title for this resource",
  "description": "Two to three sentences describing what this resource is and what it covers."
}
```

- Omit `document_type` unless `resource_type` is `Document`.
- `title` and `description` are always required.
