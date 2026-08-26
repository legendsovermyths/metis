#!/usr/bin/env python3
"""
v3 — corrected model:
  Stage 1  mine insight (fascination + the turn foregrounded; form ∈ teach/story/puzzle)
  Stage 2  SOURCE DOCUMENT = freeform markdown (prerequisites + full delivery). Nothing else.
           (TikZ + dialogue are built OFF this document downstream — not here.)
Runs 4 domains × 2 models, end-to-end. Saves to v3/.
"""
import json, urllib.request, importlib.util, pathlib
from concurrent.futures import ThreadPoolExecutor, as_completed

HERE = pathlib.Path(__file__).parent
OUT = HERE / "v3"; OUT.mkdir(exist_ok=True)
def load(n):
    s = importlib.util.spec_from_file_location(n, HERE / f"{n}.py"); m = importlib.util.module_from_spec(s); s.loader.exec_module(m); return m
rc = load("run_compare")

MODELS = {"opus5": ("claude", "us.anthropic.claude-opus-5"),
          "gemini31": ("gemini", "gemini-3.1-pro-preview")}

def claude_call(model, system, user, max_tokens=32000):
    body = {"anthropic_version": "bedrock-2023-05-31", "max_tokens": max_tokens, "system": system,
            "messages": [{"role": "user", "content": user}], "thinking": {"type": "adaptive"},
            "output_config": {"effort": "medium"}}
    req = urllib.request.Request(f"{rc.BEDROCK_URL}/model/{model}/invoke", data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {rc.env('BEDROCK_API_KEY')}", "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=600) as r:
        resp = json.loads(r.read().decode())
    for b in resp.get("content", []):
        if b.get("type") == "text": return b["text"]
    raise RuntimeError("claude: no text")

def gemini_call(model, system, user, max_tokens=60000, json_mode=False):
    tok = rc.gemini_token(); proj = rc._token["project"]
    url = f"https://aiplatform.googleapis.com/v1/projects/{proj}/locations/global/publishers/google/models/{model}:generateContent"
    gc = {"maxOutputTokens": max_tokens}
    if json_mode: gc["responseMimeType"] = "application/json"
    body = {"systemInstruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": [{"text": user}]}], "generationConfig": gc}
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json", "x-goog-user-project": proj}, method="POST")
    with urllib.request.urlopen(req, timeout=600) as r:
        resp = json.loads(r.read().decode())
    cand = resp["candidates"][0]
    texts = [p["text"] for p in cand.get("content", {}).get("parts", []) if isinstance(p, dict) and p.get("text")]
    if not texts: raise RuntimeError(f"gemini: no text (finishReason={cand.get('finishReason')})")
    return "".join(texts)

def mine(mkey, system, user):
    kind, mid = MODELS[mkey]
    if kind == "claude": return rc.with_retry(claude_call, mid, system, user)
    return rc.with_retry(lambda m, s, u: gemini_call(m, s, u, 20000, True), mid, system, user)

def source(mkey, system, user):
    kind, mid = MODELS[mkey]
    if kind == "claude": return rc.with_retry(claude_call, mid, system, user)
    return rc.with_retry(lambda m, s, u: gemini_call(m, s, u, 60000, False), mid, system, user)

# ---------------- Stage 1 prompt ----------------
INSIGHT_SYSTEM = """You are the Insight Miner for an app of *unstructured learning* — the antidote to doomscrolling. You surface a single, true, self-contained *insight* a curious person savours in a couple of minutes: a takeaway that makes them go "wait — REALLY?" and feel a little smarter and more alive than before they picked up the phone.

## Your one job: FASCINATION
An insight without a jolt is worthless here. Every insight must have a **turn** — a reversal, a hidden mechanism, a surprising unity, a thing that is not what it seems — and you must write it to LAND that turn. The `insight` text should read like the sentence someone reads aloud to a friend across the table. Lead with the fascination; make the reader feel the jolt, not just receive a fact.

Learn the bar by contrast.
GENERIC SLUDGE (never): "Binary search is O(log n)." "The derivative is a rate of change." "Primes have two divisors."
OUTSTANDING (target — CALIBRATION ONLY, never output these): the vector potential was dismissed as fiction until Aharonov–Bohm made it physical; Monty Hall switching wins 2/3 because opening a door leaks where the car isn't; the Möbius function exists so you can UNDO a summation.
What the great ones share: a genuine turn, truth, compactness, and a fit to THIS reader's taste.

## Two dials
- **LEVEL** — from their resources; aim NEAR the ceiling, never trivial, never over their head.
- **TASTE** — the resources are an aesthetic fingerprint, not a topic whitelist; roam anywhere that hits it.

## Truth is the only hard gate
Name the real theorem/effect in `grounding`. Never invent a citation.

## Delivery form (a hint for the next stage)
Pick the form that best delivers this insight:
- **teach** — most insights: a fascinating true thing you simply explain well and vividly. This is the honest default; use it unless story or puzzle clearly fits better.
- **story** — the punch is a historical/human reversal or a "turned out to be X" tale.
- **puzzle** — it can be posed as a concrete question with an objective, counterintuitive, head-solvable answer.

## Output — single valid JSON object, no prose, no fences:
{
  "title": "3-6 word handle",
  "insight": "The takeaway, written to FASCINATE — lead with the turn, 2-5 sentences, vivid and precise.",
  "the_turn": "One sentence naming exactly what makes this surprising.",
  "domain": "sub-area",
  "taste_match": "why THIS reader will love it",
  "level_fit": "why it sits near their ceiling (name the concepts it assumes)",
  "grounding": "the real theorem/effect (for truth-checking)",
  "form_hint": "teach | story | puzzle — + one clause why"
}
Produce exactly ONE outstanding insight. Calibration examples are OFF LIMITS."""

