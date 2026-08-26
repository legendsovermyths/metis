#!/usr/bin/env python3
"""
Stage 2 across TWO models (Opus 5 + Gemini 3.1 Pro):
  Phase 1 — forced-form mining: story / puzzle / argument (2 domains each)
  Phase 2 — material generation: turn chosen insights into source material
            (+ evolving-diagram beats), the substrate for dialogues.
Everything saved under stage2/.
"""
import json, re, urllib.request, importlib.util, pathlib
from concurrent.futures import ThreadPoolExecutor, as_completed

HERE = pathlib.Path(__file__).parent
OUT = HERE / "stage2"; OUT.mkdir(exist_ok=True)

def load(name):
    spec = importlib.util.spec_from_file_location(name, HERE / f"{name}.py")
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
rc  = load("run_compare")   # auth, INSIGHT_SYSTEM, PROFILE, RESOURCE_BLOCK, with_retry, parse_json
mat = load("run")           # MATERIAL_SYSTEM, material_user

MODELS = {"opus5": ("claude", "us.anthropic.claude-opus-5"),
          "gemini31": ("gemini", "gemini-3.1-pro-preview")}

def claude_call(model, system, user, max_tokens=13000):
    body = {"anthropic_version": "bedrock-2023-05-31", "max_tokens": max_tokens,
            "system": system, "messages": [{"role": "user", "content": user}],
            "thinking": {"type": "adaptive"}, "output_config": {"effort": "medium"}}
    req = urllib.request.Request(f"{rc.BEDROCK_URL}/model/{model}/invoke", data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {rc.env('BEDROCK_API_KEY')}", "Content-Type": "application/json"}, method="POST")
    with urllib.request.urlopen(req, timeout=600) as r:
        resp = json.loads(r.read().decode())
    for b in resp.get("content", []):
        if b.get("type") == "text":
            return b["text"]
    raise RuntimeError("claude: no text block")

def gemini_call(model, system, user, max_tokens=13000):
    tok = rc.gemini_token(); proj = rc._token["project"]
    url = (f"https://aiplatform.googleapis.com/v1/projects/{proj}"
           f"/locations/global/publishers/google/models/{model}:generateContent")
    body = {"systemInstruction": {"parts": [{"text": system}]},
            "contents": [{"role": "user", "parts": [{"text": user}]}],
            "generationConfig": {"responseMimeType": "application/json", "maxOutputTokens": max_tokens}}
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json", "x-goog-user-project": proj}, method="POST")
    with urllib.request.urlopen(req, timeout=600) as r:
        resp = json.loads(r.read().decode())
    cand = resp["candidates"][0]
    texts = [p["text"] for p in cand.get("content", {}).get("parts", []) if isinstance(p, dict) and p.get("text")]
    if not texts:
        raise RuntimeError(f"gemini: no text (finishReason={cand.get('finishReason')})")
    return "".join(texts)

def call(mkey, system, user):
    kind, mid = MODELS[mkey]
    fn = claude_call if kind == "claude" else gemini_call
    return rc.with_retry(fn, mid, system, user)

# ---------------- Phase 1: forced-form mining ----------------
FORM_GUIDANCE = {
    "story": "This insight MUST work as a STORY: a historical reversal, a human drama, or a 'it turned out to be X' twist — something the reader FEELS and realises, not something they solve. Choose an insight that genuinely has a narrative behind it.",
    "puzzle": "This insight MUST work as a PUZZLE: it can be posed as a concrete question with an OBJECTIVE answer (a number, yes/no, or a choice) that is counterintuitive yet solvable purely in the head, by insight rather than grinding. The insight should BE the surprising answer.",
    "argument": "This insight MUST work as an ARGUMENT: an interpretive or contested point where genuinely competing steelman positions exist and the reader is invited to take a stance.",
}
FORM_DOMAINS = {
    "story": ["the human history and reversals behind a physics idea (who resisted it, what flipped)",
              "a mathematical discovery whose meaning or status changed dramatically over time"],
    "puzzle": ["a counterintuitive probability or expectation with a concrete numeric or yes/no answer",
               "a number-theory or combinatorics brain-teaser with an exact, checkable answer"],
    "argument": ["a contested interpretation in the foundations of physics or mathematics",
                 "a computing / algorithms claim about which serious people genuinely disagree"],
}

def mine_user(domain, form):
    return (f"## Reader profile\n{rc.PROFILE}\n\n## Resources (set LEVEL and TASTE)\n{rc.RESOURCE_BLOCK}\n\n"
            f"## Assigned area\nMine your one outstanding insight from: **{domain}**.\n\n"
            f"## REQUIRED FORM\n{FORM_GUIDANCE[form]}\nSet `form_hint` to '{form}'. Do not drift to another form.")

def render_insight(mkey, form, ins):
    return "\n".join([
        f"# [{mkey}] ({form}) {ins.get('title','')}\n", f"## Insight\n{ins.get('insight','')}\n",
        f"- **The turn:** {ins.get('the_turn','')}", f"- **Domain:** {ins.get('domain','')}",
        f"- **Taste match:** {ins.get('taste_match','')}", f"- **Level fit:** {ins.get('level_fit','')}",
        f"- **Grounding:** {ins.get('grounding','')}", f"- **Form hint:** {ins.get('form_hint','')}\n",
        "<details><summary>raw json</summary>\n\n```json", json.dumps(ins, indent=2, ensure_ascii=False), "```\n</details>"])

def mine_task(mkey, form, i, domain):
    ins = rc.parse_json(call(mkey, rc.INSIGHT_SYSTEM, mine_user(domain, form)))
    (OUT / f"mine_{mkey}_{form}_{i}.md").write_text(render_insight(mkey, form, ins))
    return mkey, form, i, ins

# ---------------- Phase 2: material ----------------
def render_material(mkey, m):
    L = [f"# [{mkey}] MATERIAL — {m.get('insight_title','')}  ·  form: **{m.get('chosen_form','')}**\n",
         f"_Why this form:_ {m.get('why_this_form','')}\n", "## Material\n```json",
         json.dumps(m.get("material", {}), indent=2, ensure_ascii=False), "```\n",
         f"## Evolving diagram ({m.get('estimated_beats','?')} beats)"]
    for vb in m.get("visual_beats", []):
        L.append(f"- **step {vb.get('step')}** — shows: {vb.get('shows')}  \n  _change:_ {vb.get('change')}")
    return "\n".join(L)

def material_task(mkey, slug, insight):
    m = rc.parse_json(call(mkey, mat.MATERIAL_SYSTEM, mat.material_user(insight)))
    (OUT / f"material_{mkey}_{slug}.md").write_text(render_material(mkey, m))
    return mkey, slug, m.get("chosen_form")

def load_johnson():
    txt = (HERE / "results" / "claude_03_physics.md").read_text()
    return json.loads(re.search(r"```json\s*(\{.*?\})\s*```", txt, re.DOTALL).group(1))

def main():
    # ---- phase 1 ----
    jobs = [(mk, form, i + 1, dom)
            for form, doms in FORM_DOMAINS.items()
            for i, dom in enumerate(doms)
            for mk in MODELS]
    mined = {}
    print(f"phase 1: forced-form mining — {len(jobs)} calls", flush=True)
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(mine_task, *j): j for j in jobs}
        for f in as_completed(futs):
            try:
                mk, form, i, ins = f.result()
                mined[(mk, form, i)] = ins
                print(f"  ✓ mine_{mk}_{form}_{i} — {ins.get('title')}", flush=True)
            except Exception as e:
                j = futs[f]; print(f"  ✗ mine_{j[0]}_{j[1]}_{j[2]} — {e}", flush=True)

    # ---- choose insights for material: Johnson (argument) + opus5's story#1 + opus5's puzzle#1 ----
    chosen = [("johnson-gauge", load_johnson())]
    if ("opus5", "story", 1) in mined:   chosen.append(("story", mined[("opus5", "story", 1)]))
    if ("opus5", "puzzle", 1) in mined:  chosen.append(("puzzle", mined[("opus5", "puzzle", 1)]))

    # ---- phase 2 ----
    mjobs = [(mk, slug, ins) for slug, ins in chosen for mk in MODELS]
    print(f"\nphase 2: material — {len(mjobs)} calls", flush=True)
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(material_task, *j): j for j in mjobs}
        for f in as_completed(futs):
            try:
                mk, slug, form = f.result()
                print(f"  ✓ material_{mk}_{slug} — chose {form}", flush=True)
            except Exception as e:
                j = futs[f]; print(f"  ✗ material_{j[0]}_{j[1]} — {e}", flush=True)

    # index
    idx = ["# Stage 2 — forced forms + material (Opus 5 vs Gemini 3.1 Pro)\n",
           "## Forced-form mining\n| form | domain | Opus 5 | Gemini 3.1 |", "|---|---|---|---|"]
    for form, doms in FORM_DOMAINS.items():
        for i, dom in enumerate(doms, 1):
            o = mined.get(("opus5", form, i), {}).get("title", "—")
            g = mined.get(("gemini31", form, i), {}).get("title", "—")
            idx.append(f"| {form} | {dom[:40]}… | [{o}](mine_opus5_{form}_{i}.md) | [{g}](mine_gemini31_{form}_{i}.md) |")
    idx += ["\n## Material (source material + diagram beats)\n"]
    for slug, _ in chosen:
        idx.append(f"- **{slug}**: [opus5](material_opus5_{slug}.md) · [gemini31](material_gemini31_{slug}.md)")
    (OUT / "README.md").write_text("\n".join(idx))
    print(f"\n✓ saved → {OUT}")

if __name__ == "__main__":
    main()
