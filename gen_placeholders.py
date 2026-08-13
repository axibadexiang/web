"""
生成艺术家网站占位图（SVG，离线可用）。
每个项目：1 张封面(竖版) + 6 张画廊图(竖版/横版混合)。
风格：高端渐变 + 艺术纹理 + 颗粒 + 项目编号水印。
"""
import os
import math

OUT = os.path.join(os.path.dirname(__file__), "assets", "img")
os.makedirs(OUT, exist_ok=True)

# 每个项目的配色与纹理风格 (c1 -> c2 渐变)
PROJECTS = [
    {"id": "p1", "c1": "#1b2a4a", "c2": "#6b8cae", "style": "circles", "accent": "#c9a36b"},
    {"id": "p2", "c1": "#2b1d2e", "c2": "#a25b6e", "style": "lines",   "accent": "#e0b0a0"},
    {"id": "p3", "c1": "#14241f", "c2": "#5e8b7e", "style": "waves",   "accent": "#d8c8a0"},
    {"id": "p4", "c1": "#3a2c12", "c2": "#d9a441", "style": "rays",    "accent": "#fff1cf"},
    {"id": "p5", "c1": "#101418", "c2": "#3f5a6b", "style": "grid",    "accent": "#9fc0d0"},
    {"id": "p6", "c1": "#241016", "c2": "#7d4a5a", "style": "blur",    "accent": "#e7c2cf"},
]

GRAIN = """<filter id='grain'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix type='saturate' values='0'/><feComponentTransfer><feFuncA type='linear' slope='0.06'/></feComponentTransfer><feComposite operator='over' in2='SourceGraphic'/></filter>"""


def defs(c1, c2, accent, gid):
    return f"""
  <defs>
    <linearGradient id='grad{gid}' x1='0' y1='0' x2='1' y2='1'>
      <stop offset='0' stop-color='{c1}'/>
      <stop offset='0.55' stop-color='{c2}'/>
      <stop offset='1' stop-color='{c1}'/>
    </linearGradient>
    <radialGradient id='vig{gid}' cx='50%' cy='42%' r='75%'>
      <stop offset='0.45' stop-color='#000000' stop-opacity='0'/>
      <stop offset='1' stop-color='#000000' stop-opacity='0.55'/>
    </radialGradient>
    {GRAIN}
  </defs>"""


def deco(style, w, h, accent, gid):
    """艺术纹理叠加，半透明。"""
    s = ""
    if style == "circles":
        for i in range(7):
            r = 60 + i * 70
            op = 0.10 - i * 0.012
            s += f"<circle cx='{w*0.72}' cy='{h*0.28}' r='{r}' fill='none' stroke='{accent}' stroke-opacity='{max(op,0.02):.2f}' stroke-width='1.2'/>"
    elif style == "lines":
        for i in range(0, w, 46):
            s += f"<line x1='{i}' y1='0' x2='{i+w*0.18}' y2='{h}' stroke='{accent}' stroke-opacity='0.05' stroke-width='1'/>"
    elif style == "waves":
        path = f"M0 {h*0.6}"
        for x in range(0, w + 60, 60):
            path += f" Q {x+30} {h*0.6 - 40*math.sin(x/120)} {x+60} {h*0.6}"
        s = f"<path d='{path}' fill='none' stroke='{accent}' stroke-opacity='0.14' stroke-width='1.5'/>"
        s += f"<path d='M0 {h*0.75} " + " ".join(f"Q {x+30} {h*0.75 - 30*math.sin(x/100)} {x+60} {h*0.75}" for x in range(0, w, 60)) + "' fill='none' stroke='{accent}' stroke-opacity='0.08' stroke-width='1.5'/>"
    elif style == "rays":
        cx, cy = w * 0.3, h * 0.32
        for i in range(14):
            a = math.pi * 2 * i / 14
            x2 = cx + math.cos(a) * w
            y2 = cy + math.sin(a) * h
            s += f"<line x1='{cx}' y1='{cy}' x2='{x2:.0f}' y2='{y2:.0f}' stroke='{accent}' stroke-opacity='0.06' stroke-width='1'/>"
    elif style == "grid":
        for i in range(0, w, 70):
            s += f"<line x1='{i}' y1='0' x2='{i}' y2='{h}' stroke='{accent}' stroke-opacity='0.06' stroke-width='1'/>"
        for j in range(0, h, 70):
            s += f"<line x1='0' y1='{j}' x2='{w}' y2='{j}' stroke='{accent}' stroke-opacity='0.06' stroke-width='1'/>"
    else:  # blur
        for i in range(5):
            s += f"<circle cx='{w*(0.3+0.1*i)}' cy='{h*(0.4+0.05*i)}' r='{h*0.22}' fill='{accent}' fill-opacity='0.05'/>"
    return s


def make_svg(w, h, proj, label, idx):
    gid = proj["id"] + str(idx)
    svg = f"""<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 {w} {h}' preserveAspectRatio='xMidYMid slice'>
{defs(proj['c1'], proj['c2'], proj['accent'], gid)}
  <rect width='{w}' height='{h}' fill='url(#grad{gid})'/>
  {deco(proj['style'], w, h, proj['accent'], gid)}
  <rect width='{w}' height='{h}' fill='url(#vig{gid})'/>
  <rect width='{w}' height='{h}' filter='url(#grain)' opacity='0.5'/>
  <text x='{w*0.5}' y='{h*0.5}' fill='#ffffff' fill-opacity='0.92' font-family='Georgia, serif' font-size='{int(min(w,h)*0.07)}' font-style='italic' text-anchor='middle'>{label}</text>
  <text x='{w*0.5}' y='{h*0.5 + min(w,h)*0.09}' fill='#ffffff' fill-opacity='0.5' font-family='Helvetica, Arial, sans-serif' font-size='{int(min(w,h)*0.03)}' letter-spacing='4' text-anchor='middle'>{proj['id'].upper()} · {idx:02d}</text>
</svg>"""
    return svg


# 封面（竖版）
for p in PROJECTS:
    cover = make_svg(1200, 1500, p, "COVER", 0)
    with open(os.path.join(OUT, f"{p['id']}-cover.svg"), "w", encoding="utf-8") as f:
        f.write(cover)

# 画廊图（竖版/横版混合，6 张）
aspects = [(1200, 1500), (1600, 1100), (1200, 1500), (1600, 1100), (1200, 1500), (1600, 1100)]
for p in PROJECTS:
    for i, (w, h) in enumerate(aspects, start=1):
        img = make_svg(w, h, p, f"PLATE {i:02d}", i)
        with open(os.path.join(OUT, f"{p['id']}-{i}.svg"), "w", encoding="utf-8") as f:
            f.write(img)

print("generated", len(PROJECTS), "projects")
print("files:", len(os.listdir(OUT)))
