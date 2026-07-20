# Memoria técnica — TP Simulación
## Optimización de costos en logística de última milla mediante una red de lockers inteligentes

UTN FRBA · Simulación · Método **evento a evento** (event-scheduling de cátedra, HV = infinito).
Este documento explica **todo lo que se hizo hasta ahora**: datos, motor, costos, experimentación y resultados.

---

## 1. Problema y modelo

Una empresa de e-commerce pierde plata cuando una entrega domiciliaria falla por **ausencia del cliente**
(reprogramación, combustible, horas de chofer). La propuesta: derivar esos paquetes a una **red de lockers
inteligentes** de un barrio. Los lockers tienen capacidad finita y tres tamaños (chico/mediano/grande).

**Pregunta del TP:** ¿cuántos lockers de cada tamaño instalar para **minimizar el costo logístico total**?

Elementos del modelo:
- Un **único punto de lockers** = un barrio. Compartimentos chico/mediano/grande (variables de control).
- El paquete entra al locker **tras una entrega fallida por ausencia**. El usuario luego lo retira.
- **Logística inversa:** los usuarios dejan devoluciones en los mismos lockers → compiten por la capacidad.
  Si no hay lugar, el usuario se lleva el paquete → cliente insatisfecho + costo de retiro manual.
- **Política flexible:** un paquete chico puede ocupar un locker mediano o grande si no hay del suyo
  (genera costo por espacio ocioso). Es el trade-off central.
- **TMP (Tiempo Máximo de Permanencia):** si un paquete no se retira antes del TMP, se vence y lo levanta el camión.
- **Camión:** pasa cada IPC a retirar devoluciones y vencidos.
- **Estacionalidad:** tres escenarios — Normal, Navidad, Cyber — con distinta demanda.

---

## 2. Datos

Distinción clave (y lo que se defiende en la exposición): **qué es dato REAL y qué es SUPUESTO.**

### 2.1 Reales (extraídos de la operación)
Origen: 4 archivos `Semana x` de una empresa de reparto real (rutas NextDay, Buenos Aires),
aportados por un contacto del equipo.

- **Llegadas** (`dataset_llegadas_{normal,navidad,cyber}.xlsx`): inter-arribos de las entregas fallidas
  por **"Cliente Ausente"**, por escenario. Se filtró por ese motivo (no toda "Rechazada"), se dedupó por
  visita y se calcularon gaps intra-día. Estacionalidad real: inter-arribo medio **4.27 / 5.20 / 3.62 min**
  (Normal/Navidad/Cyber). Forma ≈ exponencial (proceso de Poisson).
- **Tamaños** (`dataset_tamanos.xlsx`): distribución real por escenario. Dos mapeos: *Completo* (incluye
  muebles) y **Lockeable** (default; excluye BIG-SIZE/muebles que no entran a un locker).

### 2.2 Supuestos (no existen en una operación sin lockers)
- **Retiros** (`dataset_retiros.xlsx`): tiempo de retiro del locker. Lognormal cola derecha, mediana ~10 h.
- **Devoluciones** (`dataset_devoluciones.xlsx`): inter-arribo de devoluciones. Gamma, tasa anclada a NRF (~16.5%).

Se generan con `generar_datasets.py` (semilla fija). Detalle completo en `DOCUMENTACION_DATOS.md`.

**Nota de rigor:** el test de bondad de ajuste solo aplica a los datos reales. Sobre un dataset sintético
sería circular. Las llegadas se usan por **distribución empírica (transformada inversa)**; los supuestos se
defienden con **análisis de sensibilidad**, no con K-S.

---

## 3. Motor de simulación (`simulacion_lockers.py`)

Event-scheduling clásico de cátedra, escrito a mano (sin SimPy).

- **Eventos (TEF):** `LLP` (llegada por fallo), `PC` (pase de camión), `DPC/DPM/DPG` (devoluciones por
  tamaño), `RC/RM/RG` (retiros del usuario por tamaño). En cada paso se elige el evento de menor tiempo.
- **Estado de lockers:** listas paralelas por tamaño. `HV`=libre, `1`=pedido normal, `2`=devolución;
  `TOL*`=tiempo de ocupación; `TPR*`=tiempo de próximo retiro.
- **`colocar()`** implementa la política flexible: chico→[C,M,G], mediano→[M,G], grande→[G]. Si el paquete
  va a un compartimento mayor, suma espacio ocioso.
- **Vencimiento:** se detecta en el pase del camión (`T - TOL >= TMP`), consistente con el calendario.

### Decisiones de modelado tomadas
- **Sin Random de ausencia:** las llegadas del dataset **ya son** los fallos por ausencia → agregar un
  Random sería doble-conteo. Se eliminó.
- **`SCALE_BARRIO`:** la data es de toda la operación (~5 zonas); el modelo es un barrio → se estira el
  inter-arribo. Es un supuesto de alcance (a calibrar filtrando una zona real).
