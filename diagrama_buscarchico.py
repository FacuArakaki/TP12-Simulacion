# -*- coding: utf-8 -*-
"""Subrutina BuscarLockerChicoLibre — corregida según el código."""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle, Circle, FancyArrowPatch

D = os.path.dirname(os.path.abspath(__file__))
NAVY, AMBER, GREEN, GREY, RED = '#1E2761', '#E8833A', '#2F8F5B', '#5A6478', '#C0392B'
LW = 1.5

fig, ax = plt.subplots(figsize=(12.5, 13.2))
ax.set_xlim(0, 12.5); ax.set_ylim(0, 13.2); ax.axis('off')


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


X = 4.2   # spine
# entrada
hexa(X, 12.6, 3.5, 0.65); txt(X, 12.6, "BuscarLockerChicoLibre(tam, op)", 8.5)
arrow(X, 12.27, X, 11.85)
rect(X, 11.55, 1.7, 0.55); txt(X, 11.55, "i = 1", 9)
arrow(X, 11.27, X, 10.75)

# ¿locker i libre?
diamond(X, 10.2, 2.9, 1.15); txt(X, 10.2, "DispPaqC(i)\n== HV ?", 8.5)

# --- rama NO (derecha): i < CLTC ? ---
arrow(X+1.45, 10.2, 7.6, 10.2); txt(6.1, 10.42, "no", 8, c=GREY, it=True)
diamond(8.6, 10.2, 2.0, 1.0); txt(8.6, 10.2, "i < CLTC ?", 8.5)
rect(11.1, 10.2, 1.7, 0.55); txt(11.1, 10.2, "i = i + 1", 8.5)
arrow(9.6, 10.2, 10.25, 10.2); txt(9.95, 10.42, "sí", 8, c=GREEN, it=True)
line(11.1, 10.47, 11.1, 11.75); line(11.1, 11.75, X, 11.75)   # vuelve al chequeo (a i=1->diamante)
arrow(X, 11.75, X, 10.78, c=GREY)
# NO hay más chicos -> escalar a mediano
arrow(8.6, 9.7, 8.6, 9.1); txt(8.95, 9.4, "no", 8, c=GREY, it=True)
hexa(8.6, 8.7, 3.4, 0.75, fc='#FDECDD', ec=AMBER)
txt(8.6, 8.7, "BuscarLockerMediano\nLibre(tam, op)", 8)

# --- rama SÍ (abajo): ocupar ---
arrow(X, 9.62, X, 9.15); txt(X+0.35, 9.4, "sí", 8, c=GREEN, it=True)
rect(X, 8.85, 2.6, 0.55, fc='#EAF0FB'); txt(X, 8.85, "DispPaqC(i) = op", 8.5)
arrow(X, 8.57, X, 8.1)
rect(X, 7.8, 2.6, 0.55, fc='#EAF0FB'); txt(X, 7.8, "TOLC(i) = T", 8.5)
txt(X-2.35, 7.8, "(siempre:\npara el\nvencimiento)", 7, c=GREY, b=False)
arrow(X, 7.52, X, 7.0)

# ¿op == 1?  (retiro solo si pedido normal)
diamond(X, 6.45, 2.4, 1.1, fc='#FBECEC'); txt(X, 6.45, "op == 1 ?", 8.5)
# sí -> agendar retiro
arrow(X, 5.9, X, 5.4); txt(X+0.35, 5.65, "sí", 8, c=GREEN, it=True)
hexa(X, 5.1, 2.9, 0.6); txt(X, 5.1, "TPR = muestra de retiro", 7.8)
arrow(X, 4.8, X, 4.35)
rect(X, 4.05, 3.0, 0.55, fc='#EAF0FB'); txt(X, 4.05, "TPRPCL(i) = T + TPR", 8.2)
arrow(X, 3.77, X, 3.15)
# no (devolución) -> sin retiro, directo a fin
arrow(X+1.2, 6.45, 8.3, 6.45); txt(6.7, 6.67, "no  (devolución)", 8, c=RED, it=True)
line(8.3, 6.45, 8.3, 2.85); line(8.3, 2.85, X, 2.85)
txt(8.3, 5.3, "op = 2:\nno hay retiro\nde usuario;\nlo levanta\nel camión", 7.4, c=RED, b=False)

circ(X, 2.6, 0.30, "fin", fs=8)

# título + nota de cambios
txt(6.25, 13.0, "Subrutina BuscarLockerChicoLibre — corregida", 11)
ax.add_patch(Rectangle((0.3, 0.3), 5.0, 2.1, fc='#FBECEC', ec=RED, lw=1.3, zorder=3))
txt(0.65, 2.2, "Cambios vs. el original:", 9, c=RED)
ax.text(0.5, 1.85,
        "① TOLC(i) = T va SIEMPRE (marca el inicio de\n"
        "    ocupación, base del cálculo de vencimiento).\n"
        "② TPRPCL(i) = T + TPR va SOLO si op == 1.\n"
        "    Si es devolución (op = 2) no se agenda retiro:\n"
        "    ese paquete lo retira el camión.\n"
        "③ El costo por espacio ocioso NO se cuenta acá\n"
        "    (chico-en-chico no desperdicia): se cuenta en\n"
        "    BuscarLockerMediano/GrandeLibre.",
        ha='left', va='top', fontsize=7.5, color=NAVY, zorder=6)

plt.tight_layout()
plt.savefig(os.path.join(D, 'diagrama_buscarchico_corregido.png'), dpi=150,
            facecolor='white', bbox_inches='tight')
print("OK -> diagrama_buscarchico_corregido.png")
