"""Stack labelled PNGs into one comparison sheet per dialogue (for quick review)."""
import sys
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
OUT = Path(__file__).resolve().parent / "out"
SHEETS = OUT / "_sheets"; SHEETS.mkdir(exist_ok=True)
font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 34)

def sheet(name, items, w=1400):
    tiles = []
    for label, p in items:
        if p.exists():
            im = Image.open(p).convert("RGB")
            # trim white bottom
            bbox = Image.eval(im, lambda x: 255 - x).getbbox() or (0, 0, im.width, im.height)
            im = im.crop((0, 0, im.width, min(im.height, bbox[3] + 10)))
        else:
            im = Image.new("RGB", (w, 120), "#fee"); ImageDraw.Draw(im).text((20, 40), "NO OUTPUT", fill="red", font=font)
        hdr = Image.new("RGB", (w, 50), "#223"); ImageDraw.Draw(hdr).text((12, 6), label, fill="white", font=font)
        tiles += [hdr, im]
    H = sum(t.height for t in tiles); canvas = Image.new("RGB", (w, H), "white"); y = 0
    for t in tiles: canvas.paste(t, (0, y)); y += t.height
    canvas.save(SHEETS / f"{name}.png")

for d in sorted(p.name for p in (OUT / "prod").iterdir()):
    sheet(f"illustrator_{d}", [("PROD (Gemini 3.1 Pro, original)", OUT/f"prod/{d}/illustration.png")] +
          [(f"{m} (rerun, same Claude parts)", OUT/f"illustrator/{d}/{m}/illustration.png") for m in ["gemini-3.1-pro-preview","gpt-5.6-sol","gpt-6-astra"]])
    sheet(f"enhancer_{d}", [("PROD Claude annotations", OUT/f"prod/{d}/enhanced.png")] +
          [(f"{m} annotations (same base figure)", OUT/f"enhancer/{d}/{m}/enhanced.png") for m in ["gpt-5.6-sol","gpt-6-astra"]])
    if (OUT/f"compose/{d}").exists():
        sheet(f"compose_{d}", [("PROD: Claude curator+enhancer, Gemini illustrator", OUT/f"prod/{d}/enhanced.png")] +
              [(f"{m} curator+enhancer, Gemini illustrator", OUT/f"compose/{d}/{m}/compose.enhanced.png") for m in ["gpt-5.6-sol","gpt-6-astra"]])
print("ok")
