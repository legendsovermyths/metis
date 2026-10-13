import json
from pathlib import Path
from collections import defaultdict
OUT = Path(__file__).resolve().parent / "out"
rows = defaultdict(list)
for log in OUT.rglob("*.log.json"):
    parts = log.relative_to(OUT).parts
    stage, model = parts[0], parts[-2]
    if stage == "prod": continue
    L = json.loads(log.read_text())
    secs = sum(x.get("seconds", 0) for x in L)
    info = {"id": parts[1], "secs": round(secs)}
    for x in L:
        if "rendered_on_attempt" in x: info.setdefault("ill_attempt", []).append(x["rendered_on_attempt"])
        if x.get("gave_up"): info["ill_gave_up"] = True
        if "result" in x: info.setdefault("enh", []).append(x["result"] + (f":{x.get('n_snippets')}" if x.get("n_snippets") else ""))
        if "parse_error" in x: info.setdefault("parse_err", 0); info["parse_err"] += 1
        if "fatal" in x: info["fatal"] = x["fatal"][:80]
    for v in log.parent.glob("*validation.json"):
        V = json.loads(v.read_text())
        info["val"] = f"parts={V['n_parts']} segs={V['n_segments']} concat_ok={V['segments_concat_equals_dialogue']} unchanged={V['dialogue_unchanged_from_input']} never={len(V['parts_never_revealed'])} dup={len(V['parts_revealed_twice'])} unk={len(V['unknown_ids'])} naming={len(V['naming_violations'])} acts={V['actions']}"
    rows[(stage, model)].append(info)
for (stage, model), items in sorted(rows.items()):
    print(f"\n== {stage} / {model}  mean_secs={sum(i['secs'] for i in items)/len(items):.0f}")
    for i in sorted(items, key=lambda x: x["id"]): print("  ", i)
print("\n== prod (Claude) curation validation")
for v in sorted(OUT.glob("prod/*/curation.validation.json")):
    V = json.loads(v.read_text()); print("  ", v.parent.name, f"parts={V['n_parts']} segs={V['n_segments']} concat_ok={V['segments_concat_equals_dialogue']} never={len(V['parts_never_revealed'])} dup={len(V['parts_revealed_twice'])} unk={len(V['unknown_ids'])} acts={V['actions']}")
