#!/usr/bin/env python3
"""
Insight-mining model comparison: 10 diversified domains x 2 models = 20 insights.
  - Claude  (us.anthropic.claude-opus-4-6-v1, effort=medium)  via Bedrock
  - Gemini  (gemini-3.1-pro-preview)                          via Vertex
Each result is written to its own file under results/.  Parallel, with retries.
Gemini SA JWT is signed with the `openssl` CLI (no pip deps).
"""
import base64, json, os, re, subprocess, sys, tempfile, time, urllib.request, urllib.error, pathlib
from concurrent.futures import ThreadPoolExecutor, as_completed

HERE = pathlib.Path(__file__).parent
ROOT = HERE.parents[1]
ENV  = ROOT / "service" / ".env"
OUT  = HERE / "results"
OUT.mkdir(exist_ok=True)

def env(key):
    for line in ENV.read_text().splitlines():
        if line.startswith(key + "="):
            v = line.split("=", 1)[1].strip()
            if len(v) >= 2 and v[0] == v[-1] and v[0] in "'\"":
                v = v[1:-1]
            return v
    sys.exit(f"no {key} in service/.env")

# ---------------- Claude (Bedrock) ----------------
BEDROCK_URL = "https://bedrock-runtime.us-west-2.amazonaws.com"
CLAUDE_MODEL = "us.anthropic.claude-opus-5"

def claude(system, user, max_tokens=9000):
    body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": max_tokens,
        "system": system,
        "messages": [{"role": "user", "content": user}],
        "thinking": {"type": "adaptive"},
        "output_config": {"effort": "medium"},
    }
    req = urllib.request.Request(
        f"{BEDROCK_URL}/model/{CLAUDE_MODEL}/invoke",
        data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {env('BEDROCK_API_KEY')}", "Content-Type": "application/json"},
        method="POST")
    with urllib.request.urlopen(req, timeout=600) as r:
        resp = json.loads(r.read().decode())
    for b in resp.get("content", []):
        if b.get("type") == "text":
            return b["text"]
    raise RuntimeError("claude: no text block")

# ---------------- Gemini (Vertex) ----------------
GEMINI_MODEL = "gemini-3.1-pro-preview"
TOKEN_URL = "https://oauth2.googleapis.com/token"
_token = {}

def b64url(b):
    return base64.urlsafe_b64encode(b).rstrip(b"=").decode()

def gemini_token():
    if _token.get("t") and time.time() < _token["exp"]:
        return _token["t"]
    sa = json.loads(env("VERTEX_AI_SERVICE_ACCOUNT"))
    now = int(time.time())
    header = b64url(json.dumps({"alg": "RS256", "typ": "JWT"}).encode())
    claims = b64url(json.dumps({
        "iss": sa["client_email"],
        "scope": "https://www.googleapis.com/auth/cloud-platform",
        "aud": TOKEN_URL, "iat": now, "exp": now + 3600,
    }).encode())
    signing_input = f"{header}.{claims}"
    with tempfile.NamedTemporaryFile("w", suffix=".pem", delete=False) as f:
        f.write(sa["private_key"]); keyfile = f.name
    try:
        sig = subprocess.run(["openssl", "dgst", "-sha256", "-sign", keyfile],
                             input=signing_input.encode(), capture_output=True, check=True).stdout
    finally:
        os.unlink(keyfile)
    jwt = f"{signing_input}.{b64url(sig)}"
    data = urllib.parse_quote if False else None
    body = f"grant_type=urn:ietf:params:oauth:grant-type:jwt-bearer&assertion={jwt}"
    req = urllib.request.Request(TOKEN_URL, data=body.encode(),
                                 headers={"Content-Type": "application/x-www-form-urlencoded"}, method="POST")
    with urllib.request.urlopen(req, timeout=60) as r:
        resp = json.loads(r.read().decode())
    _token["t"] = resp["access_token"]; _token["exp"] = time.time() + 3000
    _token["project"] = sa["project_id"]
    return _token["t"]

def gemini(system, user, max_tokens=9000):
    tok = gemini_token()
    proj = _token["project"]
    url = (f"https://aiplatform.googleapis.com/v1/projects/{proj}"
           f"/locations/global/publishers/google/models/{GEMINI_MODEL}:generateContent")
    body = {
        "systemInstruction": {"parts": [{"text": system}]},
        "contents": [{"role": "user", "parts": [{"text": user}]}],
        "generationConfig": {"responseMimeType": "application/json", "maxOutputTokens": max_tokens},
    }
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
        headers={"Authorization": f"Bearer {tok}", "Content-Type": "application/json",
                 "x-goog-user-project": proj}, method="POST")
    with urllib.request.urlopen(req, timeout=600) as r:
        resp = json.loads(r.read().decode())
    cand = resp["candidates"][0]
    parts = cand.get("content", {}).get("parts", [])
    texts = [p["text"] for p in parts if isinstance(p, dict) and p.get("text")]
    if not texts:
        raise RuntimeError(f"gemini: no text part (finishReason={cand.get('finishReason')})")
    return "".join(texts)

