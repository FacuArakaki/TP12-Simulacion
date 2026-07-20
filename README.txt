TP SIMULACIÓN — Lockers última milla
=====================================

CÓMO CORRERLO EN VS CODE (Mac)
------------------------------
1. File > Open Folder... > elegí esta carpeta (Claude).
2. Instalá las librerías (una sola vez), en la terminal de VS Code:
      pip3 install openpyxl numpy scipy matplotlib
   (si pip3 no anda:  python3 -m pip install openpyxl numpy scipy matplotlib)
3. Corré:
      python3 barrido.py            -> optimiza y genera gráficos
      python3 simulacion_lockers.py -> corrida base (una config)

IMPORTANTE: los .py y los dataset_*.xlsx tienen que estar SIEMPRE en la misma carpeta.


ARCHIVOS
--------
CÓDIGO (lo que se corre):
  simulacion_lockers.py  -> motor evento a evento + costos + N réplicas/IC95
  barrido.py             -> barrido de optimización (grid) + gráficos
  generar_datasets.py    -> regenera los datasets desde los "Semana x" (no hace falta correrlo)

DATOS (los consume el motor):
  dataset_llegadas_normal/navidad/cyber.xlsx -> inter-arribos REALES por escenario
  dataset_tamanos.xlsx        -> distribución de tamaños REAL (hojas Completo/Lockeable/Crudo)
  dataset_retiros.xlsx        -> tiempo de retiro (SUPUESTO lognormal)
  dataset_devoluciones.xlsx   -> inter-arribo devoluciones (SUPUESTO gamma)

RESULTADOS (los genera el barrido):
  resultados_barrido.xlsx  barrido_curvas.png  barrido_heatmap.png

DOC:
  DOCUMENTACION_DATOS.md  -> qué es real vs supuesto, parámetros, cómo presentarlo
  control_histogramas.png -> histogramas de control de las FDPs


DÓNDE AJUSTAR (arriba de cada archivo)
--------------------------------------
simulacion_lockers.py:
  - Costos (9 supuestos): C_CAP_*, C_EF, C_MANUAL, C_VENCIDO, C_CAMION, C_OCIOSO_*
  - Control: DEFAULT_CONFIG, TMP, IPC, TF, SCALE_BARRIO (escala barrio; default 5)
  - Mapeo de tamaños: _load_tamanos('Lockeable' o 'Completo')
barrido.py:
  - GRID_CLTC / GRID_CLTM / GRID_CLTG, N_REP


DECISIONES PENDIENTES (a cerrar con el grupo)
---------------------------------------------
- Valores de costo reales (hoy son supuestos).
- Mapeo de tamaños: Completo vs Lockeable.
- Escala barrio (SCALE_BARRIO) vs filtrar por zona.
- Ajuste de llegadas: empírica vs exponencial por escenario.
