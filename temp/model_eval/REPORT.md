# Claude replacement eval: Sol (`gpt-5.6-sol`) vs Astra (`gpt-6-astra`), plus Gemini 3.1 Pro

The harness is `service/examples/model_probe.rs`. It replays the real production prompt builders, sanitizers, retry loops, LaTeX rendering and the annotation layout engine against a `.backup` copy of the prod DB. Only the model is swapped. Both OpenAI models ran via the Azure Responses API with `reasoning.effort = high`.

The samples come from good prod dialogues. Journey dialogues: 107, 146, 158, 170, 193. Explanation dialogues: 98, 206, 210. The full chain (curator → Gemini illustrator → enhancer) ran on 107, 158, 193 and 206. The architect ran on explanations 1, 3 and 4. Chat replay used 3 tutor turns and 3 evaluator turns.

All outputs are in `out/`. Side-by-side images are in `out/_sheets/`. Open `report.html` for a gallery.

## TL;DR

| Role (prod model) | Sol | Astra | Verdict |
|---|---|---|---|
| Curator (Claude) | ≈ Claude. Same pacing and density, granular reveals, all valid | Valid, but merges beats and has fewer focus/pulse actions | **Sol** |
| Enhancer / annotations (Claude) | Slightly below Claude: 3–4 notes, never uses `did_you_know`, one unicode-in-text bug | Similar, a bit sparser (2–4) | **Sol** (tie on quality; faster). Claude was richer |
| Explanation architect (Claude) | Comparable plan quality, 73 s | Comparable, 130 s | **Sol** |
| Tutor chat (Claude) | ≥ Claude: precise, correct worked examples | ≥ Claude: very pedagogical, tables and examples | Either; **Sol** is faster |
| Evaluator chat (Claude) | Good, but concluded once on an unverified "I just solved it" | Pushes back like Claude | **Astra** slightly better |
| Narrator (Gemini 3.1 Pro) | More rigorous than Gemini, terse and display-math heavy, 11 s vs 21 s | Most pedagogical: concrete numeric walkthroughs, careful caveats, slower and longer | Keep Gemini or try **Astra**. Both OpenAI models beat Gemini on rigor |
| Illustrator / TikZ (Gemini 3.1 Pro) | Fast (30 s vs 104 s), but layout quality is uneven (rotated/overlapping labels on 146, cluttered on 98/210) | Cleanest layouts overall, correct math details (CDF open/closed dots), 68 s | **Astra** ≥ Gemini > Sol |

**Recommendation:** replace every Claude role with **Sol**, except the evaluator, where **Astra** is marginally safer (Sol is also acceptable with a prompt tweak). Keep Gemini on narrator and illustrator for now. Astra is a credible upgrade for TikZ and is worth a wider A/B. Before shipping, fix the three blocking bugs in the WIP OpenAI client listed below.

## Blocking bugs in the WIP OpenAI client (main checkout, `llm_client/clients/openai/`)

1. **JSON mode returns 400.** Azure rejects `text.format = json_object` unless the word "json" appears in `input`. The WIP `client.rs` puts the system prompt in `instructions`, so every JSON-mode call (curator, enhancer, architect, ...) fails. Fix: send the system prompt as a `system`/`developer` message in `input`, or append a short "Respond in JSON." user message.
2. **Tool calls return 400.** After a tool call, `chat.rs` echoes back only the `function_call` items. Reasoning models require the preceding `reasoning` item as well: `Item 'fc_…' of type 'function_call' was provided without its required 'reasoning' item`. This failed 4 of 12 chat runs in my first pass. Fix: push *every* output item (`self.messages.extend(output)`), or use `previous_response_id`. The probe applies the first fix and all chats now pass.
3. **No retry.** 2 of ~120 calls hit a transient `reqwest` send error after ~16 s. Add retry with backoff on transport errors and 5xx/429, as the other clients do.

Non-blocking:
- **Math delimiters.** Sol/Astra sometimes emit `\( … \)` / `\[ … \]` (4 of 12 evaluator replies). `remark-math` only renders `$`/`$$`, so add "use `$…$` / `$$…$$` for math" to the tutor/evaluator prompts, or normalize in `src/lib/markdown.tsx`.
- **Unicode in enhancer text.** Sol once wrote `≤ ⊆ <` in a plain-text annotation, which rendered as `a ¡ b`. A one-line prompt reminder, or escaping `<`/`>` in text mode, fixes it.

## Latency (mean seconds per call)

| Stage | Gemini 3.1 Pro | Sol | Astra |
|---|---|---|---|
| Narrator | 21 | **11** | 25 |
| Illustrator (TikZ, incl. render) | 104 | **30** | 68 |
| Curator | – | **39** | 58 |
| Enhancer | – | **9** | 13 |
| Architect | – | **73** | 130 |
| Chat turn | – | **8** | 13 |

