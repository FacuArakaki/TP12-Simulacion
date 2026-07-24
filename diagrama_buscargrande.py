# -*- coding: utf-8 -*-
"""Subrutina BuscarLockerGrandeLibre — corregida según el código."""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle, Circle, FancyArrowPatch

D = os.path.dirname(os.path.abspath(__file__))
NAVY, AMBER, GREEN, GREY, RED = '#1E2761', '#E8833A', '#2F8F5B', '#5A6478', '#C0392B'
LW = 1.5

fig, ax = plt.subplots(figsize=(13.2, 15.2))
ax.set_xlim(0, 13.2); ax.set_ylim(0, 15.2); ax.axis('off')


def txt(x, y, s, fs=8.5, c=NAVY, b=True, it=False):
    ax.text(x, y, s, ha='center', va='center', fontsize=fs, color=c,
            fontweight='bold' if b else 'normal', style='italic' if it else 'normal',
            linespacing=1.25, zorder=6)

def rect(cx, cy, w, h, fc='white', ec=NAVY):
    ax.add_patch(Rectangle((cx-w/2, cy-h/2), w, h, fc=fc, ec=ec, lw=LW, zorder=4))

def diamond(cx, cy, w, h, fc='white'):
    ax.add_patch(Polygon([(cx, cy+h/2), (cx+w/2, cy), (cx, cy-h/2), (cx-w/2, cy)],
                         closed=True, fc=fc, ec=NAVY, lw=LW, zorder=4))

def hexa(cx, cy, w, h, fc='white', ec=NAVY):
    k = 0.18
    ax.add_patch(Polygon([(cx-w/2, cy), (cx-w/2+k, cy+h/2), (cx+w/2-k, cy+h/2),
                          (cx+w/2, cy), (cx+w/2-k, cy-h/2), (cx-w/2+k, cy-h/2)],
                         closed=True, fc=fc, ec=ec, lw=LW, zorder=4))

def circ(cx, cy, r, s, fc='white', fs=9):
    ax.add_patch(Circle((cx, cy), r, fc=fc, ec=NAVY, lw=LW, zorder=5)); txt(cx, cy, s, fs)

def arrow(x1, y1, x2, y2, c=GREY):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle='-|>', mutation_scale=13,
                 lw=1.3, color=c, shrinkA=1, shrinkB=1, zorder=3))

def line(x1, y1, x2, y2, c=GREY):
    ax.plot([x1, x2], [y1, y2], color=c, lw=1.3, zorder=2)


X = 4.2
hexa(X, 14.6, 3.7, 0.65); txt(X, 14.6, "BuscarLockerGrandeLibre(tam, op)", 8.2)
arrow(X, 14.27, X, 13.85)
rect(X, 13.55, 1.7, 0.55); txt(X, 13.55, "i = 1", 9)
arrow(X, 13.27, X, 12.75)

diamond(X, 12.2, 2.9, 1.15); txt(X, 12.2, "DispPaqG(i)\n== HV ?", 8.5)
# rama NO -> i < CLTG ?
arrow(X+1.45, 12.2, 7.7, 12.2); txt(6.2, 12.42, "no", 8, c=GREY, it=True)
diamond(8.7, 12.2, 2.0, 1.0); txt(8.7, 12.2, "i < CLTG ?", 8.5)
rect(11.3, 12.2, 1.6, 0.55); txt(11.3, 12.2, "i = i + 1", 8.5)
arrow(9.7, 12.2, 10.5, 12.2); txt(10.1, 12.42, "sí", 8, c=GREEN, it=True)
line(11.3, 12.47, 11.3, 13.75); line(11.3, 13.75, X, 13.75); arrow(X, 13.75, X, 12.78, c=GREY)
# NO hay grande -> RECHAZO (no escala)
arrow(8.7, 11.7, 8.7, 11.1); txt(9.05, 11.4, "no", 8, c=GREY, it=True)
rect(8.7, 10.65, 3.3, 0.85, fc='#FBECEC', ec=RED)
txt(8.7, 10.65, "PSL += 1  (rechazo)\nop=1 → entrega fallida\nop=2 → cliente insatisf. + retiro manual", 7.2, c=RED)
line(8.7, 10.22, 8.7, 1.7); line(8.7, 1.7, X+0.3, 1.5)

# rama SÍ -> ocupar
arrow(X, 11.62, X, 11.15); txt(X+0.35, 11.4, "sí", 8, c=GREEN, it=True)
rect(X, 10.85, 2.7, 0.55, fc='#EAF0FB'); txt(X, 10.85, "DispPaqG(i) = op", 8.5)
arrow(X, 10.57, X, 10.05)

