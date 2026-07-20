# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Event-scheduling discrete-event simulation (TP Simulación — UTN FRBA) of a last-mile
logistics network of parcel lockers. The engine is hand-written "cátedra style"
(manual event-scheduling / TEF, HV = infinity as the "no event / free locker"
sentinel) — it deliberately does **not** use a DES library like SimPy. All
probability distributions come from empirical datasets sampled via
inverse-transform, not from fitted analytic FDPs.

Code comments and identifiers are in Spanish; keep that convention when editing.

## Commands

```bash
# Single test run with the default config, printing the 3 scenarios + 95% CI
python3 simulacion_lockers.py

# Full optimization sweep over the (CLTC, CLTM, CLTG) grid; writes xlsx + PNGs
python3 barrido.py
```

Dependencies (no requirements file): `openpyxl` (dataset I/O) and `matplotlib`
(sweep plots, uses the `Agg` backend). Both `.py` files and all `dataset_*.xlsx`
must sit in the same directory — paths are resolved relative to the script.

`barrido.py` writes `resultados_barrido.xlsx`, `barrido_curvas.png`,
`barrido_heatmap.png`.

## Architecture

Two modules; `barrido.py` imports `simulacion_lockers.py` as `S` and reuses its
engine, so any change to `simular()`'s signature or return dict ripples into the
sweep.

### `simulacion_lockers.py` — the engine
- **`simular(escenario, config, seed)`** = one replication. Runs a `while True`
  loop that at each step builds the `eventos` dict, picks the minimum-time event
  (`min(eventos, key=eventos.get)`), advances `T`, and stops when `T > TF`.
  Event types: `LLP` (failed-delivery arrival → normal parcel), `PC` (truck pass),
  `DPC/DPM/DPG` (return arrivals by size), `RC/RM/RG` (user pickup by size).
- **Locker state** is parallel lists per size tier (`DispC/M/G` occupancy where
  `HV`=free, `1`=normal parcel, `2`=return; `TOL*`=occupation start time;
  `TPR*`=scheduled user-pickup time). Pickups are found via `min(TPR*)` /
  `.index(...)`.
- **`colocar(size, op, T, t_ret)`** implements the flexible placement policy:
  small→[C,M,G], medium→[M,G], large→[G]. Placing a parcel in a larger tier
  increments the "idle space" (ocioso) counters. Returns `False` on saturation.
- **`replicar(...)`** runs N replications and returns `{metric: (mean, halfwidth)}`
  with a 95% CI (uses `t≈2.045` for n<30, else `1.96`).

### Key modeling decisions (don't silently "fix" these)
- Arrivals **are** the inter-arrival times of absence-failed deliveries straight
  from the dataset — there is deliberately **no** separate absence Random (avoids
  double-counting). See the module docstring's "CAMBIOS clave".
- `SCALE_BARRIO = 5.0` stretches the operation-wide arrival data down to one
  neighborhood (one locker point ≈ one zone of ~5). This is a scoping assumption.
- Expiry is detected only at truck passes via `(T - TOL) >= TMP`, kept consistent
  with the event calendar.

### Common Random Numbers (CRN) — critical for the sweep
`Sampler` holds **four separate RNG streams** (`rng_lleg/tam/ret/dev`), each seeded
from `(seed, k)`. This guarantees two configs with the same seed see the identical
sequence of arrivals/sizes/pickups/returns, so `barrido.py` comparisons differ only
because of the locker counts, not noise. When adding a new stochastic draw, give it
its **own** stream and consume it unconditionally where needed (see how `t_ret` is
sampled even when placement fails) so divergence doesn't desync the streams.

### Datasets
- `_load_col(fname)` reads column A of the `Datos` sheet.
- `dataset_tamanos.xlsx` has three sheets: `Completo`, `Lockeable` (the realistic
  default, loaded via `_load_tamanos`), `Crudo` — each mapping scenario →
  `(p_chico, p_mediano, p_grande)`.
- Size codes throughout: `1`=chico, `2`=mediano, `3`=grande.

### Cost model & control variables
Top of `simulacion_lockers.py`: the `C_*` cost constants are **all flagged
`[SUPUESTO]`** (group assumptions, not hard data) — expect to tune them. Control
variables optimized by the sweep are `CLTC/CLTM/CLTG` (locker counts per size);
`TMP`, `IPC`, `TF` are time parameters expressed in **minutes**.
