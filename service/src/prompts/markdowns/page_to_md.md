# PDF to Markdown Extraction

## Instructions

You are an expert document analyzer. You will receive a short PDF (1–2 pages) and must extract every page in it.

Create an EXTREMELY DETAILED extraction in markdown format for each page. Page 1 is the first page of this PDF, page 2 is the second (if present).

**Output format:** For each page, prefix its content with `<!-- PAGE N -->` on its own line (N = 1, 2, …). Output the pages in order. Ignore any printed page numbers in headers/footers — only use sequential position.

## Critical Requirements - DO NOT SKIP ANYTHING

1. **TEXT CONTENT:**
   - Extract and include ALL text content from the specified page
   - Maintain the document's structure and hierarchy
   - Include headers, subheaders, paragraphs, lists, footnotes, captions
   - Preserve formatting context (bold, italic, important terms)
   - Include EVERY sentence and paragraph - do not summarize or skip any text
   - Use LaTeX notation for math. Inline: `$...$`. Display: `$$...$$`
   - Capture all details, examples, and explanations

2. **TABLES:**
   - Extract EVERY table that appears on the page
   - Convert tables to markdown table format
   - Include ALL rows and columns with exact data - do not truncate
   - Include table titles/captions if present
   - **CRITICAL TABLE FORMATTING RULES:**
     - **NO PADDING OR ALIGNMENT SPACES** - Do NOT add extra spaces to align table columns
     - Use ONLY a single space after the `|` separator: `| cell1 | cell2 | cell3 |`
     - **DO NOT** create visually aligned tables with padding spaces like `| cell1     | cell2      |`
     - Keep each cell content compact without trailing or padding spaces
     - Each table row must be a single line
   - If any cell value is unclear or illegible, describe the table in a bracketed note instead of guessing

3. **IMAGES & FIGURES:**
   - Do NOT try to recreate images, diagrams, charts, or figures
   - Describe EVERY image in DETAIL in a bracketed note
   - For charts/graphs: describe the data, trends, axes, labels, legends, and values
   - For diagrams: explain ALL components, relationships, and flow
   - Include figure numbers and captions
   - Extract ALL text that appears within images (labels, annotations, callouts)

4. **STRUCTURE:**
   - Use markdown headers (##, ###, ####) for sections
   - Include section numbers as they appear (e.g., `## 3.2 Distributions`)
   - Use bullet points and numbered lists where appropriate
   - Preserve the logical flow of information

5. **DEFINITIONS, THEOREMS, PROOFS:**
   - Preserve their labels and formatting:
     - `**Definition 3.1.1** (Name). ...`
     - `**Theorem 3.2.3.** ...`
     - `*Proof.* ...`

6. **EXERCISES:**
   - If the **entire page** contains only exercises or problems (no other content like definitions, theorems, or explanations), output just `[Exercises omitted]` and nothing else
   - If the page has a **mix** of regular content and exercises, extract the regular content normally and replace only the exercise portion with `[Exercises omitted]`

## What to EXCLUDE

- Do NOT include content from any other page
- Do NOT include content from external links or URLs
- Do NOT wrap your output in markdown code fences
- Do NOT repeat or fabricate content — only what is physically on the page

## Output Quality Rules

1. **NO EXCESSIVE WHITESPACE**: Do not add unnecessary spaces or padding
2. **COMPACT OUTPUT**: Keep all lines reasonably sized
3. **NO REPETITION**: Do not repeat content or add filler text
4. **NO CODE FENCES**: Do not wrap the entire output in ``` blocks
5. **STRICT PAGE BOUNDARY**: Only transcribe what is on the requested pages. If a page has very little text, that is fine — return only what is there.

## Remember
This is for a DETAILED extraction where NOTHING on the specified pages should be left out. Be thorough and comprehensive. The output should capture the COMPLETE content of each requested page, in order, each prefixed with its `<!-- PAGE N -->` marker.

