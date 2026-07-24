# -*- coding: utf-8 -*-
"""Diagrama principal (TEF) corregido — guía para redibujar en draw.io."""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle, Circle, FancyArrowPatch, PathPatch
from matplotlib.path import Path

D = os.path.dirname(os.path.abspath(__file__))
NAVY, AMBER, GREEN, GREY = '#1E2761', '#E8833A', '#2F8F5B', '#5A6478'
LW = 1.6

fig, ax = plt.subplots(figsize=(15, 9.4))
ax.set_xlim(0, 15); ax.set_ylim(0, 9.4); ax.axis('off')


def txt(x, y, s, fs=8.5, c=NAVY, b=True, it=False):
    ax.text(x, y, s, ha='center', va='center', fontsize=fs, color=c,
            fontweight='bold' if b else 'normal', style='italic' if it else 'normal',
            linespacing=1.3, zorder=6)

def rect(cx, cy, w, h, fc='white'):
    ax.add_patch(Rectangle((cx-w/2, cy-h/2), w, h, fc=fc, ec=NAVY, lw=LW, zorder=4))

def diamond(cx, cy, w, h, fc='white'):
    ax.add_patch(Polygon([(cx, cy+h/2), (cx+w/2, cy), (cx, cy-h/2), (cx-w/2, cy)],
                         closed=True, fc=fc, ec=NAVY, lw=LW, zorder=4))

def para(cx, cy, w, h, sk=0.35, fc='white'):
    ax.add_patch(Polygon([(cx-w/2+sk, cy+h/2), (cx+w/2+sk, cy+h/2),
                          (cx+w/2-sk, cy-h/2), (cx-w/2-sk, cy-h/2)],
                         closed=True, fc=fc, ec=NAVY, lw=LW, zorder=4))

def hexa(cx, cy, w, h, fc='white', ec=NAVY):
    k = 0.16
    ax.add_patch(Polygon([(cx-w/2, cy), (cx-w/2+k, cy+h/2), (cx+w/2-k, cy+h/2),
                          (cx+w/2, cy), (cx+w/2-k, cy-h/2), (cx-w/2+k, cy-h/2)],
                         closed=True, fc=fc, ec=ec, lw=LW, zorder=4))

def circle(cx, cy, r, s, fc='white', fs=9):
    ax.add_patch(Circle((cx, cy), r, fc=fc, ec=NAVY, lw=LW, zorder=5))
    txt(cx, cy, s, fs=fs)

def doc(cx, cy, w, h, fc='white'):
    verts = [(cx-w/2, cy-h/2+0.12), (cx-w/2, cy+h/2), (cx+w/2, cy+h/2), (cx+w/2, cy-h/2+0.12),
             (cx+w/4, cy-h/2-0.08), (cx, cy-h/2+0.12), (cx-w/4, cy-h/2-0.08), (cx-w/2, cy-h/2+0.12)]
    codes = [Path.MOVETO, Path.LINETO, Path.LINETO, Path.LINETO,
             Path.CURVE3, Path.CURVE3, Path.CURVE3, Path.CURVE3]
    ax.add_patch(PathPatch(Path(verts, codes), fc=fc, ec=NAVY, lw=LW, zorder=4))

def arrow(x1, y1, x2, y2, c=GREY):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle='-|>',
                 mutation_scale=13, lw=1.3, color=c, shrinkA=1, shrinkB=1, zorder=3))

def line(x1, y1, x2, y2, c=GREY):
    ax.plot([x1, x2], [y1, y2], color=c, lw=1.3, zorder=2)


# ---- CI ----
rect(7.5, 9.0, 1.1, 0.45); txt(7.5, 9.0, "CI", 10)
arrow(7.5, 8.77, 7.5, 8.35)

