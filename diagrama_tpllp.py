# -*- coding: utf-8 -*-
"""Rutina TPLLP (llegada de pedido normal) — corregida según el código."""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle, Circle, FancyArrowPatch

D = os.path.dirname(os.path.abspath(__file__))
NAVY, AMBER, GREEN, GREY, RED = '#1E2761', '#E8833A', '#2F8F5B', '#5A6478', '#C0392B'
LW = 1.5

fig, ax = plt.subplots(figsize=(11.5, 13.5))
ax.set_xlim(0, 11.5); ax.set_ylim(0, 13.5); ax.axis('off')


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

def circle(cx, cy, r, s, fc='white', fs=9):
    ax.add_patch(Circle((cx, cy), r, fc=fc, ec=NAVY, lw=LW, zorder=5)); txt(cx, cy, s, fs)

def arrow(x1, y1, x2, y2, c=GREY):
    ax.add_patch(FancyArrowPatch((x1, y1), (x2, y2), arrowstyle='-|>', mutation_scale=13,
                 lw=1.3, color=c, shrinkA=1, shrinkB=1, zorder=3))

def line(x1, y1, x2, y2, c=GREY):
    ax.plot([x1, x2], [y1, y2], color=c, lw=1.3, zorder=2)


X = 3.3   # spine
# --- spine superior ---
hexa(X, 12.9, 2.0, 0.6); txt(X, 12.9, "TPLLP", 9.5)
arrow(X, 12.6, X, 12.2)
rect(X, 11.9, 2.2, 0.55); txt(X, 11.9, "T = TPLLP", 9)
arrow(X, 11.62, X, 11.2)
hexa(X, 10.9, 2.9, 0.6); txt(X, 10.9, "IA = muestra empírica\nde llegadas (escenario)", 7.6)
arrow(X, 10.6, X, 10.15)
rect(X, 9.85, 3.3, 0.6); txt(X, 9.85, "TPLLP = T + IA · SCALE_BARRIO", 8)
arrow(X, 9.55, X, 9.15)
hexa(X, 8.85, 2.6, 0.6); txt(X, 8.85, "R  (aleatorio de tamaño)", 8)
arrow(X, 8.55, X, 8.1)

# --- decisión tamaño 1 ---
diamond(X, 7.6, 2.4, 1.0); txt(X, 7.6, "R < Pchico ?", 8.5)
rect(7.0, 7.6, 2.0, 0.55, fc='#EAF0FB'); txt(7.0, 7.6, "tam = 1 (chico)", 8)
arrow(X+1.2, 7.6, 6.0, 7.6); txt(4.7, 7.82, "sí", 8, c=GREEN, it=True)
arrow(X, 7.1, X, 6.6); txt(X+0.32, 6.85, "no", 8, c=GREY, it=True)

# --- decisión tamaño 2 ---
diamond(X, 6.1, 2.6, 1.0); txt(X, 6.1, "R < Pchico+Pmediano ?", 7.6)
rect(7.0, 6.1, 2.1, 0.55, fc='#EAF0FB'); txt(7.0, 6.1, "tam = 2 (mediano)", 8)
arrow(X+1.3, 6.1, 5.95, 6.1); txt(4.7, 6.32, "sí", 8, c=GREEN, it=True)
rect(9.7, 5.15, 2.1, 0.55, fc='#EAF0FB'); txt(9.7, 5.15, "tam = 3 (grande)", 8)
arrow(X, 5.6, X, 5.15); line(X, 5.15, 8.65, 5.15); txt(X+0.32, 5.35, "no", 8, c=GREY, it=True)

# --- merge de tam -> t_ret ---
BUS = 4.55
line(7.0, 7.325, 7.0, BUS)      # tam1 baja
line(7.0, 5.825, 7.0, BUS)      # tam2 baja (misma vertical)
line(9.7, 4.875, 9.7, BUS); line(9.7, BUS, 7.0, BUS)   # tam3
line(7.0, BUS, X, BUS)
arrow(X, BUS, X, 4.2)

hexa(X, 3.9, 3.0, 0.6); txt(X, 3.9, "t_ret = muestra de retiro (TPR)", 7.6)
arrow(X, 3.6, X, 3.2)
diamond(X, 2.85, 1.9, 0.85); txt(X, 2.85, "según tam", 8.5)

# --- 3 buscadores ---
bx = [1.7, 5.1, 8.7]
lbl = ["BuscarLockerChico\nLibre(tam, op=1)", "BuscarLockerMediano\nLibre(tam, op=1)",
       "BuscarLockerGrande\nLibre(tam, op=1)"]
for x, l in zip(bx, lbl):
    hexa(x, 1.75, 3.0, 0.75, fc='#FDECDD', ec=AMBER); txt(x, 1.75, l, 7.4)
    arrow(X, 2.45, x, 2.15)
    line(x, 1.375, x, 0.95)
line(bx[0], 0.95, bx[2], 0.95); arrow((bx[0]+bx[2])/2, 0.95, (bx[0]+bx[2])/2, 0.55)
circle((bx[0]+bx[2])/2, 0.35, 0.28, "fin", fs=8)

# --- título y nota ---
txt(5.75, 13.3, "Rutina TPLLP (llegada de pedido normal) — corregida", 11)
ax.add_patch(Rectangle((6.0, 9.4), 5.2, 2.7, fc='#FBECEC', ec=RED, lw=1.3, zorder=3))
txt(6.35, 11.85, "Cambios vs. el original:", 9, c=RED)
ax.text(6.2, 11.4,
        "① Umbrales de tamaño ya NO son fijos (0,4 / 0,6):\n"
        "    son las probabilidades del escenario (Pchico,\n"
        "    Pmediano) de la distribución de tamaños real.\n\n"
        "② Se ELIMINA el 2.º Random (R<0,33 / R<0,68) que\n"
        "    elegía el locker. La colocación no es aleatoria:\n"
        "    es la política flexible (chico→[C,M,G], etc.),\n"
        "    que vive DENTRO de BuscarLocker.\n\n"
        "③ No hay Random de ausencia: la llegada ya es la\n"
        "    entrega fallida. op = 1 (pedido normal).",
        ha='left', va='top', fontsize=7.6, color=NAVY, zorder=6)

plt.tight_layout()
plt.savefig(os.path.join(D, 'diagrama_tpllp_corregido.png'), dpi=150,
            facecolor='white', bbox_inches='tight')
print("OK -> diagrama_tpllp_corregido.png")
