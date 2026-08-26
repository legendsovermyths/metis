#!/usr/bin/env python3
"""
Prototype for the 'unstructured learning' app pipeline, stage 1+2:
  (1) INSIGHT MINING  : profile + resources -> outstanding, non-generic insights
  (2) MATERIAL        : insight -> pick one of {story, puzzle, argument} -> source material
Material is NOT dialogue; it is the substrate a downstream narrator turns into
bite-sized dialogues (mirrors Metis's reference_material -> narrator split).
"""
import json, os, re, sys, urllib.request, urllib.error, pathlib, time

HERE = pathlib.Path(__file__).parent
ROOT = HERE.parents[1]
ENV  = ROOT / "service" / ".env"

# ---- auth (mirror service/src/llm_client/clients/claude/client.rs) ----
BASE_URL = "https://bedrock-runtime.us-west-2.amazonaws.com"
ANTHROPIC_VERSION = "bedrock-2023-05-31"
MODEL = "us.anthropic.claude-opus-4-6-v1"

def api_key():
    for line in ENV.read_text().splitlines():
        if line.startswith("BEDROCK_API_KEY="):
            return line.split("=", 1)[1].strip()
    sys.exit("no BEDROCK_API_KEY in service/.env")

def call_claude(system, user, max_tokens=20000):
    body = {
        "anthropic_version": ANTHROPIC_VERSION,
        "max_tokens": max_tokens,
        "system": system,
        "messages": [{"role": "user", "content": user}],
        "thinking": {"type": "adaptive"},
        "output_config": {"effort": "high"},
    }
    url = f"{BASE_URL}/model/{MODEL}/invoke"
    req = urllib.request.Request(
        url, data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {api_key()}", "Content-Type": "application/json"},
        method="POST",
    )
    with urllib.request.urlopen(req, timeout=300) as r:
        resp = json.loads(r.read().decode())
    for block in resp.get("content", []):
        if block.get("type") == "text":
            return block["text"]
    raise RuntimeError("no text block: " + json.dumps(resp)[:500])

def parse_json(text):
    t = text.strip()
    t = re.sub(r"^```(json)?", "", t).strip()
    t = re.sub(r"```$", "", t).strip()
    # grab first {...} or [...] span
    m = re.search(r"(\{.*\}|\[.*\])", t, re.DOTALL)
    return json.loads(m.group(1) if m else t)

# ---------------------------------------------------------------- inputs
PROFILE = """- **Name**: Anirudh Singh
- **Background**: Software engineer at Adobe, working on a legacy codebase for a product called Captivate.
- **Interests**: Building personal projects in Rust, competitive programming, and reading popular math books.
- **Motivation**: Self-studying math out of personal curiosity and for exploration.
- **Bridges**: Competitive programming provides a strong foundation in algorithmic thinking and logical problem-solving. Interest in Rust suggests an appreciation for systems-level logic and efficiency. Reading pop math books indicates a genuine interest in the concepts and stories behind the math."""

# resources table is empty in dev; synthesize a coherent set (title + description),
# maths & cs, matching the profile's taste. These set the two dials: LEVEL and TASTE.
RESOURCES = [
    ("Competitive Programmer's Handbook — Antti Laaksonen",
     "The CSES-companion reference: sorting, graph algorithms, DP, number theory, range queries, and classic contest techniques. Signals comfort with rigorous algorithmic reasoning and a taste for clever, self-contained tricks."),
    ("Concrete Mathematics — Graham, Knuth, Patashnik",
     "Sums, recurrences, number theory, generating functions, and discrete probability, taught with playful rigor. Signals appetite for manipulation-heavy discrete math and elegant closed forms."),
    ("The Rust Programming Language ('the Book')",
     "Ownership, borrowing, lifetimes, traits, zero-cost abstractions. Signals systems-level thinking and an appreciation for correctness enforced by design."),
    ("Prime Obsession — John Derbyshire",
     "A popular-math narrative of the Riemann Hypothesis, weaving the analytic story of primes with the human history. Signals love of the *story* and deep structure behind mathematics."),
    ("Algorithms — Jeff Erickson",
     "A rigorous but witty algorithms text: recursion, dynamic programming, graphs, NP-hardness, with an emphasis on why things work. Signals depth beyond contest recipes into the theory underneath."),
]