- **Mapeo de tamaños = Lockeable:** un mueble no entra a un locker. Consecuencia realista: en Normal el
  tamaño grande casi no aparece (es estacional).

### Números aleatorios comunes (CRN) — clave para el barrido
El `Sampler` tiene **4 streams separados** (llegadas, tamaños, retiros, devoluciones). Dos configuraciones
con la misma semilla ven la **misma secuencia** de llegadas/tamaños/retiros/devoluciones → la diferencia de
resultado es por el diseño de lockers, no por ruido. Reduce la varianza al comparar.
(El retiro se pre-samplea en cada llegada para que el stream no se desincronice.)

---

## 4. Función de costos

`Costo Total = f(instalación, entregas fallidas, retiros manuales, vencidos, camión, espacio ocioso)`
y **CPE = Costo Total / paquetes entregados** (métrica comparable entre escenarios/configs).

Cada término es un contador de la sim multiplicado por su costo. Los costos están en **USD** y anclados a
benchmarks de industria donde se pudo (ver `COSTOS_REFERENCIA.md`):

| Costo | Valor | Tipo |
|---|---|---|
| Entrega fallida (redespacho) | $15 | FUENTE (Optivo/GoBolt) |
| Devolución rechazada (retiro manual) | $25 | FUENTE (Claimlane/Productiv) |
| Amortización locker C/M/G | $0.27 / 0.40 / 0.67 por día | **FUENTE** (TCO 10 años, ParcelHive) |
| Paquete vencido | $12 | DEFINIDO |
| Pase de camión | $8 | DEFINIDO |
| Espacio ocioso (CM/CG/MG) | $0.5 / 1.0 / 0.7 | DEFINIDO |

La **tensión** entre el costo fijo (sube con más lockers) y las penalizaciones (bajan con más lockers)
genera la **curva U del CPE**: existe un óptimo. Sin costo de instalación, la solución trivial sería
"infinitos lockers".

---

## 5. Experimentación

- **`simulacion_lockers.py`** (main): corre los 3 escenarios con la config por defecto, con
  **N réplicas + IC 95%**.
- **`barrido.py`:** recorre la grilla (CLTC, CLTM, CLTG) × escenario con **CRN** y busca la config que
  minimiza el CPE. Genera `resultados_barrido.xlsx`, `barrido_curvas.png` (la U) y `barrido_heatmap.png`.
- **`comparacion.py`:** deriva del barrido 4 diseños (Malo / Normal / Óptimo / Óptimo excelente) y los
  compara. Genera `comparacion_configs.xlsx` y `.png`.

### Verificación hecha (el código hace lo que dice)
- Reproducibilidad por semilla. · 0 lockers → EF 100%. · Muchos lockers → EF 0%.
- Sensibilidad sobre CLTC: el CPE muestra la U con mínimo interior.

---

## 6. Resultados actuales

Config óptima por escenario (minimiza CPE, con costos reales USD, mapeo Lockeable, SCALE_BARRIO=5):

| Escenario | Óptimo (C/M/G) | CPE (USD/paq) | EF |
|---|---|---|---|
| Normal | 50 / 15 / 10 | ~$0.6 | 0.0% |
| Navidad | 40 / 15 / 15 | ~$0.7 | 0.1% |
| Cyber | 40 / 25 / 15 | ~$0.7 | 0.9% |

**Conclusiones para la defensa:**
- La **estacionalidad es real y cambia el diseño óptimo:** Cyber exige más capacidad que Navidad.
- En Normal el tamaño grande óptimo baja a 5 (casi no hay grandes) → **dimensionar para el pico vs. para el
  promedio** es la decisión de fondo.
- Una config subdimensionada ("Malo") tiene CPE ~$27–32/paq contra ~$2.3 del óptimo: el valor de optimizar.


### 6.1 Análisis de sensibilidad de costos

Se varió cada parámetro de costo **±30%** (método OAT, uno por vez), midiendo el impacto sobre el
CPE y, sobre todo, si cambia el **diseño óptimo**. Como los costos no afectan la dinámica de la
simulación, se simuló una vez y se recalcularon los costos sobre los mismos contadores: la
comparación es **exacta**, sin ruido de semillas. (Ver `sensibilidad_tornado.png` y `sensibilidad.xlsx`.)

- **La amortización de lockers (`C_CAP`) es el costo dominante:** ±30% mueve el CPE **~34–44%**.
  Todos los demás quedan **por debajo del ~13%**. Motivo: en la configuración óptima la saturación es
  casi nula, así que prácticamente no se pagan penalizaciones y el costo es esencialmente
  **capacidad instalada**.
- **Los costos respaldados por fuente (`C_EF`, `C_MANUAL`) tienen impacto bajo (≤5%)**: su
  incertidumbre no amenaza las conclusiones.
- **Robustez del óptimo:** el diseño ganador se mantiene en la gran mayoría de las variaciones
  (Normal y Cyber **0/12** cambios; Navidad 2/12, con intercambios menores entre chicos y medianos).