# ocioso 1: tam == 1 ? -> CantCEnG
diamond(X, 9.5, 2.2, 1.0); txt(X, 9.5, "tam == 1 ?", 8.5)
rect(7.1, 9.5, 2.6, 0.6, fc='#FDECDD', ec=AMBER); txt(7.1, 9.5, "CantCEnG += 1\n(chico en grande)", 7.6)
arrow(X+1.1, 9.5, 5.8, 9.5); txt(4.75, 9.72, "sí", 8, c=GREEN, it=True)
line(7.1, 9.2, 7.1, 8.35)          # baja para reunir con el flujo
arrow(X, 9.0, X, 8.6); txt(X+0.32, 8.8, "no", 7.5, c=GREY, it=True)

# ocioso 2: tam == 2 ? -> CantMEnG
diamond(X, 8.1, 2.2, 1.0); txt(X, 8.1, "tam == 2 ?", 8.5)
rect(7.1, 8.1, 2.6, 0.6, fc='#FDECDD', ec=AMBER); txt(7.1, 8.1, "CantMEnG += 1\n(mediano en grande)", 7.4)
arrow(X+1.1, 8.1, 5.8, 8.1); txt(4.75, 8.32, "sí", 8, c=GREEN, it=True)
txt(10.1, 8.1, "tam = 3 (grande):\nno tiene costo de ocioso", 7.3, c=GREY, b=False, it=True)
line(7.1, 8.35, 7.1, 7.15); line(7.1, 7.15, X, 7.15)   # CantMEnG baja al eje
arrow(X, 7.6, X, 7.15); txt(X+0.32, 7.4, "no", 7.5, c=GREY, it=True)
arrow(X, 7.15, X, 6.7, c=GREY)

# op == 1 ?
diamond(X, 6.15, 2.4, 1.1, fc='#FBECEC'); txt(X, 6.15, "op == 1 ?", 8.5)
arrow(X+1.2, 6.15, 8.55, 6.15); txt(6.7, 6.37, "no  (devolución)", 8, c=RED, it=True)
line(8.55, 6.15, 8.55, 1.55); line(8.55, 1.55, X+0.3, 1.48)
txt(9.7, 4.5, "op = 2: no se\ncalcula TOL ni retiro;\nlo levanta el camión", 7.3, c=RED, b=False)
arrow(X, 5.6, X, 5.1); txt(X+0.35, 5.35, "sí", 8, c=GREEN, it=True)
rect(X, 4.8, 2.7, 0.55, fc='#EAF0FB'); txt(X, 4.8, "TOLG(i) = T", 8.5)
txt(X-2.5, 4.8, "(vencimiento)", 7.3, c=GREY, b=False)
arrow(X, 4.52, X, 4.05)
hexa(X, 3.75, 2.9, 0.6); txt(X, 3.75, "TPR = muestra de retiro", 7.8)
arrow(X, 3.45, X, 3.0)
rect(X, 2.7, 3.0, 0.55, fc='#EAF0FB'); txt(X, 2.7, "TPRPGL(i) = T + TPR", 8.2)
arrow(X, 2.42, X, 1.8)
circ(X, 1.5, 0.30, "fin", fs=8)

# título + nota
txt(6.6, 15.0, "Subrutina BuscarLockerGrandeLibre — corregida", 11)
ax.add_patch(Rectangle((0.3, 0.2), 5.3, 2.15, fc='#FBECEC', ec=RED, lw=1.3, zorder=3))
txt(0.65, 2.17, "Cambios vs. tu versión:", 9, c=RED)
ax.text(0.5, 1.82,
        "① DispPaqG(i)=op (estaba DispPaqC), i<CLTG\n"
        "    (estaba CLTM) y TOLG(i)=T (estaba =G).\n"
        "② NO escala: si no hay grande → PSL += 1\n"
        "    (rechazo). op=1 = entrega fallida; op=2 =\n"
        "    cliente insatisfecho + retiro manual.\n"
        "③ TOL y retiro van solo en op==1.\n"
        "✓ Bien: los 2 ocioso (CantCEnG, CantMEnG).",
        ha='left', va='top', fontsize=7.4, color=NAVY, zorder=6)

plt.tight_layout()
plt.savefig(os.path.join(D, 'diagrama_buscargrande_corregido.png'), dpi=150,
            facecolor='white', bbox_inches='tight')
print("OK -> diagrama_buscargrande_corregido.png")
