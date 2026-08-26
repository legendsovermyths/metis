#!/usr/bin/env python3
"""
Stage 2, v2 — richer SOURCE MATERIAL.
Fixes: (1) define the prerequisites the insight assumes (from level_fit),
       (2) actually DELIVER/EXPLAIN the insight (every step of why it's true),
       (3) treat it as a complete reference DOCUMENT, length subordinate to completeness.
Runs the 3 picks (johnson-gauge / story / puzzle) across Opus 5 + Gemini 3.1 Pro.
"""
import json, re, pathlib, importlib.util
from concurrent.futures import ThreadPoolExecutor, as_completed

HERE = pathlib.Path(__file__).parent
OUT = HERE / "stage2"

def load(name):
    spec = importlib.util.spec_from_file_location(name, HERE / f"{name}.py")
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
rc = load("run_compare")
s2 = load("stage2")

MATERIAL_SYSTEM = """You are the Material Builder for the unstructured-learning app. You receive one mined INSIGHT and produce the **source-material document** for a single bite-sized unit.

READ THIS FIRST — what "source material" means here:
This document is the SOLE basis for everything downstream: a narrator will later turn it into spoken, bite-sized dialogue beats with an evolving diagram. It is NOT the dialogue and NOT marketing copy. It is a complete, self-contained reference — like a well-written textbook passage — from which a teacher could deliver the whole insight WITHOUT looking anything else up or inventing any fact. If a fact, definition, or logical step is needed to understand the insight, it MUST be in this document. Completeness and correctness outrank brevity. Do not compress to fit a time budget; a great insight may take several minutes to deliver, and that is fine.

Two things weak material gets wrong, which you must get right:
1. PREREQUISITES. Every insight silently assumes the reader knows some concepts (they are usually named in the insight's `level_fit`, and appear in the insight text). List each such concept and give a crisp "what it is" — a definitional reminder that gives footing, 1-2 sentences, NO derivation, NO full lesson. Just enough that a reader who half-remembers the term is re-seated. Err toward including a prerequisite rather than assuming it.
2. DELIVERY. The document must actually EXPLAIN the insight so the reader UNDERSTANDS it — states the setup, walks the key mechanism, and shows WHY it is true, in complete logical steps. If there is a computation, carry it out. If there is a proof idea, give every step, not a gesture at one. A reader who finishes must understand *why*, not merely feel *that* it's surprising. Restating the insight with adjectives is failure.

## Choose ONE form (essence → when to use it)
- STORY: the punch is a narrative/historical reversal or a "turned out to be X" reveal; the reader realises, doesn't solve. (Note: a purely structural "A is secretly B" reveal is usually best as STORY.)
- PUZZLE: the insight can be posed as a concrete question with an OBJECTIVE answer (number, yes/no, choice), counterintuitive yet head-solvable by insight; the insight IS the surprising answer + its mechanism.
- ARGUMENT: reserve for genuinely CONTESTED, interpretive points with real unresolved disagreement (competing steelman sides). Do not force this onto a structural reveal — if there is no live disagreement, it is a STORY, not an argument.

## The evolving diagram
The unit shows ONE diagram, revealed and *tweaked* across beats so it feels like a single connected thing (rendered TikZ/SVG, static frames — motion comes only from the reveal). Provide `visual_beats`: ordered entries saying what the diagram shows now and what CHANGED from the previous step.

## Output — a single valid JSON object, no prose, no fences:
{
  "insight_title": "echo the title",
  "chosen_form": "story | puzzle | argument",
  "why_this_form": "1-2 sentences",
  "prerequisites": [
    {"term": "the assumed concept", "what_it_is": "1-2 sentence definitional reminder, no derivation"}
  ],
  "delivery": { ...form-specific fields below; this is where the insight is fully EXPLAINED... },
  "the_turn": "the crux, one plain sentence",
  "visual_beats": [ {"step": 1, "shows": "...", "change": "initial | what changed"} ],
  "narrator_notes": "optional: pacing/emphasis guidance for the dialogue stage"
}

### delivery fields by form
STORY:
  "hook": "the opening tension, earns the first seconds",
  "beats": [ {"label": "short label", "content": "a substantial paragraph; the beats TOGETHER must fully establish the mechanism/why, not just narrate vibes"} ],
  "the_reveal": "the exact sentence the whole thing turns on",
  "lingering": "the question/mystery left open"
PUZZLE:
  "setup": "the scenario, concrete and minimal",
  "question": "the exact prompt", "answer_format": "e.g. one integer / yes-no / pick A,B,C",
  "correct_answer": "the answer",
  "the_trap": "the tempting wrong answer AND precisely why it seduces",
  "solution_path": "the COMPLETE mental derivation — every step, carried out, head-solvable",
  "why_it_works": "the deeper mechanism the solution reveals (this is the real insight)",
  "payoff": "the reusable 'aha' the reader keeps",
  "extension": "optional harder twist"
ARGUMENT:
  "claim": "the proposition at stake",
  "prompt": "what stance the reader takes",
  "shared_ground": "the facts/prereqs BOTH sides accept (deliver the substance here)",
  "side_a": "the strongest honest case for one side",
  "side_b": "the strongest honest case for the other",
  "the_crux": "where the disagreement really lives once surface is cleared",
  "unresolved": "what stays genuinely open"

Remember: prerequisites give footing; delivery gives understanding. Both must be present and thorough."""

