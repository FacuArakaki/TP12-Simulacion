# -*- coding: utf-8 -*-
"""
============================================================================
 BARRIDO DE OPTIMIZACIÓN — TP Simulación (lockers última milla)
============================================================================
 Recorre la grilla de configuraciones (CLTC, CLTM, CLTG) para cada escenario,
 con N réplicas y NÚMEROS ALEATORIOS COMUNES (misma semilla en todas las
 configs), y busca la que minimiza el CPE ($/paquete entregado).

 Requiere en la misma carpeta: simulacion_lockers.py + los dataset_*.xlsx
 Genera: resultados_barrido.xlsx, barrido_curvas.png, barrido_heatmap.png
============================================================================
"""
import math
import statistics
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from openpyxl import Workbook

import simulacion_lockers as S

# --- Grilla del barrido (gruesa; refinar alrededor del óptimo después) ---
GRID_CLTC = [10, 20, 30, 40, 50, 60]
GRID_CLTM = [5, 10, 15, 20, 25]
GRID_CLTG = [5, 10, 15]
ESCENARIOS = ['NORMAL', 'NAVIDAD', 'CYBER']
# Overrides por env para corridas rápidas de prueba, ej:
#   BARRIDO_TF_DIAS=30 BARRIDO_NREP=6 python3 barrido.py
_TF_DIAS = int(os.environ.get('BARRIDO_TF_DIAS', 0))
if _TF_DIAS:
    S.TF = 60 * 24 * _TF_DIAS
N_REP = int(os.environ.get('BARRIDO_NREP', 30))
SEED0 = 1000


def evaluar(esc, cltc, cltm, cltg):
    """N réplicas con CRN -> media e IC95 de cada métrica."""
    cfg = dict(CLTC=cltc, CLTM=cltm, CLTG=cltg)
    corridas = [S.simular(esc, cfg, SEED0 + k) for k in range(N_REP)]  # CRN: mismas semillas
    res = {}
    for key in ('CPE', 'CostoTotal', 'EF_pct', 'PPV', 'CI', 'EO'):
        vals = [c[key] for c in corridas]
        m = statistics.mean(vals)
        sd = statistics.stdev(vals) if len(vals) > 1 else 0.0
        hw = 1.96 * sd / math.sqrt(N_REP)   # n>=30 -> z(0.975)=1.96
        res[key] = (m, hw)
    return res


# ============================================================
# 1. CORRER EL BARRIDO COMPLETO
# ============================================================
print(f"Barrido: {len(GRID_CLTC)*len(GRID_CLTM)*len(GRID_CLTG)} configs x "
      f"{len(ESCENARIOS)} escenarios x {N_REP} réplicas (CRN)...")

resultados = {}   # (esc, cltc, cltm, cltg) -> res
mejor = {}        # esc -> (cpe, config, res)
for esc in ESCENARIOS:
    best = None
    for cltc in GRID_CLTC:
        for cltm in GRID_CLTM:
            for cltg in GRID_CLTG:
                r = evaluar(esc, cltc, cltm, cltg)
                resultados[(esc, cltc, cltm, cltg)] = r
                cpe = r['CPE'][0]
                if best is None or cpe < best[0]:
                    best = (cpe, (cltc, cltm, cltg), r)
    mejor[esc] = best
    c = best[1]
    print(f"  {esc:8s} ÓPTIMO -> CLTC={c[0]} CLTM={c[1]} CLTG={c[2]} "
          f"| CPE={best[0]:.1f}±{best[2]['CPE'][1]:.1f} $/paq "
          f"| EF={best[2]['EF_pct'][0]:.1f}% | CostoTotal=${best[2]['CostoTotal'][0]:,.0f}")


# ============================================================
# 2. EXPORTAR RESULTADOS A XLSX
# ============================================================
wb = Workbook()
ws = wb.active
ws.title = "Barrido"
ws.append(["escenario", "CLTC", "CLTM", "CLTG", "total_lockers",
           "CPE", "CPE_ic95", "CostoTotal", "EF_%", "PPV_%", "CI", "EO", "optimo"])
for (esc, cltc, cltm, cltg), r in resultados.items():
    es_opt = "SI" if mejor[esc][1] == (cltc, cltm, cltg) else ""
    ws.append([esc, cltc, cltm, cltg, cltc + cltm + cltg,
               round(r['CPE'][0], 1), round(r['CPE'][1], 1),
               round(r['CostoTotal'][0], 0), round(r['EF_pct'][0], 2),
               round(r['PPV'][0], 3), round(r['CI'][0], 0), round(r['EO'][0], 0), es_opt])
