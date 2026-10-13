"""Render every SVG under out/ to a PNG (white background) via headless Chrome."""
import re, subprocess, sys, tempfile
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
OUT = Path(__file__).resolve().parent / "out"
W = 1400

def dims(svg: str):
    m = re.search(r'viewBox=["\']([\d.\-\s]+)["\']', svg)
    if m:
        _, _, w, h = map(float, m.group(1).split())
        return w, h
    w = re.search(r'width=["\']([\d.]+)', svg); h = re.search(r'height=["\']([\d.]+)', svg)
    return float(w.group(1)), float(h.group(1))

def render(p: Path):
    png = p.with_suffix(".png")
    if png.exists() and png.stat().st_mtime > p.stat().st_mtime and "--force" not in sys.argv:
        return
    w, h = dims(p.read_text(errors="ignore"))
    H = max(200, int(W * h / w) + 20)
    html = f'<html><body style="margin:0;background:#fff"><img src="file://{p}" style="width:{W}px;display:block"></body></html>'
    with tempfile.NamedTemporaryFile("w", suffix=".html", delete=False) as f:
        f.write(html)
    with tempfile.TemporaryDirectory() as ud:
        subprocess.run([CHROME, "--headless=new", "--disable-gpu", "--hide-scrollbars", f"--user-data-dir={ud}",
                        f"--window-size={W},{H}", f"--screenshot={png}", "--allow-file-access-from-files",
                        f"file://{f.name}"], capture_output=True, timeout=120)
    Path(f.name).unlink()

svgs = [p for p in OUT.rglob("*.svg")]
with ThreadPoolExecutor(6) as ex:
    list(ex.map(render, svgs))
print(f"rendered {len(svgs)} svgs")