**Conclusión:** la recomendación de diseño es **robusta** a la incertidumbre de costos. La sensibilidad
señaló a `C_CAP` como el parámetro dominante y por eso **se lo refinó con un dato real de TCO**
(ver §9), pasando de supuesto a fuente: el costo que más pesa es hoy el mejor respaldado.

---

## 7. Estado y qué falta

Ver `CHECKLIST_TP.md`. En síntesis, **lo técnico grande está** (datos, motor, costos, barrido, comparación).
Falta: análisis de sensibilidad (costos y supuestos), análisis del transitorio/warm-up, bondad de ajuste
formal, sincronizar el diagrama de flujo, y redactar paper + slides.

---

## 8. Inventario de archivos

**Código:** `simulacion_lockers.py` (motor+costos), `barrido.py` (optimización), `comparacion.py`
(4 configs), `generar_datasets.py` (regenera datasets).
**Datos:** `dataset_llegadas_*.xlsx` (real), `dataset_tamanos.xlsx` (real), `dataset_retiros.xlsx`,
`dataset_devoluciones.xlsx` (supuestos).
**Resultados:** `resultados_barrido.xlsx`, `comparacion_configs.xlsx`, `barrido_curvas.png`,
`barrido_heatmap.png`, `comparacion_configs.png`, `control_histogramas.png`.
**Documentación:** `MEMORIA_TECNICA.md` (este), `DOCUMENTACION_DATOS.md`, `COSTOS_REFERENCIA.md`,
`CHECKLIST_TP.md`, `CLAUDE.md`, `README.txt`.

---

## 9. Referencias (fuentes de costos)

Los costos en USD del modelo se anclaron a benchmarks de industria. Detalle en `COSTOS_REFERENCIA.md`.

### Con fuente
- **`C_EF` = $15** (entrega fallida / redespacho). Base: ~$17.78 costo directo total, $8 redespacho directo, $25–40 impacto total.
  - Optivo — Failed first delivery: true cost — https://www.optivologistics.com/en/blog/failed-delivery-first-attempt-cost/
  - GoBolt — Last Mile Delivery Cost — https://www.gobolt.com/blog/last-mile-delivery-cost/
- **`C_MANUAL` = $25** (devolución rechazada / retiro manual). Base: $15–30 por devolución (directo).
  - Claimlane — True cost of returns — https://www.claimlane.com/resources/blog/returns-for-ecommerce-brands
  - Productiv — Cost of reverse logistics — https://getproductiv.com/blog/getting-your-arms-around-the-cost-of-reverse-logistics-in-e-commerce
- **`C_CAP` = $0.27 / 0.40 / 0.67 por día** (amortización locker). Derivado de un **TCO real a 10 años**:
  sistema outdoor de 30 compartimentos = €18.000 equipo + €2.000 sitio + €20.000 operación = **€40.000**
  → €40.000 / 10 años / 30 comp = **€0.365 por compartimento-día ≈ USD 0.395**, repartido por tamaño con
  el mix 43/43/16 y ratio 1 : 1.5 : 2.5. Vida útil de referencia: 10–15 años.
  *Salvedad: el TCO no incluye el alquiler del espacio que hospeda el locker (supuesto no cubierto).*
  - ParcelHive — Outdoor Parcel Locker Systems: Costs, Specs & ROI (TCO 10 años, vida útil, energía) — https://www.parcelhive.com/blog/outdoor-parcel-locker-costs-specs-roi
  - Material Handling USA — Parcel Locker Guide (compartimentos por sistema) — https://mh-usa.com/blogs/parcel-locker-guide/
  - ParcelPort — Smart Locker Sizing (mix 43/43/16 y dimensiones) — https://theparcelport.com/smart-locker-sizing-for-residential-buildings/
  - Pitney Bowes — Smart parcel locker cost (rango de precio por unidad) — https://www.pitneybowes.com/us/blog/parcel-locker-price-how-much-will-it-cost-your-organization.html
  - ClickNCollect — How much do smart lockers cost — https://www.clickncollect.com/insights/smart-locker-cost

### Definidos por el equipo (sin fuente pública)
`C_VENCIDO` ($12), `C_CAMION` ($8) y ociosos ($0.5 / 1.0 / 0.7): definidos en orden de magnitud coherente. Se defienden con **análisis de sensibilidad ±30%**.

### Datos que validan el modelo (no son costos)
~8% de las entregas fallan en el primer intento; 36% de esos fallos son por cliente ausente → respaldan
el supuesto central (Optivo / GoBolt). Además, el mix típico de compartimentos de una red de lockers es
**43% chico / 43% mediano / 16% grande** (ParcelPort), que respalda de forma independiente la
distribución de tamaños usada en el modelo.

> Nota: son informes/blogs de industria (citables para el TP), no papers peer-reviewed. Para números locales, la mejor fuente es el contacto de la empresa de reparto.
