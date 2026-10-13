"""Fan out model_probe runs. Usage: python3 run_probes.py [filter-substring]"""
import os, subprocess, sys, json
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

HERE = Path(__file__).resolve().parent
BIN = HERE.parents[1] / "service/target/debug/examples/model_probe"
CWD = HERE / "run/cwd"
OUT = HERE / "out"
ENV = dict(os.environ, PROBE_ENV=os.environ.get("PROBE_ENV", "/Users/anirudhsingh/Desktop/Projects/Metis/service/.env"))

GEMINI, SOL, ASTRA = "gemini-3.1-pro-preview", "gpt-5.6-sol", "gpt-6-astra"
DIALOGUES = [107, 146, 158, 170, 193, 98, 206, 210]
COMPOSE = [107, 158, 193, 206]
EXPLANATIONS = [1, 3, 4]
CHATS = [(99, 0), (146, 0), (3, 0), (116, 0), (154, 3), (125, 1)]

jobs = []
for d in DIALOGUES:
    jobs.append(("prod", d, "prod", None, f"prod/{d}"))
    for m in (GEMINI, SOL, ASTRA):
        jobs.append(("narrator", d, m, None, f"narrator/{d}/{m}"))
        jobs.append(("illustrator", d, m, None, f"illustrator/{d}/{m}"))
    for m in (SOL, ASTRA):
        jobs.append(("curator", d, m, None, f"curator/{d}/{m}"))
        jobs.append(("enhancer", d, m, None, f"enhancer/{d}/{m}"))
for d in COMPOSE:
    for m in (SOL, ASTRA):
        jobs.append(("compose", d, m, GEMINI, f"compose/{d}/{m}"))
for e in EXPLANATIONS:
    for m in (SOL, ASTRA):
        jobs.append(("architect", e, m, None, f"architect/{e}/{m}"))
for d, t in CHATS:
    for m in (SOL, ASTRA):
        jobs.append(("chat", d, m, str(t), f"chat/{d}_t{t}/{m}"))

flt = sys.argv[1] if len(sys.argv) > 1 else ""
jobs = [j for j in jobs if flt in j[4]]

def done(stage, out):
    log = OUT / out / f"{stage}.log.json"
    return log.exists() and not any("fatal" in x for x in json.loads(log.read_text()))

def run(job):
    stage, i, model, extra, out = job
    if done(stage, out):
        return f"skip {out}"
    args = [str(BIN), stage, str(i), model, str(OUT / out)] + ([extra] if extra else [])
    r = subprocess.run(args, cwd=CWD, env=ENV, capture_output=True, text=True, timeout=3600)
    (OUT / out).mkdir(parents=True, exist_ok=True)
    (OUT / out / f"{stage}.stderr.txt").write_text(r.stderr)
    return f"{'ok ' if r.returncode == 0 else 'ERR'} {out}"

with ThreadPoolExecutor(int(os.environ.get("PAR", "8"))) as ex:
    for line in ex.map(run, jobs):
        print(line, flush=True)