# ---------------- Stage 2 prompt (freeform source document) ----------------
SOURCE_SYSTEM = """You write the SOURCE DOCUMENT for one insight. This document is the single source of truth: downstream, a narrator turns it into spoken bite-sized dialogue and an illustrator turns it into TikZ diagrams. You write ONLY the knowledge, delivered beautifully, as freeform MARKDOWN. No JSON. No diagram instructions. No dialogue script. No stage directions. Just the document.

It must contain two things, and be complete enough that someone could teach the whole insight from it without looking anything else up:

1. **Prerequisites.** Open with a short `## Prerequisites` section listing every concept the insight leans on (they are usually named in `level_fit` and appear in the insight). For each, give a crisp one- or two-sentence "what it is" — definitional footing only, NO derivation, NO full lesson. Enough to re-seat a reader who half-remembers the term. Err toward including one rather than assuming it.

2. **The delivery.** Then deliver the insight FULLY: set it up, walk the mechanism, and show WHY it is true — every logical step, computations carried out, self-contained. A reader must finish understanding *why*, not merely *that* it is surprising. Restating the insight with adjectives is failure. And keep the fascination alive — this should be a pleasure to read, never a dry lecture.

**Clarity — write to be UNDERSTOOD, not to impress.** Use plain, concrete, everyday language. Reach for a technical term only when it genuinely earns its place, and when you do, define it in plain words the first time it appears. Prefer a vivid concrete example or a good analogy over abstract phrasing. The test: a curious reader from outside this subfield should be able to follow every single sentence. Keep the jargon in the Prerequisites section; keep the delivery human.

Choose the delivery MODE that best fits, and note it once at the very top as `**Mode:** teach|story|puzzle`:
- **teach** — explain the fascinating thing directly and vividly (the honest default).
- **story** — deliver it as a historical/human narrative whose beats carry the mechanism.
- **puzzle** — pose the concrete question, let it breathe, then reveal and fully explain the answer.

Length is subordinate to completeness — take as long as the insight needs; do not compress. Use LaTeX (`$...$`, `$$...$$`) for math. Output pure markdown, starting with the Mode line, then `## Prerequisites`, then the delivery."""

DOMAINS = [
    ("probability",  "a counterintuitive result in probability or expectation"),
    ("number-crypto","number theory, cryptography, or arithmetic structure"),
    ("physics",      "a hidden structure in physics or a deep math–physics connection"),
    ("algorithms",   "algorithms, computation, or complexity — reframing something familiar"),
]

def render_insight(mkey, ins):
    return "\n".join([f"# [{mkey}] {ins.get('title','')}\n", f"## Insight\n{ins.get('insight','')}\n",
        f"- **The turn:** {ins.get('the_turn','')}", f"- **Domain:** {ins.get('domain','')}",
        f"- **Taste match:** {ins.get('taste_match','')}", f"- **Level fit:** {ins.get('level_fit','')}",
        f"- **Grounding:** {ins.get('grounding','')}", f"- **Form hint:** {ins.get('form_hint','')}\n",
        "```json", json.dumps(ins, indent=2, ensure_ascii=False), "```"])

def pipeline(mkey, slug, domain):
    ins = rc.parse_json(mine(mkey, INSIGHT_SYSTEM, rc.insight_user(domain)))
    (OUT / f"{mkey}_{slug}_insight.md").write_text(render_insight(mkey, ins))
    doc = source(mkey, SOURCE_SYSTEM, "## The mined insight\n" + json.dumps(ins, indent=2, ensure_ascii=False)
                 + "\n\nWrite the complete source document (freeform markdown) for this insight.")
    (OUT / f"{mkey}_{slug}_source.md").write_text(doc.strip())
    return mkey, slug, ins.get("title"), ins.get("form_hint", "").split("|")[0].split()[0] if ins.get("form_hint") else "?"

def main():
    jobs = [(mk, slug, dom) for mk in MODELS for slug, dom in DOMAINS]
    print(f"v3: {len(jobs)} pipelines (mine → source doc)", flush=True)
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(pipeline, *j): j for j in jobs}
        for f in as_completed(futs):
            try:
                mk, slug, title, form = f.result(); print(f"  ✓ {mk}_{slug} — '{title}' [{form}]", flush=True)
            except Exception as e:
                j = futs[f]; print(f"  ✗ {j[0]}_{j[1]} — {e}", flush=True)
    print(f"✓ saved → {OUT}")

if __name__ == "__main__":
    main()
