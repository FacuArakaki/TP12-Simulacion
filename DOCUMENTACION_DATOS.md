# Documentación de datos — TP Simulación (Lockers última milla)

Generado a partir de los 4 archivos de operación real (`Semana random/navidad/1 cyber/2 cyber`)
que aportó el contacto de la empresa de reparto. **Distingue explícitamente qué es dato REAL
y qué es SUPUESTO**, porque es lo que se defiende en la exposición.

---

## 1. Mapa de archivos

| Archivo | Contenido | Origen | Test de bondad |
|---|---|---|---|
| `dataset_llegadas_normal.xlsx` | inter-arribo (min) escenario Normal | **REAL** (Semana random) | ver §3 |
| `dataset_llegadas_navidad.xlsx` | inter-arribo (min) escenario Navidad | **REAL** (Semana navidad) | ver §3 |
| `dataset_llegadas_cyber.xlsx` | inter-arribo (min) escenario Cyber | **REAL** (Semana 1+2 cyber) | ver §3 |
| `dataset_tamanos.xlsx` | P(chico/mediano/grande) por escenario | **REAL** | Chi-cuadrado sobre proporciones |
| `dataset_retiros.xlsx` | tiempo de retiro del locker (min) | **SUPUESTO** | no aplica → sensibilidad |
| `dataset_devoluciones.xlsx` | inter-arribo de devoluciones (min) | **SUPUESTO** | no aplica → sensibilidad |
| `control_histogramas.png` | histogramas de control de las 6 FDPs | — | — |
| `generar_datasets.py` | script reproducible (seed=42) | — | — |

> Regla de oro para el paper: **el test K-S / Chi-cuadrado solo tiene sentido sobre datos REALES.**
> Sobre un dataset sintético el test es circular (validás una distribución contra datos que
> fabricaste con esa misma distribución) y el jurado lo puede picar.

---

## 2. Criterios de extracción (los REALES)

Cómo se filtró la operación cruda para representar el modelo:

- **Llegada al locker = entrega domiciliaria fallida por ausencia.** Se filtró
  `Motivo == "Cliente Ausente"`, NO todas las "Rechazadas" (que incluyen "Fuera de servicio",
  "Despacho no preparado", etc., que no van a la red de lockers).
- **Un arribo = una visita fallida.** Se deduplica por `(Código de Orden, timestamp)`.
- **Inter-arribos intra-día:** se calculan gaps solo dentro del mismo día operativo (se descartan
  los saltos nocturnos). Representa el proceso de arribos en ventana operativa (≈6–23 h).
- **Escenarios:** Normal = semana de septiembre; Navidad = 22–26 dic; Cyber = pool de 2 semanas
  de octubre/noviembre (más muestra).

### Supuesto de alcance (VALIDAR CON EL GRUPO)
Los `Semana x` son de **toda la operación** (varias zonas: caba, oeste, sur, norte, la plata).
El modelo acordado con David es **un único punto de lockers = un barrio**. Dos opciones:
- **(a) Usar la tasa agregada** tal cual (barrio "grande"). Las variables de control CLTC/CLTM/CLTG
  absorben el volumen: si es mucho, la optimización dirá que hacen falta más lockers.
- **(b) Escalar a una zona.** Dividir la tasa por el nº de zonas (~5) o filtrar por una zona.

Está entregado con la opción (a). Si quieren (b), es un `/5` sobre la frecuencia o volver a correr
el script filtrando por zona.

---

## 3. Llegadas (REAL) — parámetros y cómo defenderlas

Estacionalidad **real y medible** en el inter-arribo medio:

| Escenario | n (gaps) | inter-arribo medio | forma gamma (a) | λ Poisson |
|---|---|---|---|---|
| Normal | 925 | **4.27 min** | 1.17 | 10.9 /h |
| Navidad | 553 | **5.20 min** | 1.01 | 8.7 /h |
| Cyber | 2835 | **3.62 min** | 1.21 | 12.2 /h |

**Interpretación (esto va al paper):**
- La forma gamma `a ≈ 1` ⇒ los inter-arribos son ~**exponenciales** ⇒ **proceso de arribos de
  Poisson**, que es exactamente lo teóricamente esperado para llegadas aleatorias.
- **Recomendación de código:** reemplazar las 3 gammas casi idénticas actuales por una
  **exponencial con media por escenario** (4.27 / 5.20 / 3.62 min). Es más simple, teóricamente
  correcto y refleja la estacionalidad.

**Sobre el test de bondad de ajuste (honestidad intelectual):**
- El K-S continuo y el Chi-cuadrado de Poisson **rechazan** (p≈0). Motivo real, no error:
  1. los timestamps son a resolución de **minuto** (muchos empates), y
  2. el proceso está **sobredisperso**: los fallos se **agrupan por ruta** (un repartidor falla
     varias entregas seguidas), por lo que la varianza supera la media (no es Poisson homogéneo puro).