# ---- Paralelogramo: mínimos (SOLO retiros, que son vectores) ----
para(7.5, 8.0, 6.6, 0.6)
txt(7.5, 8.0, "MenorTPRPCL(i)   ·   MenorTPRPML(i)   ·   MenorTPRPGL(i)", 9)
circle(12.7, 8.0, 0.32, "1")
arrow(7.5, 7.7, 7.5, 7.25)

# ---- Diamante ----
diamond(7.5, 6.75, 2.6, 1.0)
txt(7.5, 6.75, "Busco el evento\nmás próximo", 8.5)

# ---- 8 rutinas ----
rut = [("2", "TPLLP"), ("3", "TPRPCL(i)"), ("4", "TPRPML(i)"), ("5", "TPRPGL(i)"),
       ("6", "TPDPC"), ("7", "TPDPM"), ("8", "TPDPG"), ("9", "TPPC")]
xs = [1.35 + i * 1.87 for i in range(8)]
yhex = 4.55
for (num, name), x in zip(rut, xs):
    fc = '#FDECDD' if name == 'TPPC' else 'white'
    ec = AMBER if name == 'TPPC' else NAVY
    circle(x, 5.55, 0.30, num, fs=9)
    hexa(x, yhex, 1.72, 0.7, fc=fc, ec=ec)
    txt(x, yhex, name, 8.2, c=NAVY)
    arrow(7.5, 6.1, x, 5.9)             # del diamante a cada nº
    line(x, yhex - 0.35, x, 3.55)       # de cada rutina al colector

# ---- colector -> T<=TF ----
line(xs[0], 3.55, xs[-1], 3.55)
line(7.5, 3.55, 7.5, 3.15)
arrow(7.5, 3.15, 6.6, 2.75)

# ---- T <= TF ----
diamond(6.0, 2.5, 1.9, 0.95); txt(6.0, 2.5, "T ≤ TF", 9)
# rama sí -> vuelve (A)
circle(3.4, 2.5, 0.33, "A", fs=9)
arrow(5.05, 2.5, 3.75, 2.5); txt(4.4, 2.72, "sí", 8, c=GREEN, it=True)
# rama no -> CalculoResultados
arrow(6.95, 2.5, 8.35, 2.5); txt(7.65, 2.72, "no", 8, c=GREY, it=True)
hexa(9.7, 2.5, 2.5, 0.7); txt(9.7, 2.5, "CalculoResultados", 8.5)
arrow(9.7, 2.15, 9.7, 1.55)
doc(9.7, 1.15, 2.4, 0.7); txt(9.7, 1.18, "Muestra Resultados", 8.5)

# ---- loop de A hacia arriba (vuelve al paralelogramo) ----
line(3.4, 2.83, 3.4, 8.0); arrow(3.4, 8.0, 4.35, 8.0, c=GREY)

# ---- nota de cambios ----
ax.add_patch(Rectangle((0.35, 0.25), 6.7, 1.35, fc='#EAF6EF', ec=GREEN, lw=1.3, zorder=3))
txt(0.75, 1.32, "✓ Cambios vs. el original:", 9, c=GREEN)
ax.text(0.6, 1.0, "• Se quitaron los eventos de vencimiento  MenorTPVPCL / ML / GL.\n"
        "   El vencimiento se resuelve dentro del pase de camión (TPPC), con  T − TOL ≥ TMP.\n"
        "• Las devoluciones (TPDPC/M/G) van SIN «Menor» ni «(i)»: son un escalar por tamaño,\n"
        "   no un vector. El «Menor(i)» queda solo en los retiros (TPRPCL/ML/GL).",
        ha='left', va='center', fontsize=8, color=NAVY, zorder=6)

txt(7.5, 9.32, "Diagrama principal (TEF) — versión corregida", 11, c=NAVY)
plt.tight_layout()
plt.savefig(os.path.join(D, 'diagrama_principal_corregido.png'), dpi=150,
            facecolor='white', bbox_inches='tight')
print("OK -> diagrama_principal_corregido.png")
