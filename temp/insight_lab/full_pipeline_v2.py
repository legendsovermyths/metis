#!/usr/bin/env python3
"""
End-to-end pipeline, a couple of times per model:
  mine one fresh insight  ->  build v2 source material (uncapped)
model-consistent (same model does both stages). Saves to stage2/pipeline/.
"""
import json, pathlib, importlib.util
from concurrent.futures import ThreadPoolExecutor, as_completed

HERE = pathlib.Path(__file__).parent
OUT = HERE / "stage2" / "pipeline"; OUT.mkdir(parents=True, exist_ok=True)

def load(name):
    spec = importlib.util.spec_from_file_location(name, HERE / f"{name}.py")
    m = importlib.util.module_from_spec(spec); spec.loader.exec_module(m); return m
rc = load("run_compare")
s2 = load("stage2")
v2 = load("stage2_material_v2")

DOMAINS = [
    "a counterintuitive result in probability, combinatorics, or number theory that rewards this reader's taste",
    "a deep structural connection in algorithms, computation, or physics — something that reframes what he already knows",
]

def pipeline(mkey, i):
    dom = DOMAINS[i]
    ins = rc.parse_json(s2.call(mkey, rc.INSIGHT_SYSTEM, rc.insight_user(dom)))
    (OUT / f"pipeline_{mkey}_{i}_insight.md").write_text(
        s2.render_insight(mkey, ins.get("form_hint", "?"), ins))
    mat = rc.parse_json(v2.call_big(mkey, v2.MATERIAL_SYSTEM, v2.material_user(ins)))
    (OUT / f"pipeline_{mkey}_{i}_material.md").write_text(v2.render(mkey, mat))
    return mkey, i, ins.get("title", "?"), mat.get("chosen_form", "?")

def main():
    jobs = [(mk, i) for mk in s2.MODELS for i in range(2)]
    print(f"running {len(jobs)} full pipelines (mine -> v2 material)", flush=True)
    with ThreadPoolExecutor(max_workers=4) as ex:
        futs = {ex.submit(pipeline, *j): j for j in jobs}
        for f in as_completed(futs):
            try:
                mk, i, title, form = f.result()
                print(f"  ✓ pipeline_{mk}_{i} — '{title}' -> {form}", flush=True)
            except Exception as e:
                j = futs[f]; print(f"  ✗ pipeline_{j[0]}_{j[1]} — {e}", flush=True)
    print(f"✓ saved → {OUT}")

if __name__ == "__main__":
    main()