def with_retry(fn, *a, tries=3):
    for i in range(tries):
        try:
            return fn(*a)
        except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, RuntimeError, KeyError) as e:
            if isinstance(e, urllib.error.HTTPError):
                detail = e.read().decode()[:300]
            else:
                detail = str(e)
            if i == tries - 1:
                raise RuntimeError(f"{type(e).__name__}: {detail}")
            time.sleep(2 ** i * 3)

def parse_json(text):
    t = re.sub(r"^```(json)?|```$", "", text.strip(), flags=re.MULTILINE).strip()
    m = re.search(r"\{.*\}", t, re.DOTALL)
    return json.loads(m.group(0) if m else t)

# ---------------- inputs ----------------
PROFILE = """- **Name**: Anirudh Singh
- **Background**: Software engineer at Adobe, working on a legacy codebase for a product called Captivate.
- **Interests**: Building personal projects in Rust, competitive programming, and reading popular math books.
- **Motivation**: Self-studying math out of personal curiosity and for exploration.
- **Bridges**: Competitive programming provides a strong foundation in algorithmic thinking and logical problem-solving. Interest in Rust suggests an appreciation for systems-level logic and efficiency. Reading pop math books indicates a genuine interest in the concepts and stories behind the math."""

RESOURCES = [
    ("Competitive Programmer's Handbook — Antti Laaksonen", "Contest reference: graph algorithms, DP, number theory, range queries. Signals comfort with rigorous algorithmic reasoning and a taste for clever self-contained tricks."),
    ("Concrete Mathematics — Graham, Knuth, Patashnik", "Sums, recurrences, number theory, generating functions, discrete probability. Signals appetite for manipulation-heavy discrete math and elegant closed forms."),
    ("The Rust Programming Language ('the Book')", "Ownership, lifetimes, traits, zero-cost abstractions. Signals systems-level thinking and appreciation for correctness by design."),
    ("Prime Obsession — John Derbyshire", "Popular-math narrative of the Riemann Hypothesis. Signals love of the story and deep structure behind mathematics."),
    ("Algorithms — Jeff Erickson", "Rigorous, witty algorithms: recursion, DP, graphs, NP-hardness, why things work. Signals depth beyond contest recipes into the theory underneath."),
]
RESOURCE_BLOCK = "\n".join(f"- **{t}** — {d}" for t, d in RESOURCES)

DOMAINS = [
    ("number-theory",     "number theory & multiplicative structure (primes, modular arithmetic, arithmetic functions)"),
    ("probability",       "counterintuitive probability & expectation"),
    ("physics",           "mathematical structure hidden in physics (symmetry, conservation, potentials, gauge)"),
    ("cryptography",      "cryptography (secret sharing, one-way functions, zero-knowledge, commitments)"),
    ("computability",     "computability & logic (undecidability, self-reference, Godel-flavoured surprises)"),
    ("complexity",        "complexity theory (P vs NP intuition, reductions, pseudorandomness, hardness)"),
    ("combinatorics",     "combinatorics (generating functions, bijective proofs, double counting)"),
    ("algorithms",        "algorithmic sleight-of-hand (invariants, amortization, a clever data-structure trick)"),
    ("infinity",          "infinity & analysis (cardinality, paradoxes of the infinite, series that deceive)"),
    ("information-theory","information theory (entropy, Kolmogorov complexity, limits of compression)"),
]

INSIGHT_SYSTEM = """You are the Insight Miner for an app of *unstructured learning* — the antidote to doomscrolling. Where a structured course marches through a syllabus, you surface a single, self-contained *insight* a curious person can savour in ninety seconds on a train: a takeaway that makes them go "wait — really?" and feel a little smarter and a little more alive than before they picked up the phone.

An insight is one true, standalone idea. Not a lesson, not a syllabus, not a definition dump — one crystallised takeaway with a spark.

## What makes an insight OUTSTANDING (this is the whole job)

The bar is high. Most "facts" an LLM produces are generic sludge — true but inert. You are hunting for the opposite. Learn the bar by contrast:

GENERIC SLUDGE (never produce this):
- "Binary search runs in O(log n) time." (Everyone knows it; no spark.)
- "The derivative measures rate of change." (A definition, not an insight.)
- "Prime numbers have exactly two divisors." (Trivia, no turn.)

OUTSTANDING (this is the target — CALIBRATION ONLY, never output these or close variants):
- "The vector potential in electromagnetism was long dismissed as a mere mathematical convenience — until the Aharonov-Bohm effect showed an electron is deflected in a region where the magnetic field is exactly zero but the potential is not. The 'fiction' turned out to be more fundamental than the 'real' field, and whether it acts locally is still argued."
- "In Monty Hall, switching wins 2/3 of the time because opening a door is not a neutral act: the host leaks where the car isn't, dumping your original 1/3 of ignorance, whole, onto the one door left."
- "The Mobius function looks like an arbitrary sign rule, but it is exactly the inverse of 'sum over divisors' — it exists so you can UNDO a summation, and that one idea silently powers counting from combinatorics to the distribution of primes."

Notice what the great ones share: a **turn** (a reversal, a hidden mechanism, a surprising unity, a thing that is not what it seems), it is **true and defensible**, it is **compact**, and it rewards the reader's *specific taste*.

## The two dials
- **LEVEL** — from their resources. Aim NEAR the ceiling their resources imply: challenging but graspable in the head, never trivial, never over their head.
- **TASTE** — resources are an aesthetic fingerprint, not a topic whitelist. Roam anywhere that hits this taste.

## Truth is the only hard gate
The insight must be true and defensible. In `grounding`, name the real theorem/effect/result it rests on so it can be checked. Never invent a citation.

## Output
Respond with a single valid JSON object, no prose, no fences:
{
  "title": "3-6 word handle",
  "insight": "The takeaway, 2-5 sentences, written to land the turn. Vivid, precise, self-contained.",
  "the_turn": "One sentence naming exactly what makes this surprising — the reversal or hidden mechanism.",
  "domain": "the sub-area",
  "taste_match": "Why THIS reader will love it.",
  "level_fit": "Why it sits near their ceiling.",
  "grounding": "The real theorem/effect/result it rests on (for truth-checking).",
  "form_hint": "story | puzzle | argument — best delivery form + one clause why."
}
Produce exactly ONE outstanding insight. The calibration examples above are OFF LIMITS — find something fresh."""