RESOURCE_BLOCK = "\n".join(f"- **{t}** — {d}" for t, d in RESOURCES)

# ---------------------------------------------------------------- prompt 1: INSIGHT MINING
INSIGHT_SYSTEM = """You are the Insight Miner for an app of *unstructured learning* — the antidote to doomscrolling. Where a structured course marches through a syllabus, you surface a single, self-contained *insight* a curious person can savour in ninety seconds on a train: a takeaway that makes them go "wait — really?" and feel a little smarter and a little more alive than before they picked up the phone.

An insight is one true, standalone idea. Not a lesson, not a syllabus, not a definition dump — one crystallised takeaway with a spark.

## What makes an insight OUTSTANDING (this is the whole job)

The bar is high. Most "facts" an LLM produces are generic sludge — true but inert. You are hunting for the opposite. Learn the bar by contrast:

GENERIC SLUDGE (never produce this):
- "Binary search runs in O(log n) time." (Everyone knows it; no spark.)
- "The derivative measures rate of change." (A definition, not an insight.)
- "Prime numbers have exactly two divisors." (Trivia, no turn.)

OUTSTANDING (this is the target):
- "The vector potential in electromagnetism was long dismissed as a mere mathematical convenience with no physical reality — until the Aharonov–Bohm effect showed an electron can be deflected in a region where the magnetic field is exactly zero but the potential is not. The 'fiction' turned out to be more fundamental than the 'real' field, and whether it acts locally is *still* argued."
- "In the Monty Hall problem, switching doors wins 2/3 of the time — not because the math is subtle, but because opening a door is not a neutral act: the host is leaking information about where the car *isn't*, and your original 1/3 of ignorance gets dumped, whole, onto the one door left."
- "The Möbius function μ(n) looks like an arbitrary sign-juggling rule, but it is exactly the inverse of the 'sum over divisors' operation — it exists so that you can *undo* a summation, and that single idea (Möbius inversion) silently powers counting arguments from combinatorics to the distribution of primes."

Notice what the great ones share: a **turn** (a reversal, a hidden mechanism, a surprising unity, a thing that is not what it seems), it is **true and defensible**, it is **compact**, and it rewards the *specific taste* of the reader rather than being a fact anyone would find.

## The two dials (your only inputs about the person)

- **LEVEL** — inferred from their resources. If they own a rigorous algorithms text and a Knuth book, do not hand them "what is a for-loop." Aim *near the ceiling* of what their resources imply they can follow: challenging but graspable without paper.
- **TASTE** — the resources are an aesthetic fingerprint, not a topic whitelist. A competitive-programming + pop-math + Rust reader delights in: elegant discrete math, counterintuitive probability, number-theoretic sleight of hand, deep structural unity, clever invariants, the human drama behind results, and systems-level "why it must be so." You may roam *anywhere* that hits this taste — physics, cryptography, logic, the history of an idea — even if no resource names it. Universally delightful insights (great paradoxes, famous fallacies, beautiful reversals) are always fair game.

## Truth is the only hard gate
Every insight must be true and defensible. In `grounding`, name the real theorem / effect / result it rests on so it can be checked. Never attach a fabricated citation; name the concept, not a fake page number.

## Output
Respond with a single valid JSON value, no prose, no markdown fences:

{
  "insights": [
    {
      "title": "3-6 word handle",
      "insight": "The takeaway itself, 2-5 sentences, written to land the *turn*. Vivid, precise, self-contained.",
      "the_turn": "One sentence naming exactly what makes this surprising/non-obvious — the reversal or hidden mechanism.",
      "domain": "e.g. probability / number theory / physics / cryptography / logic",
      "taste_match": "Why THIS reader, given their resources, will love it.",
      "level_fit": "Why it sits near their ceiling — not trivial, not over their head.",
      "grounding": "The real theorem/effect/result it rests on (for truth-checking).",
      "form_hint": "story | puzzle | argument — which of the three delivery forms fits best, and one clause why."
    }
  ]
}

Produce 5 insights, each from a DIFFERENT corner of the reader's taste (do not cluster). Make every one clear the OUTSTANDING bar. If one feels generic, discard it and mine deeper."""