- Salidas válidas para el paper, elegí una:
  - **Distribución empírica por transformada inversa** (la más rigurosa): se muestrea directo de la
    muestra observada. No requiere test paramétrico. Se justifica: *"no forzamos una FDP teórica,
    usamos la distribución empírica de inter-arribos observada en la operación real"*.
  - **Exponencial por escenario** con el caveat de sobredispersión declarado, mostrando el histograma
    empírico vs la exponencial ajustada (visualmente encaja bien; ver `control_histogramas.png`).

---

## 4. Tamaños (REAL) — dos mapeos, decisión pendiente

El campo de tamaño operativo se mapea a los 3 tiers del modelo. **Hay una decisión de modelado
que el grupo debe cerrar** porque cambia mucho la mezcla:

**Mapeo COMPLETO** (todo item entra a un tier):

| Escenario | chico | mediano | grande |
|---|---|---|---|
| Normal | 0.371 | 0.108 | **0.521** |
| Navidad | 0.414 | 0.123 | 0.463 |
| Cyber | 0.329 | 0.147 | 0.524 |

Problema: el "grande" está dominado por `BIG-SIZE` = **muebles** (mesa ratona, vajillero, aire
acondicionado). Un mueble **no entra en un locker**. Un 52% grande es indefendible para un locker de barrio.

**Mapeo LOCKEABLE** (excluye muebles/voluminosos `BIG-SIZE`, `ALTO-MAXIMO`):

| Escenario | chico | mediano | grande |
|---|---|---|---|
| Normal | 0.775 | 0.225 | 0.000 |
| Navidad | 0.661 | 0.196 | 0.144 |
| Cyber | 0.558 | 0.248 | 0.194 |

Problema opuesto: en Normal quedan 0 grandes, y las variables CLTG no tendrían uso.

**Recomendación:** la realidad está en el medio y depende de qué tamaño físico definan para el
locker "grande". Elijan uno de los dos mapeos (o un intermedio, ej. `grande = OVER-SIZE + parte de
BIG-SIZE`) y **declárenlo como supuesto**. Ambos están en `dataset_tamanos.xlsx` (hojas *Completo*,
*Lockeable*, *Crudo*).

**Recomendación de código:** reemplazar el `R < 0.476 / < 0.765` fijo por **probabilidades por
escenario** de la tabla elegida. Hoy usás una sola mezcla para los 3 escenarios; la mezcla también
es estacional.

---

## 5. Retiros y Devoluciones (SUPUESTO) — cómo se defienden sin test

No existen en una operación **sin** lockers, por eso no hay dato posible. Se declaran como supuestos
parametrizados y se defienden con **análisis de sensibilidad**, no con bondad de ajuste.

### `dataset_retiros.xlsx` — tiempo de retiro
- **Distribución:** Lognormal (cola derecha), mediana **600 min (10 h)**, σ=0.70.
- **Comportamiento:** media 766 min, p90 ≈ 1 día, p99 ≈ 2 días; ~0.24% supera el TMP (3 días) y se
  vence de forma natural (el resto de vencidos surge por saturación).
- **Justificación:** el retiro en lockers es fuertemente asimétrico — la mayoría retira el mismo día
  o al día siguiente, con una cola de rezagados. Una **lognormal** modela esto mejor que la normal
  simétrica que tenías (una normal implicaría que nadie retira antes de X, lo cual es irreal).
- **Defensa:** sensibilidad sobre la mediana de retiro y sobre el TMP → medir impacto en % vencidos
  y saturación.

### `dataset_devoluciones.xlsx` — inter-arribo de devoluciones
- **Distribución:** Gamma (forma=3), media **360 min (6 h)** entre devoluciones en el barrio.
- **Ancla de la TASA:** NRF 2023 — la tasa de devolución del e-commerce ronda el ~16.5% de las
  ventas. Esto fija cuán frecuentes son las devoluciones **relativo** a las llegadas; la forma
  temporal es supuesta.
- **Defensa:** sensibilidad sobre la tasa/frecuencia de devolución → impacto en competencia por
  capacidad y clientes insatisfechos.

---

## 6. Checklist para enchufar al modelo

1. **Llegadas:** cambiar las 3 gammas por exponencial (o empírica) con media 4.27 / 5.20 / 3.62 min.
2. **Tamaños:** cerrar el mapeo (Completo vs Lockeable) y cargar P por escenario.
3. **Retiros:** `generar_TPR()` → lognormal(median=600, σ=0.70). Sacar la lognormal de "cola pesada"
   (era el dataset equivocado).
4. **Devoluciones:** mantener gamma media 360 min, citar NRF para la tasa.
5. **Coherencia:** revisar que la llegada al locker use UNA sola fuente de aleatoriedad para la
   ausencia (o la tasa del estudio, o el filtro de datos — no ambas, evitar doble-conteo).
6. **Paper:** K-S/Chi² solo en llegadas y tamaños (reales); retiros/devoluciones → sensibilidad.
