# -*- coding: utf-8 -*-
"""
============================================================================
 COMPARACIÓN DE CONFIGURACIONES — TP Simulación (lockers última milla)
============================================================================
 Para cada escenario (NORMAL, NAVIDAD, CYBER) compara 4 diseños de locker,
 derivados AUTOMÁTICAMENTE del barrido, que representan 4 puntos de la curva U:

   MALO             -> subdimensionado: la config con MAYOR saturación (EF%).
                       Barata de instalar pero paga penalizaciones altas.
   NORMAL           -> referencia sin optimizar (DEFAULT_CONFIG del motor).
   ÓPTIMO           -> mínimo COSTO por paquete entregado (CPE). El fondo de la U.
   ÓPTIMO EXCELENTE -> mejor NIVEL DE SERVICIO (saturación ≈ 0, desempate por
                       menor costo). Sobredimensionado: casi no falla, cuesta más.

 Reutiliza el motor de simulacion_lockers.py con NÚMEROS ALEATORIOS COMUNES
 (misma semilla para todas las configs) -> las diferencias son por el diseño,
 no por ruido. Genera: comparacion_configs.xlsx y comparacion_configs.png
============================================================================
"""
import os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from openpyxl import Workbook

import simulacion_lockers as S

# --- Misma grilla que el barrido (para que el óptimo coincida) ---
GRID_CLTC = [10, 20, 30, 40, 50, 60]
GRID_CLTM = [5, 10, 15, 20, 25]
GRID_CLTG = [5, 10, 15]
ESCENARIOS = ['NORMAL', 'NAVIDAD', 'CYBER']
# Overrides por env para corridas rápidas de prueba, ej:
#   BARRIDO_TF_DIAS=30 BARRIDO_NREP=6 python3 comparacion.py
_TF_DIAS = int(os.environ.get('BARRIDO_TF_DIAS', 0))
if _TF_DIAS:
    S.TF = 60 * 24 * _TF_DIAS
N_REP = int(os.environ.get('BARRIDO_NREP', 30))
SEED0 = 1000

# Orden y métricas que se muestran en la tabla
CATEGORIAS = ['Malo', 'Normal', 'Óptimo', 'Óptimo excelente']
METRICAS = ['CPE', 'CostoTotal', 'EF_pct', 'PPV', 'CI', 'EO']


def barrer(esc):
    """Corre TODA la grilla para un escenario. Devuelve {(c,m,g): resultado}.
    resultado = dict {metrica: (media, semiancho_IC95)} de S.replicar."""
    res = {}
    for cltc in GRID_CLTC:
        for cltm in GRID_CLTM:
            for cltg in GRID_CLTG:
                cfg = dict(CLTC=cltc, CLTM=cltm, CLTG=cltg)
                res[(cltc, cltm, cltg)] = S.replicar(esc, cfg, n_rep=N_REP, seed0=SEED0)
    return res


def elegir_configs(res):
    """Deriva las 4 configuraciones a partir del barrido de un escenario."""
    items = list(res.items())
    # ÓPTIMO: menor costo por paquete entregado
    optimo = min(items, key=lambda kv: kv[1]['CPE'][0])[0]
    # MALO: peor saturación (mayor % de entregas fallidas)
    malo = max(items, key=lambda kv: kv[1]['EF_pct'][0])[0]
    # ÓPTIMO EXCELENTE: mejor servicio -> min saturación, luego min CI, luego min costo
    excelente = min(items, key=lambda kv: (kv[1]['EF_pct'][0],
                                           kv[1]['CI'][0],
                                           kv[1]['CPE'][0]))[0]
    # NORMAL: config de referencia sin optimizar
    normal = (S.DEFAULT_CONFIG['CLTC'], S.DEFAULT_CONFIG['CLTM'], S.DEFAULT_CONFIG['CLTG'])
    return {'Malo': malo, 'Normal': normal, 'Óptimo': optimo, 'Óptimo excelente': excelente}


def metricas_de(esc, res, cfg):
    """Trae las métricas de una config; si no está en la grilla, la simula."""
    if cfg in res:
        return res[cfg]
    c = dict(CLTC=cfg[0], CLTM=cfg[1], CLTG=cfg[2])
    return S.replicar(esc, c, n_rep=N_REP, seed0=SEED0)