INSIGHT_USER = f"""## Reader profile
{PROFILE}

## Reader's resources (these set LEVEL and TASTE)
{RESOURCE_BLOCK}

Mine 5 outstanding insights for this reader."""

# ---------------------------------------------------------------- prompt 2: MATERIAL
MATERIAL_SYSTEM = """You are the Material Builder for the unstructured-learning app. You receive one mined INSIGHT and turn it into **source material** for a single bite-sized, audio-first, swipeable unit.

CRITICAL: You are NOT writing the dialogue. You are writing the *source material* a downstream narrator will later turn into a short sequence of spoken beats with an evolving diagram — exactly as a textbook chapter is the source a lecturer teaches from. Your job is to nail the substance, structure, correct answer, and the payoff so the narrator has everything it needs. Do not write it as spoken lines; write it as a complete, structured brief.

## The three forms — choose the ONE that fits this insight

Read all three carefully, then pick the single best fit for THIS insight and build only that one.

### 1) STORY
WHEN: the punch is narrative — a historical reversal, a human drama, a "this turned out to be X" twist, the tale behind a result. The reader is receptive; there is nothing to *solve*, only something to *feel and realise*.
SHAPE of the material:
- hook: the opening tension or promise that earns the first 3 seconds.
- beats: an ordered list of 3-6 story beats, each a factual nugget that moves the arc: setup -> complication/turn -> reveal -> resonance.
- the_reveal: the exact moment/sentence the whole thing turns on.
- lingering: the question or mystery it leaves the reader holding.
EXAMPLE fit: "the vector potential was fiction until Aharonov-Bohm made it real."

### 2) PUZZLE
WHEN: the insight can be posed as a question with an OBJECTIVE answer (a number, yes/no, a choice, a ranking) that is *counterintuitive* yet solvable purely in the head — no pen and paper — by an insight rather than grinding.
SHAPE of the material:
- setup: the scenario, concretely and minimally.
- question: the exact prompt, and the answer_format (e.g. "yes/no", "one integer", "pick A/B/C").
- correct_answer: the answer.
- the_trap: the tempting wrong answer and precisely why it seduces (this is where the delight lives).
- solution_path: the *mental* line of reasoning that cracks it — the insight, not the algebra. Must be followable in the head.
- payoff: the 'aha' the reader keeps.
EXAMPLE fit: Monty Hall; a parity/invariant surprise; a counterintuitive expectation.

### 3) ARGUMENT
WHEN: the insight is interpretive or contested — there is no single right answer, the value is in weighing genuinely competing views. The reader participates by taking a stance.
SHAPE of the material:
- claim: the provocative proposition at stake.
- prompt: what stance the reader is asked to take (e.g. "physical or bookkeeping?").
- side_a / side_b: the STEELMAN of each position — the strongest honest case, not a strawman.
- the_crux: where the disagreement really lives once the surface is cleared.
- unresolved: what remains genuinely open, so the reader leaves thinking.
EXAMPLE fit: "is the electromagnetic potential physically real or mere bookkeeping?"

## Visual: the evolving diagram
The unit will show ONE diagram that is revealed and *tweaked* across the beats to feel like a single connected thing (rendered as TikZ/SVG). Provide `visual_beats`: an ordered list where each entry says what the diagram should show at that step and what *changes* from the previous step (add a vector, shade a region, relabel). Keep each diagram mentally simple and static — motion comes only from the reveal.

## Output
Respond with a single valid JSON value, no prose, no markdown fences:

{
  "insight_title": "echo the insight's title",
  "chosen_form": "story | puzzle | argument",
  "why_this_form": "1-2 sentences on why this form fits this insight best.",
  "material": { ...only the fields for the chosen form, as specified above... },
  "visual_beats": [
    {"step": 1, "shows": "what is on the diagram now", "change": "what changed vs previous (or 'initial')"}
  ],
  "estimated_beats": 4
}"""