wb.save("resultados_barrido.xlsx")


# ============================================================
# 3. GRÁFICO 1 — Curva U del CPE por escenario
#    (variando CLTC, con CLTM/CLTG fijos en su valor óptimo)
# ============================================================
fig, axs = plt.subplots(1, 3, figsize=(16, 5), sharey=False)
colores = {'NORMAL': '#4C78A8', 'NAVIDAD': '#54A24B', 'CYBER': '#E45756'}
for ax, esc in zip(axs, ESCENARIOS):
    _, (bc, bm, bg), _ = mejor[esc]
    xs, ys, es = [], [], []
    for cltc in GRID_CLTC:
        r = resultados[(esc, cltc, bm, bg)]
        xs.append(cltc); ys.append(r['CPE'][0]); es.append(r['CPE'][1])
    ax.errorbar(xs, ys, yerr=es, marker='o', capsize=4, color=colores[esc], lw=2)
    ax.axvline(bc, color='gray', ls='--', alpha=0.7)
    ax.set_title(f"{esc}  (óptimo CLTC={bc}, CLTM={bm}, CLTG={bg})")
    ax.set_xlabel("CLTC (lockers chicos)")
    ax.set_ylabel("CPE ($/paquete entregado)")
    ax.grid(alpha=0.3)
fig.suptitle("Curva de costo CPE vs cantidad de lockers chicos (IC 95%)", fontsize=13)
plt.tight_layout()
plt.savefig("barrido_curvas.png", dpi=110)

# ============================================================
# 4. GRÁFICO 2 — 3 Heatmaps CPE para CYBER: cada par de tamaños,
#    con el tercer tamaño fijo en su óptimo.
# ============================================================
esc = 'CYBER'
_, (bc, bm, bg), _ = mejor[esc]
GRIDS = {'CLTC': GRID_CLTC, 'CLTM': GRID_CLTM, 'CLTG': GRID_CLTG}
LABEL = {'CLTC': 'chicos', 'CLTM': 'medianos', 'CLTG': 'grandes'}
OPT = {'CLTC': bc, 'CLTM': bm, 'CLTG': bg}

def draw_heatmap(ax, xk, yk):
    fk = ({'CLTC', 'CLTM', 'CLTG'} - {xk, yk}).pop()   # tamaño fijo (en su óptimo)
    xv, yv = GRIDS[xk], GRIDS[yk]
    mat = []
    for y in yv:
        fila = []
        for x in xv:
            cfg = {xk: x, yk: y, fk: OPT[fk]}
            fila.append(resultados[(esc, cfg['CLTC'], cfg['CLTM'], cfg['CLTG'])]['CPE'][0])
        mat.append(fila)
    im = ax.imshow(mat, cmap='YlOrRd', aspect='auto', origin='lower')
    ax.set_xticks(range(len(xv))); ax.set_xticklabels(xv)
    ax.set_yticks(range(len(yv))); ax.set_yticklabels(yv)
    ax.set_xlabel(f"{xk} ({LABEL[xk]})"); ax.set_ylabel(f"{yk} ({LABEL[yk]})")
    ax.set_title(f"{xk} x {yk}   ({fk}={OPT[fk]} óptimo)")
    for i in range(len(yv)):
        for j in range(len(xv)):
            ax.text(j, i, f"{mat[i][j]:.0f}", ha='center', va='center', fontsize=8)
    return im

pares = [('CLTC', 'CLTM'), ('CLTC', 'CLTG'), ('CLTM', 'CLTG')]
fig2, axs2 = plt.subplots(1, 3, figsize=(19, 5.5))
for ax, (xk, yk) in zip(axs2, pares):
    im = draw_heatmap(ax, xk, yk)
    fig2.colorbar(im, ax=ax, fraction=0.046, pad=0.04, label="CPE ($/paq)")
fig2.suptitle(f"CPE ($/paq) — {esc}: heatmaps por par de tamaños (el tercero, fijo en su óptimo)", fontsize=13)
plt.tight_layout()
plt.savefig("barrido_heatmap.png", dpi=110)

print("\nOK -> resultados_barrido.xlsx, barrido_curvas.png, barrido_heatmap.png")
