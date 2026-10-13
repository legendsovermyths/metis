"""Builds report.html: sheets + narrator/chat text side by side (relative paths)."""
import html
from pathlib import Path

OUT = Path("out")
M = ["gemini-3.1-pro-preview", "gpt-5.6-sol", "gpt-6-astra"]
h = ["<html><head><meta charset=utf-8><title>Model eval</title><style>body{font-family:sans-serif;margin:20px}"
     "img{max-width:100%;border:1px solid #ccc}.row{display:flex;gap:10px}.col{flex:1;min-width:0}"
     "pre{white-space:pre-wrap;font-size:12px;background:#f6f6f6;padding:8px;max-height:600px;overflow:auto}</style></head><body>",
     "<h1>Claude replacement eval</h1><p>See REPORT.md for verdicts.</p>"]
for kind in ["illustrator", "enhancer", "compose"]:
    h.append(f"<h2>{kind}</h2>")
    for p in sorted((OUT / "_sheets").glob(f"{kind}_*.png")):
        h.append(f"<h3>{p.stem}</h3><a href='{p}'><img src='{p}'></a>")
h.append("<h2>narrator</h2>")
for d in sorted((OUT / "narrator").iterdir()):
    cols = [("prod", OUT / "prod" / d.name / "narrator.md")] + [(m, d / m / "narrator.md") for m in M]
    h.append(f"<h3>dialogue {d.name}</h3><div class=row>")
    for name, f in cols:
        t = f.read_text() if f.exists() else "(missing)"
        h.append(f"<div class=col><b>{name}</b><pre>{html.escape(t)}</pre></div>")
    h.append("</div>")
h.append("<h2>chat</h2>")
for d in sorted((OUT / "chat").iterdir()):
    h.append(f"<h3>{d.name}</h3><div class=row>")
    for m in M[1:]:
        f = d / m / "chat.md"
        t = f.read_text() if f.exists() else "(missing)"
        h.append(f"<div class=col><b>{m}</b><pre>{html.escape(t)}</pre></div>")
    h.append("</div>")
Path("report.html").write_text("\n".join(h + ["</body></html>"]))
print("wrote report.html")