def material_user(insight):
    return "## The mined insight\n" + json.dumps(insight, indent=2, ensure_ascii=False) + \
           "\n\nChoose the best form and build the source material."

# ---------------------------------------------------------------- run
def main():
    out = HERE / "evaluation.md"
    log = []
    def w(s=""):
        log.append(s)

    print("→ stage 1: mining insights ...", flush=True)
    t0 = time.time()
    raw_insights = call_claude(INSIGHT_SYSTEM, INSIGHT_USER, max_tokens=22000)
    insights = parse_json(raw_insights)["insights"]
    print(f"  got {len(insights)} insights in {time.time()-t0:.0f}s", flush=True)
    (HERE / "insights.json").write_text(json.dumps(insights, indent=2, ensure_ascii=False))

    # convert the first 3 to material
    materials = []
    for i, ins in enumerate(insights[:3]):
        print(f"→ stage 2: material for '{ins.get('title')}' ...", flush=True)
        t0 = time.time()
        raw = call_claude(MATERIAL_SYSTEM, material_user(ins), max_tokens=16000)
        materials.append(parse_json(raw))
        print(f"  done in {time.time()-t0:.0f}s", flush=True)
    (HERE / "materials.json").write_text(json.dumps(materials, indent=2, ensure_ascii=False))

    # ---- readable evaluation.md ----
    w("# Insight → Material — pipeline evaluation\n")
    w(f"_Model: {MODEL}. Stage 1 mines 5 insights from profile+resources; stage 2 converts the first 3 into source material (choosing story/puzzle/argument)._\n")
    w("---\n\n## Reader profile\n")
    w(PROFILE + "\n")
    w("## Resources (the two dials: LEVEL + TASTE)\n")
    w(RESOURCE_BLOCK + "\n")
    w("\n---\n\n# Stage 1 — Mined insights\n")
    for n, ins in enumerate(insights, 1):
        w(f"### {n}. {ins.get('title','')}\n")
        w(f"**Insight.** {ins.get('insight','')}\n")
        w(f"- **The turn:** {ins.get('the_turn','')}")
        w(f"- **Domain:** {ins.get('domain','')}")
        w(f"- **Taste match:** {ins.get('taste_match','')}")
        w(f"- **Level fit:** {ins.get('level_fit','')}")
        w(f"- **Grounding (truth-check):** {ins.get('grounding','')}")
        w(f"- **Form hint:** {ins.get('form_hint','')}\n")
    w("\n---\n\n# Stage 2 — Source material (first 3 insights)\n")
    for n, mat in enumerate(materials, 1):
        w(f"## {n}. {mat.get('insight_title','')}  —  form: **{mat.get('chosen_form','')}**\n")
        w(f"_Why this form:_ {mat.get('why_this_form','')}\n")
        w("**Material:**\n")
        w("```json")
        w(json.dumps(mat.get("material", {}), indent=2, ensure_ascii=False))
        w("```\n")
        w(f"**Evolving diagram** ({mat.get('estimated_beats','?')} beats):\n")
        for vb in mat.get("visual_beats", []):
            w(f"- **step {vb.get('step')}** — shows: {vb.get('shows')}  \n  _change:_ {vb.get('change')}")
        w("")
    out.write_text("\n".join(log))
    print(f"\n✓ wrote {out}")

if __name__ == "__main__":
    main()
