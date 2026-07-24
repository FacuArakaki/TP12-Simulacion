# -*- coding: utf-8 -*-
"""Evento TPRPCL/ML/GL (retiro por el usuario) — corregido según el código."""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import Polygon, Rectangle, Circle, FancyArrowPatch

D = os.path.dirname(os.path.abspath(__file__))
NAVY, AMBER, GREEN, GREY, RED = '#1E2761', '#E8833A', '#2F8F5B', '#5A6478', '#C0392B'
LW = 1.5

fig, ax = plt.subplots(figsize=(11.5, 10.2))
ax.set_xlim(0, 11.5); ax.set_ylim(0, 10.2); ax.axis('off')


def txt(x, y, s, fs=8.5, c=NAVY, b=True, it=False):
    ax.text(x, y, s, ha='center', va='center', fontsize=fs, color=c,
            fontweight='bold' if b else 'normal', style='italic' if it else 'normal',
            linespacing=1.25, zorder=6)

def rect(cx, cy, w, h, fc='white', ec=NAVY):
    ax.add_patch(Rectangle((cx-w/2, cy-h/2), w, h, fc=fc, ec=ec, lw=LW, zorder=4))

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


X = 3.7
hexa(X, 9.4, 2.6, 0.62); txt(X, 9.4, "TPRPCL(i)", 9.5)
arrow(X, 9.09, X, 8.65)
rect(X, 8.35, 2.6, 0.55); txt(X, 8.35, "T = TPRPCL(i)", 8.8)
arrow(X, 8.07, X, 7.6)
rect(X, 7.3, 2.9, 0.55, fc='#EAF0FB'); txt(X, 7.3, "DispPaqC(i) = HV", 8.6)
txt(X-2.55, 7.3, "(libera\nel locker)", 7.3, c=GREY, b=False)
arrow(X, 7.02, X, 6.55)
rect(X, 6.25, 2.9, 0.55, fc='#FDECDD', ec=AMBER); txt(X, 6.25, "TPRPCL(i) = HV", 8.6)
txt(X + 3.15, 6.25, "← FALTABA: sin esto, el\n   evento se re-dispara", 7.6, c=RED, b=True)
arrow(X, 5.97, X, 5.5)
rect(X, 5.2, 2.9, 0.55, fc='white'); txt(X, 5.2, "TOLC(i) = HV", 8.6)
txt(X-2.55, 5.2, "(opcional:\ndeja limpio)", 7.3, c=GREY, b=False)
arrow(X, 4.92, X, 4.45)
rect(X, 4.15, 2.9, 0.55, fc='#E9F5EE', ec=GREEN); txt(X, 4.15, "entregados += 1", 8.6)
txt(X + 3.0, 4.15, "← FALTABA: es el\n   denominador del CPE", 7.6, c=RED, b=True)
arrow(X, 3.87, X, 3.4)
circ(X, 3.1, 0.30, "fin", fs=8)

# título + nota
txt(5.75, 10.0, "Evento de retiro por el usuario  (TPRPCL / TPRPML / TPRPGL)", 11)
ax.add_patch(Rectangle((6.9, 8.15), 4.35, 1.6, fc='#EEF3FB', ec=NAVY, lw=1.2, zorder=3))
txt(7.25, 9.55, "Nota:", 9, c=NAVY)
ax.text(7.1, 9.3,
        "· (i) = el locker cuyo TPR resultó\n"
        "   el MÍNIMO (el que disparó el evento).\n"
        "· Idéntico para medianos (TPRPML,\n"
        "   DispPaqM) y grandes (TPRPGL,\n"
        "   DispPaqG): solo cambia la letra.",
        ha='left', va='top', fontsize=7.6, color=NAVY, zorder=6)

ax.add_patch(Rectangle((0.3, 0.3), 5.0, 1.75, fc='#FBECEC', ec=RED, lw=1.3, zorder=3))
txt(0.7, 1.87, "Cambios vs. tu versión:", 9, c=RED)
ax.text(0.5, 1.55,
        "① Reseteabas TOLC(i)=HV, pero el que hay\n"
        "   que resetear es TPRPCL(i)=HV (el retiro).\n"
        "② Faltaba contar el paquete: entregados += 1.\n"
        "✓ Bien: T=TPRPCL(i) y DispPaqC(i)=HV.",
        ha='left', va='top', fontsize=7.5, color=NAVY, zorder=6)

plt.tight_layout()
plt.savefig(os.path.join(D, 'diagrama_retiro_corregido.png'), dpi=150,
            facecolor='white', bbox_inches='tight')
print("OK -> diagrama_retiro_corregido.png")