def insight_user(domain_desc):
    return (f"## Reader profile\n{PROFILE}\n\n## Resources (set LEVEL and TASTE)\n{RESOURCE_BLOCK}\n\n"
            f"## Assigned area for this insight\nMine your one outstanding insight from: **{domain_desc}**.\n"
            f"Stay true to the reader's taste and level. Do not reproduce the calibration examples.")

def render(model, slug, domain_desc, ins):
    L = [f"# [{model}] {ins.get('title','')}\n",
         f"*domain area: {domain_desc}*\n",
         f"## Insight\n{ins.get('insight','')}\n",
         f"- **The turn:** {ins.get('the_turn','')}",
         f"- **Domain:** {ins.get('domain','')}",
         f"- **Taste match:** {ins.get('taste_match','')}",
         f"- **Level fit:** {ins.get('level_fit','')}",
         f"- **Grounding (truth-check):** {ins.get('grounding','')}",
         f"- **Form hint:** {ins.get('form_hint','')}\n",
         "<details><summary>raw json</summary>\n\n```json",
         json.dumps(ins, indent=2, ensure_ascii=False), "```\n</details>"]
    return "\n".join(L)

def task(idx, slug, domain_desc, model):
    fn = claude if model == "claude" else gemini
    raw = with_retry(fn, INSIGHT_SYSTEM, insight_user(domain_desc))
    ins = parse_json(raw)
    path = OUT / f"{model}_{idx:02d}_{slug}.md"
    path.write_text(render(model, slug, domain_desc, ins))
    return model, slug, ins.get("title", "?"), path.name

def main():
    only = sys.argv[1] if len(sys.argv) > 1 else "both"
    jobs = []
    for i, (slug, desc) in enumerate(DOMAINS, 1):
        if only in ("both", "claude"):
            jobs.append((i, slug, desc, "claude"))
        if only in ("both", "gemini"):
            jobs.append((i, slug, desc, "gemini"))
    results, errors = [], []
    print(f"launching {len(jobs)} calls ...", flush=True)
    with ThreadPoolExecutor(max_workers=6) as ex:
        futs = {ex.submit(task, *j): j for j in jobs}
        for f in as_completed(futs):
            j = futs[f]
            try:
                model, slug, title, name = f.result()
                results.append((model, slug, title, name))
                print(f"  ✓ {name}  — {title}", flush=True)
            except Exception as e:
                errors.append((j[3], j[1], str(e)))
                print(f"  ✗ {j[3]}_{j[0]:02d}_{j[1]}  — {e}", flush=True)

    # index
    idx = ["# Insight comparison — Claude vs Gemini (10 domains)\n",
           f"_Claude: {CLAUDE_MODEL} (effort medium) · Gemini: {GEMINI_MODEL}_\n",
           "| domain | Claude | Gemini |", "|---|---|---|"]
    bys = {}
    for model, slug, title, name in results:
        bys.setdefault(slug, {})[model] = f"[{title}]({name})"
    for slug, _ in DOMAINS:
        row = bys.get(slug, {})
        idx.append(f"| {slug} | {row.get('claude','—')} | {row.get('gemini','—')} |")
    if errors:
        idx.append("\n## errors\n")
        idx += [f"- {m}/{s}: {e}" for m, s, e in errors]
    (OUT / "README.md").write_text("\n".join(idx))
    print(f"\n✓ {len(results)}/{len(jobs)} succeeded → {OUT}/README.md")

if __name__ == "__main__":
    main()
