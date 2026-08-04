"""Prod-quality prompts for the Atlas (objective-based knowledge graph).

The atom is a READING — one book chapter, or one paper — because that is the
exact unit a journey is built from in the app. Concepts are attributes of a
reading, never nodes of their own.

Three calls:
  1. TARGET_READINGS — paper + objective + baseline -> minimal set of readings
  2. BACKWARD_STEP    — one reading -> its immediate prerequisite readings (or start)
  3. IDENTITY_MATCH   — is a candidate reading the same material as one already in the map?
"""

SYSTEM = (
    "You are Metis, a rigorous curriculum cartographer. You map the exact readings a "
    "specific learner must work through to understand a specific work — nothing more, "
    "nothing less. Your unit is a READING: one chapter of a book, or one paper. A single "
    "reading usually teaches several concepts at once; you always name the reading, never "
    "the bare concept. You are ruthless about scope: you never assign a reading for "
    "material the learner already commands, and you prefer one substantial chapter over "
    "splitting the same material into many small pieces."
)

TARGET_READINGS = """A learner wants to understand the attached work well enough to meet this objective.

OBJECTIVE:
{objective}

WHAT THE LEARNER ALREADY COMMANDS (their baseline — this is the FLOOR; never assign a reading for material at or below this level):
{profile}

Read the attached work. Identify the MINIMUM set of READINGS the learner must work through to understand the specific machinery this work relies on and does not already command.

Rules:
- A reading is ONE book chapter, or ONE paper (or one substantial, self-contained section). It is the unit a learner sits down and works through in one study block.
- ONE reading covers SEVERAL concepts. Do not emit a separate reading per concept — name the reading, and list the concepts it covers. Prefer a whole chapter over its sub-sections.
- Only readings this work genuinely requires. If the material does not actually carry weight in this work, leave it out.
- Nothing at or below the learner's baseline.
- Prefer the fewest readings that fully cover what is needed. For a paper like this, that is usually a handful, not dozens.
- Each reading must be a specific, real, well-known source: a named book with a chapter, or a canonical paper with a section. No invented sources. When several concepts live in one book, prefer citing that one book's chapters so the path stays coherent.

Also return the title of the attached work itself (it becomes the summit of the map).

Return ONLY JSON:
{{"work_title": "title of the attached paper",
  "readings": [
    {{"work": "book or paper title",
      "locator": "chapter / section",
      "kind": "chapter" or "paper",
      "concepts": ["concept this reading teaches", "..."],
      "why_needed": "one sentence on how the attached work uses this"}}
  ]}}"""

GOAL_READINGS = """A learner has a CAPABILITY GOAL — they want to become capable of building or doing something. Your job is NOT to write a how-to guide for it. Your job is to map the READINGS they must work through so that they have enough understanding to go do it themselves.

THE GOAL (this is the scope anchor — take its boundaries literally; do not expand beyond what it asks or narrow below it):
{goal}

WHAT THE LEARNER ALREADY COMMANDS (their baseline — this is the FLOOR; never assign a reading for material at or below this level):
{profile}

Decompose the goal into the MINIMUM set of READINGS the learner must understand to be capable of it.

Rules:
- First decompose the goal into its handful of distinct COMPETENCY AREAS (the major sub-capabilities it requires). Then, for each area, name the fewest readings that give the needed understanding. Tag every reading with its competency area.
- A reading is ONE book chapter, or ONE paper (or one substantial, self-contained section) — the unit a learner works through in one study block. ONE reading covers several concepts; name the reading and list the concepts, never emit a reading per concept.
- Stay inside the goal's stated scope. If the goal says single-node, do not add distributed-systems readings. If it names a subset, do not cover the whole field. The goal's boundaries are the target, exactly as a paper's contents were the target.
- Only what is genuinely load-bearing for the goal. Prefer the fewest readings that fully cover it — for a goal like this, that is usually 6-10 readings across a few competency areas, not dozens.
- The goal is to BUILD/DO, not merely to appreciate — prefer implementation-oriented canonical sources (a "how it works internals" book or a systems chapter) over purely theoretical treatments, when a choice exists.
- Each reading must be a specific, real, well-known source. No invented sources. When several concepts live in one book, prefer that one book's chapters so the path stays coherent.

Return ONLY JSON:
{{"goal_summary": "a short (<=8 word) name for this destination, e.g. 'Build a single-node SQL database'",
  "readings": [
    {{"work": "book or paper title",
      "locator": "chapter / section",
      "kind": "chapter" or "paper",
      "competency": "the competency area this reading serves",
      "concepts": ["concept this reading teaches", "..."],
      "why_needed": "one sentence on why the goal needs this"}}
  ]}}"""

BACKWARD_STEP = """A learner is building toward this objective:
{objective}

Their baseline (already mastered — treat this as the floor; never go at or below it):
{profile}

They need to work through this reading:
READING: {reading}
IT TEACHES: {concepts}
WHY IT MATTERS: {why}

What readings must the learner understand IMMEDIATELY before this one — the single step right before it — that they do NOT already have per their baseline?

Rules:
- A prerequisite is itself a READING: one chapter, or one paper. Never a bare concept.
- Immediate only. One step back. Deeper layers are handled by later calls.
- Prefer a prerequisite from the SAME book as this reading when that book already covers the needed material — this keeps the learner's path coherent and avoids scattering them across many sources.
- Return 0 to 3 readings. Return FEWER when you honestly can.
- Bias HARD toward stopping. If the learner's stated baseline is already enough to begin this reading, return an empty list and mark is_start true. A shallow, honest map beats a deep, padded one. Do not descend into foundational material the baseline already implies.

Return ONLY JSON:
{{"is_start": true or false,
  "prerequisites": [
    {{"work": "...", "locator": "...", "kind": "chapter" or "paper",
      "concepts": ["..."], "why_needed": "one sentence"}}
  ]}}"""

IDENTITY_MATCH = """A learner's study map already contains these readings:
{existing}

Here is a candidate reading:
"{candidate}"

Does the candidate cover the SAME material as one already in the map — such that assigning both would make the learner study the same thing twice? Match when EITHER:
- it is the same material (same core concepts), even from a different book or edition, OR
- it is fully contained within an existing reading — e.g. a subsection of a chapter that is already in the map (the learner would get it for free by doing the broader reading).
Do NOT match on mere relatedness, or when the candidate covers substantial material the existing reading does not.

Return ONLY JSON: {{"match_index": <the number of the matching reading, or -1 if none>}}"""
