#!/usr/bin/env python3
"""Generates assets/og-banner.png (1200x630) — the RP UI Kit banner.
Run: python3 assets/og-banner.py   (needs Pillow)"""
from PIL import Image, ImageDraw, ImageFont
import math, random, os

W, H = 1200, 630
BG = (21, 18, 16); CREAM = (242, 234, 217); ACC = (255, 138, 42)
DIM = (128, 118, 104); DARK = (28, 25, 22); GREEN = (158, 242, 77); PINK = (232, 121, 249)
FB = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
FM = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono-Bold.ttf"
FMr = "/usr/share/fonts/truetype/dejavu/DejaVuSansMono.ttf"

def font(p, s): return ImageFont.truetype(p, s)

im = Image.new("RGB", (W, H), BG)
d = ImageDraw.Draw(im)

# blueprint grid
for x in range(0, W, 30): d.line((x, 0, x, H), fill=(32, 29, 26))
for y in range(0, H, 30): d.line((0, y, W, y), fill=(32, 29, 26))
# glow at bottom
for i in range(80):
    a = int(26 * (1 - i/80))
    d.line((0, H-52-i, W, H-52-i), fill=(21+int((150)*a/255), 18+int((60)*a/255), 16), width=1)

def rr(box, r, **kw): d.rounded_rectangle(box, radius=r, **kw)

# --- title block ---
x0, y = 70, 88
f1, f2, f3 = font(FB, 100), font(FM, 150), font(FMr, 26)
d.text((x0+3, y+3), "RP UI KIT", font=f1, fill=(84, 76, 66))
d.text((x0, y), "RP UI KIT", font=f1, fill=CREAM)
d.text((x0, y+112), "интерфейсы", font=font(FB, 58), fill=BG, stroke_width=4, stroke_fill=ACC)
d.text((x0+2, y+112), "интерфейсы", font=font(FB, 58), fill=ACC)
d.text((x0+4, y+182), "готовые", font=font(FB, 58), fill=CREAM)
d.text((x0, y+262), "инвентарь · телефон · HUD · чат", font=f3, fill=DIM)
d.text((x0, y+300), "для любого движка — RAGE MP, alt:V, NUI", font=f3, fill=CREAM)

# dashed separator + chips
yy = y + 356
d.line((x0, yy, x0+640, yy), fill=(70, 64, 56), width=2)
chips = [("RAGE MP", ACC), ("alt:V", ACC), ("BROWSER", GREEN), ("MIT", PINK)]
cx = x0
for txt, col in chips:
    w = d.textlength(txt, font=font(FM, 20)) + 28
    rr((cx, yy+16, cx+w, yy+52), 8, outline=col, width=2)
    d.text((cx+14, yy+23), txt, font=font(FM, 20), fill=col)
    cx += w + 12

# --- mini inventory card (right side) ---
random.seed(7)
px, py, pw, ph = 770, 70, 360, 400
rr((px+10, py+10, px+10+pw, py+10+ph), 20, fill=(0, 0, 0))
rr((px, py, px+pw, py+ph), 20, fill=(26, 23, 20), outline=(60, 55, 48), width=3)
d.text((px+22, py+16), "▸ INVENTORY", font=font(FM, 20), fill=CREAM)
d.text((px+pw-22, py+16), "7.2/30kg", font=font(FM, 18), fill=DIM, anchor="rt")
cell = (pw-44-5*10) // 6
gx, gy = px+22, py+56
EMO = {1: "", }
colors = [(58,52,45), (255,138,42), (158,242,77), (74,166,255)]
for r in range(5):
    for c in range(6):
        v = random.random()
        fill = colors[1] if v > 0.86 else colors[2] if v > 0.7 else colors[3] if v > 0.62 else colors[0]
        rr((gx+c*(cell+10), gy+r*(cell+10), gx+c*(cell+10)+cell, gy+r*(cell+10)+cell), 8,
           fill=fill, outline=(60,55,48) if v <= 0.62 else None, width=2)
# drag ghost hint
d.line((px+pw-120, py+ph-96, px+pw-60, py+ph-58), fill=ACC, width=5)
d.polygon([(px+pw-60, py+ph-58), (px+pw-68, py+ph-50), (px+pw-50, py+ph-40)], fill=ACC)

# --- mini speedometer dangle ---
sx, sy = 830, 505
rr((sx+8, sy+8, sx+8+300, sy+8+80), 14, fill=(0, 0, 0))
rr((sx, sy, sx+300, sy+80), 14, fill=(26, 23, 20), outline=(60, 55, 48), width=3)
d.text((sx+20, sy+14), "128", font=font(FB, 46), fill=CREAM)
d.text((sx+20+78, sy+38), "км/ч", font=font(FM, 18), fill=DIM)
rr((sx+20, sy+68, sx+280, sy+74), 4, fill=(60, 55, 48))
rr((sx+20, sy+68, sx+210, sy+74), 4, fill=ACC)

# --- ticker strip ---
d.rectangle((0, H-52, W, H), fill=(14, 12, 10))
d.text((W//2, H-27), "hilsetapp.github.io/rp-ui-kit  ⚡  two files · zero build · any engine", font=font(FM, 23), fill=CREAM, anchor="mm")

d.rectangle((6, 6, W-6, H-6), outline=(60, 55, 48), width=3)

im.quantize(colors=96, method=Image.MEDIANCUT, dither=Image.FLOYDSTEINBERG).save(
    os.path.join(os.path.dirname(__file__), "og-banner.png"), "PNG", optimize=True)
print("ok")