# ============================================================
# 1. CORRER Y ELEGIR LAS 4 CONFIGS POR ESCENARIO
# ============================================================
print(f"Comparación: barriendo {len(GRID_CLTC)*len(GRID_CLTM)*len(GRID_CLTG)} configs x "
      f"{len(ESCENARIOS)} escenarios x {N_REP} réplicas (CRN)...\n")

comparacion = {}   # esc -> {categoria: (config, resultado)}
for esc in ESCENARIOS:
    res = barrer(esc)
    elegidas = elegir_configs(res)
    comparacion[esc] = {cat: (cfg, metricas_de(esc, res, cfg))
                        for cat, cfg in elegidas.items()}

    # --- Tabla en consola ---
    print(f"===== {esc} " + "=" * (55 - len(esc)))
    print(f"{'Categoría':<18}{'Lockers (C/M/G)':>16}{'CPE $/paq':>12}"
          f"{'Costo Total':>14}{'EF %':>8}{'CI':>7}")
    print("-" * 75)
    for cat in CATEGORIAS:
        cfg, r = comparacion[esc][cat]
        print(f"{cat:<18}{f'{cfg[0]}/{cfg[1]}/{cfg[2]}':>16}"
              f"{r['CPE'][0]:>9.1f}±{r['CPE'][1]:<2.0f}"
              f"{r['CostoTotal'][0]:>14,.0f}"
              f"{r['EF_pct'][0]:>8.2f}{r['CI'][0]:>7.0f}")
    print()


# ============================================================
# 2. EXPORTAR A XLSX
# ============================================================
wb = Workbook()
ws = wb.active
ws.title = "Comparacion"
ws.append(["escenario", "categoria", "CLTC", "CLTM", "CLTG", "total_lockers",
           "CPE", "CPE_ic95", "CostoTotal", "EF_%", "PPV_%", "CI", "EO"])
for esc in ESCENARIOS:
    for cat in CATEGORIAS:
        cfg, r = comparacion[esc][cat]
        ws.append([esc, cat, cfg[0], cfg[1], cfg[2], sum(cfg),
                   round(r['CPE'][0], 1), round(r['CPE'][1], 1),
                   round(r['CostoTotal'][0], 0), round(r['EF_pct'][0], 2),
                   round(r['PPV'][0], 3), round(r['CI'][0], 0), round(r['EO'][0], 0)])
wb.save("comparacion_configs.xlsx")


# ============================================================
# 3. GRÁFICO — CPE por categoría, un panel por escenario
#    (barra = CPE con IC95; etiqueta encima = EF% de saturación)
# ============================================================
colores = {'Malo': '#E45756', 'Normal': '#B0B0B0',
           'Óptimo': '#4C78A8', 'Óptimo excelente': '#54A24B'}
fig, axs = plt.subplots(1, 3, figsize=(16, 5.5), sharey=False)
for ax, esc in zip(axs, ESCENARIOS):
    xs = range(len(CATEGORIAS))
    ys = [comparacion[esc][c][1]['CPE'][0] for c in CATEGORIAS]
    es = [comparacion[esc][c][1]['CPE'][1] for c in CATEGORIAS]
    cols = [colores[c] for c in CATEGORIAS]
    bars = ax.bar(xs, ys, yerr=es, capsize=4, color=cols)
    for x, c in zip(xs, CATEGORIAS):
        ef = comparacion[esc][c][1]['EF_pct'][0]
        ax.text(x, ys[x] + es[x], f"EF={ef:.1f}%", ha='center', va='bottom', fontsize=8)
    ax.set_xticks(list(xs))
    ax.set_xticklabels(['Malo', 'Normal', 'Óptimo', 'Óptimo\nexcelente'], fontsize=9)
    ax.set_title(esc)
    ax.set_ylabel("CPE ($/paquete entregado)")
    ax.grid(axis='y', alpha=0.3)
fig.suptitle("Comparación de configuraciones por escenario "
             "(barra = CPE ±IC95; etiqueta = % saturación)", fontsize=13)
plt.tight_layout()
plt.savefig("comparacion_configs.png", dpi=110)

print("OK -> comparacion_configs.xlsx, comparacion_configs.png")