TikZ compiled on the first attempt in every run, except Astra on 158 and compose/193, which each needed one retry.

## Stage notes

### Curator (Claude → ?)
- Structural validation passed for all 16 runs:
  - segments concatenate exactly to the dialogue
  - no unrevealed, duplicate or unknown ids
  - no naming violations
- Prod Claude averages 7 segments and ~10 parts. Sol matches that almost exactly, with similar focus/pulse/reveal counts. On 158 it even adds a `connect`.
- Astra uses fewer focus/pulse actions and sometimes many more parts (16 on 146, 13 on 206). It also tends to reveal several parts in one beat.
- Sol made tiny text edits: trailing whitespace, and on 158 it changed "non-empty nullspace" to "nontrivial nullspace", which is a real math fix. Astra never changed the text.

### Enhancer (Claude → ?)
- See `_sheets/enhancer_*.png`. Every run rendered.
- Claude writes 5–7 annotations and almost always includes a `did_you_know` box (Kirchhoff 1847, Tower of Hanoi 585 billion years, Lebesgue–Stieltjes).
- Sol and Astra write 2–4 and **never** used `did_you_know` or `label`. The prompt does say "restraint is a virtue", so this is a style shift rather than an error, but the figures feel less rich.
- Content is accurate and well targeted for both. If you want Claude's flavor back, nudge the prompt: "include one `did_you_know` when there is genuine history or trivia".

### Narrator (Gemini 3.1 Pro vs Sol vs Astra)
- Read `narrator/158/*` and `narrator/170/*` side by side against `prod/<id>/narrator.md`.
- **Gemini:** warm, conversational, the house voice. Occasionally sloppy, e.g. "probability that X ≤ −∞".
- **Sol:** tight and rigorous (proves `A(x+c1)=b` explicitly), with short, precise blackboard instructions. It is less conversational, uses lots of `$$` display math, and runs 10–25% shorter.
- **Astra:** the strongest teacher.
  - It works concrete numbers (pressures 10→20, readings unchanged; I verified the arithmetic).
  - It adds correct caveats, e.g. an unbounded variable's CDF may never reach 1.
  - It narrows scope per dialogue.
  - The cost is the longest outputs and very detailed blackboard specs, which push more work onto the illustrator.
- All three stay coherent with the prior dialogue context.

### Illustrator / TikZ (Gemini 3.1 Pro vs Sol vs Astra)
- See `_sheets/illustrator_*.png`. "PROD" is the original Gemini figure; the other rows are reruns from the same instruction and Claude parts.
- **Gemini:** strong concepts, but prod figures often have overlapping text (146 titles, 158 dashed boxes over brackets, 170 labels, 193 "(for n>0)" over the note).
- **Sol:** fastest. Fine on 107/193/206, weak on 146 (rotated, overlapping labels), 98 (stick figures colliding with text) and 210 (overlaps, tiny monospace). On 170 it had a math slip: a step CDF drawn without open/closed dots and with a/b on the wrong steps.
- **Astra:** cleanest overall and mathematically careful (170 has correct closed/open dots and dashed F(a)/F(b) guides). Its layouts are sometimes oversized or sparse (210, 170).
- **Continuity caveat (all models):** the illustrator sees only the instruction, so when the instruction under-specifies, a model can redraw prior objects differently. On 158, Sol/Astra invented a different graph/matrix; in compose/158 Gemini did the same. Fixing this means passing the previous TikZ source in, not swapping models.

### Architect (Claude → ?)
`architect/<eid>/*/architect.json` vs `architect.prod.json`: both produce 9–11 well-formed, question-titled steps with similar arcs to Claude's. Neither has an obvious weakness. Sol is about 2× faster.

### Chat (Claude → ?)
`chat/<did>_t<n>/*/chat.md`:
- **Tutor 146 (rank intuition):** all three correctly separate same-set (N, row space) from same-dimension (column space). Sol and Astra are as good as Claude.
- **Tutor 3 ("I am confused"):** Claude just asked a clarifying question. Sol and Astra both gave a correct tiny worked example of `dp[v][len]` (verified), then asked where the confusion is. This is better than Claude.
- **Evaluator 116 / 154:** both Socratic and correct, matching Claude.
- **Evaluator 125 ("I just solved it"):** Claude and Astra ask for a quick check. Sol calls `conclude_quaestio` straight away, which is lenient against the prompt's "sound reasoning" rule.

## Caveats
- The sample is small: 8 dialogues, 3 explanations, 6 chat turns. Each model ran once per sample, without seeds.
- The pre-curation narrator text isn't stored, so the curator/compose input is the curated `dialogues.content`. The curator barely edits the text, so the impact is small.
- Tutor notes and user profile reflect *current* DB state, not their historical values. Chat tool writes went only to the DB copy.
- Prod dialogue 98's Claude curation had failed to parse in prod (0 parts), so isolated illustrator/enhancer runs on 98 had no parts.