def material_user(ins):
    return ("## The mined insight\n" + json.dumps(ins, indent=2, ensure_ascii=False)
            + "\n\nBuild the complete source-material document. Define every prerequisite the insight assumes "
              "(scan `level_fit` and the insight text), and fully explain the insight — do not restate it.")

def insight_from(fname):
    txt = (OUT / fname).read_text()
    return json.loads(re.search(r"```json\s*(\{.*?\})\s*```", txt, re.DOTALL).group(1))

def render(mkey, m):
    L = [f"# [{mkey}] MATERIAL v2 — {m.get('insight_title','')}  ·  **{m.get('chosen_form','')}**\n",
         f"_Why this form:_ {m.get('why_this_form','')}\n",
         "## Prerequisites (footing, defined in-document)"]
    for p in m.get("prerequisites", []):
        L.append(f"- **{p.get('term','')}** — {p.get('what_it_is','')}")
    L += ["\n## Delivery\n```json", json.dumps(m.get("delivery", {}), indent=2, ensure_ascii=False), "```\n",
          f"**The turn:** {m.get('the_turn','')}\n",
          f"**Narrator notes:** {m.get('narrator_notes','')}\n",
          f"## Evolving diagram ({len(m.get('visual_beats',[]))} beats)"]
    for vb in m.get("visual_beats", []):
        L.append(f"- **step {vb.get('step')}** — shows: {vb.get('shows')}  \n  _change:_ {vb.get('change')}")
    return "\n".join(L)

def call_big(mkey, system, user):
    kind, mid = s2.MODELS[mkey]
    if kind == "claude":
        return rc.with_retry(s2.claude_call, mid, system, user, 32000)      # Bedrock Opus ceiling (matches Metis)
    return rc.with_retry(s2.gemini_call, mid, system, user, 64000)          # Gemini output ceiling

def task(mkey, slug, ins):
    m = rc.parse_json(call_big(mkey, MATERIAL_SYSTEM, material_user(ins)))
    (OUT / f"material_v2_{mkey}_{slug}.md").write_text(render(mkey, m))
    return mkey, slug, m.get("chosen_form"), len(json.dumps(m))

def main():
    insights = {
        "johnson-gauge": s2.load_johnson(),
        "story":  insight_from("mine_opus5_story_1.md"),
        "puzzle": insight_from("mine_opus5_puzzle_1.md"),
    }
    jobs = [(mk, slug, ins) for slug, ins in insights.items() for mk in s2.MODELS]
    print(f"stage2 v2 material — {len(jobs)} calls", flush=True)
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(task, *j): j for j in jobs}
        for f in as_completed(futs):
            try:
                mk, slug, form, size = f.result()
                print(f"  ✓ material_v2_{mk}_{slug} — {form} ({size} chars)", flush=True)
            except Exception as e:
                j = futs[f]; print(f"  ✗ material_v2_{j[0]}_{j[1]} — {e}", flush=True)
    print("✓ saved v2 material to stage2/")

if __name__ == "__main__":
    main()
