# -*- coding: utf-8 -*-
"""Subrutina BuscarLockerMedianoLibre — corregida (TOL solo en op==1)."""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle, Circle, FancyArrowPatch

D = os.path.dirname(os.path.abspath(__file__))
NAVY, AMBER, GREEN, GREY, RED = '#1E2761', '#E8833A', '#2F8F5B', '#5A6478', '#C0392B'
LW = 1.5

fig, ax = plt.subplots(figsize=(12.8, 14.2))
ax.set_xlim(0, 12.8); ax.set_ylim(0, 14.2); ax.axis('off')


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
hexa(X, 13.6, 3.7, 0.65); txt(X, 13.6, "BuscarLockerMedianoLibre(tam, op)", 8.2)
arrow(X, 13.27, X, 12.85)
rect(X, 12.55, 1.7, 0.55); txt(X, 12.55, "i = 1", 9)
arrow(X, 12.27, X, 11.75)

diamond(X, 11.2, 2.9, 1.15); txt(X, 11.2, "DispPaqM(i)\n== HV ?", 8.5)
# rama NO
arrow(X+1.45, 11.2, 7.7, 11.2); txt(6.2, 11.42, "no", 8, c=GREY, it=True)
diamond(8.7, 11.2, 2.0, 1.0); txt(8.7, 11.2, "i < CLTM ?", 8.5)
rect(11.2, 11.2, 1.6, 0.55); txt(11.2, 11.2, "i = i + 1", 8.5)
arrow(9.7, 11.2, 10.4, 11.2); txt(10.05, 11.42, "sí", 8, c=GREEN, it=True)
line(11.2, 11.47, 11.2, 12.75); line(11.2, 12.75, X, 12.75); arrow(X, 12.75, X, 11.78, c=GREY)
arrow(8.7, 10.7, 8.7, 10.1); txt(9.05, 10.4, "no", 8, c=GREY, it=True)
hexa(8.7, 9.7, 3.5, 0.75, fc='#FDECDD', ec=AMBER); txt(8.7, 9.7, "BuscarLockerGrande\nLibre(tam, op)", 8)

# rama SÍ -> ocupar
arrow(X, 10.62, X, 10.15); txt(X+0.35, 10.4, "sí", 8, c=GREEN, it=True)
rect(X, 9.85, 2.7, 0.55, fc='#EAF0FB'); txt(X, 9.85, "DispPaqM(i) = op", 8.5)
arrow(X, 9.57, X, 9.05)

# ocioso: tam == 1 ? (vale para op==1 y op==2)
diamond(X, 8.5, 2.2, 1.05); txt(X, 8.5, "tam == 1 ?", 8.5)
rect(7.2, 8.5, 2.6, 0.6, fc='#FDECDD', ec=AMBER); txt(7.2, 8.5, "CantCEnM += 1\n(chico en mediano)", 7.6)
arrow(X+1.1, 8.5, 5.9, 8.5); txt(4.75, 8.72, "sí", 8, c=GREEN, it=True)
txt(10.0, 8.5, "tam=3 no entra acá;\ntam=2 no tiene costo", 7.3, c=GREY, b=False, it=True)
line(7.2, 8.2, 7.2, 7.6); line(7.2, 7.6, X, 7.6)
line(X, 7.97, X, 7.6); txt(X+0.32, 7.85, "no", 7.5, c=GREY, it=True)
arrow(X, 7.6, X, 7.15, c=GREY)

# op == 1 ?
diamond(X, 6.6, 2.4, 1.1, fc='#FBECEC'); txt(X, 6.6, "op == 1 ?", 8.5)
# op==2 -> sin TOL ni retiro
arrow(X+1.2, 6.6, 8.4, 6.6); txt(6.55, 6.82, "no  (devolución)", 8, c=RED, it=True)
line(8.4, 6.6, 8.4, 1.9); line(8.4, 1.9, X, 1.9)
txt(8.4, 4.4, "op = 2:\nno se calcula TOL\nni retiro; lo levanta\nel camión en su pasada", 7.3, c=RED, b=False)
# op==1 -> TOL + retiro
arrow(X, 6.05, X, 5.55); txt(X+0.35, 5.8, "sí", 8, c=GREEN, it=True)
rect(X, 5.25, 2.7, 0.55, fc='#EAF0FB'); txt(X, 5.25, "TOLM(i) = T", 8.5)
txt(X-2.5, 5.25, "(para el\nvencimiento)", 7.3, c=GREY, b=False)
arrow(X, 4.97, X, 4.5)
hexa(X, 4.2, 2.9, 0.6); txt(X, 4.2, "TPR = muestra de retiro", 7.8)
arrow(X, 3.9, X, 3.45)
rect(X, 3.15, 3.0, 0.55, fc='#EAF0FB'); txt(X, 3.15, "TPRPML(i) = T + TPR", 8.2)
arrow(X, 2.87, X, 2.25)
circ(X, 1.65, 0.30, "fin", fs=8); line(8.4, 1.9, X+0.3, 1.65)

# título + nota
txt(6.4, 14.0, "Subrutina BuscarLockerMedianoLibre — corregida", 11)
ax.add_patch(Rectangle((0.3, 0.25), 5.2, 2.5, fc='#FBECEC', ec=RED, lw=1.3, zorder=3))
txt(0.65, 2.57, "Cambios vs. tu versión:", 9, c=RED)
ax.text(0.5, 2.2,
        "① Bug: en op=2 estaba DispPaqC(i)=2 → sobra;\n"
        "    el estado ya se fijó con DispPaqM(i) = op.\n"
        "② TOL y TPR van SOLO en op==1: el TOL sirve\n"
        "    para el vencimiento, que solo aplica a paquetes\n"
        "    normales (Disp==1). La devolución (op=2) la\n"
        "    levanta el camión sin mirar el tiempo → no usa TOL.\n"
        "✓ El ocioso CantCEnM (tam==1) va antes del op,\n"
        "    porque una devolución chica en mediano también\n"
        "    desperdicia espacio.",
        ha='left', va='top', fontsize=7.4, color=NAVY, zorder=6)

plt.tight_layout()
plt.savefig(os.path.join(D, 'diagrama_buscarmediano_corregido.png'), dpi=150,
            facecolor='white', bbox_inches='tight')
print("OK -> diagrama_buscarmediano_corregido.png")
