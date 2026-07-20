# Referencia de costos — TP Simulación (lockers última milla)

Todos los costos del modelo están en **USD** y anclados, donde se pudo, a benchmarks
de industria citables. Los que no tienen fuente confiable se marcan `[DEFINIDO]` y se
cubren con **análisis de sensibilidad (±30%)**. Los valores viven en el bloque 0 de
`simulacion_lockers.py`.

## Tabla de costos

| Parámetro | Valor | Unidad | Tipo | Origen / racional |
|---|---|---|---|---|
| `C_EF` | 15 | USD / entrega fallida | **FUENTE** | Redespacho de una entrega fallida. Optivo/GoBolt: $8 directo, ~$17.78 costo directo total, $25–40 impacto total. Tomamos un valor intermedio conservador. |
| `C_MANUAL` | 25 | USD / devolución rechazada | **FUENTE** | Retiro manual a domicilio de una devolución que no entró al locker. Procesar una devolución cuesta $15–30 (Claimlane/Productiv); un viaje dedicado va en la banda alta. |
| `C_CAP_C` | 0.27 | USD / día · locker chico | **FUENTE** | Derivado de un TCO real a 10 años (ver abajo). |
| `C_CAP_M` | 0.40 | USD / día · locker mediano | **FUENTE** | Ídem, mayor por tamaño (ratio 1 : 1.5 : 2.5). |
| `C_CAP_G` | 0.67 | USD / día · locker grande | **FUENTE** | Ídem. |
| `C_VENCIDO` | 12 | USD / paquete vencido | DEFINIDO | Manipuleo + reingreso del paquete que el camión levanta por superar el TMP. Del orden del extremo bajo de procesar una devolución. |
| `C_CAMION` | 8 | USD / pase de camión | DEFINIDO | Combustible + chofer del tramo de ruta que pasa por el locker. Orden de magnitud del costo por parada en last-mile. |
| `C_OCIOSO_CM` | 0.5 | USD / evento | DEFINIDO | Costo de oportunidad de bloquear un locker mediano con un paquete chico (política flexible). |
| `C_OCIOSO_CG` | 1.0 | USD / evento | DEFINIDO | Chico en grande (más desperdicio). |
| `C_OCIOSO_MG` | 0.7 | USD / evento | DEFINIDO | Mediano en grande. |

## Amortización del locker (cómo se llega a C_CAP_*)  — DATO REAL

Se reemplazó el supuesto original por un **TCO (costo total de propiedad) publicado**:

> Sistema outdoor mediano de **30 compartimentos**, horizonte **10 años**:
> **€18.000 equipo + €2.000 preparación del sitio + €20.000 operación = €40.000** de ciclo de vida
> (≈ €4.000/año amortizado). — *ParcelHive*

Cálculo:

```
€40.000 / 10 años / 30 compartimentos = €133 por compartimento-año
                                      = €0.365 por compartimento-día
                                      ≈ USD 0.395 por compartimento-día
```

Ese promedio se reparte por tamaño usando el **mix típico de una red de lockers
(43% chico / 43% mediano / 16% grande, ParcelPort)** y un ratio de tamaño 1 : 1.5 : 2.5:

- chico **$0.27** · mediano **$0.40** · grande **$0.67** (USD/día por compartimento)

Datos de respaldo adicionales: vida útil **10–15 años** (acero galvanizado 12–15);
energía de una instalación de 40 compartimentos **€284–834/año**; software/mantenimiento
**$100–200/mes + $500–1.200/año**.

> **Salvedad:** el TCO no incluye el **alquiler del espacio** que hospeda el locker. Para una red
> urbana ese es un costo real, por lo que este valor puede quedar algo bajo. Queda declarado
> como supuesto no cubierto.

## Datos que corroboran el MODELO (no son costos, pero son citas fuertes)

- **~8%** de las entregas fallan en el primer intento (rango 5–10%) → ancla la tasa de
  llegada al locker.
- **36%** de los fallos de primer intento son por **cliente ausente** → respalda el
  supuesto central del modelo (el paquete va al locker tras una ausencia).

## Nota de moneda

El modelo trabaja en **USD** para evitar el ruido de la inflación argentina. Si se quiere
expresar en pesos, convertir a un tipo de cambio con fecha declarada. Para números locales
finos (costo/hora de chofer, combustible, amortización real en Argentina) la mejor fuente
sigue siendo el **contacto de la empresa de reparto**; estos benchmarks son el respaldo
bibliográfico.

## Fuentes

- ParcelHive — Outdoor Parcel Locker Systems: Costs, Specs & ROI (TCO 10 años, vida útil, energía) — https://www.parcelhive.com/blog/outdoor-parcel-locker-costs-specs-roi
- Material Handling USA — Parcel Locker Guide (compartimentos por sistema) — https://mh-usa.com/blogs/parcel-locker-guide/
- ParcelPort — Smart Locker Sizing (mix 43/43/16 y dimensiones) — https://theparcelport.com/smart-locker-sizing-for-residential-buildings/

- Optivo — Failed first delivery: true cost — https://www.optivologistics.com/en/blog/failed-delivery-first-attempt-cost/
- GoBolt — Last Mile Delivery Cost — https://www.gobolt.com/blog/last-mile-delivery-cost/
- Pitney Bowes — Smart parcel locker cost — https://www.pitneybowes.com/us/blog/parcel-locker-price-how-much-will-it-cost-your-organization.html
- ClickNCollect — How much do smart lockers cost — https://www.clickncollect.com/insights/smart-locker-cost
- Claimlane — True cost of returns — https://www.claimlane.com/resources/blog/returns-for-ecommerce-brands
- Productiv — Cost of reverse logistics — https://getproductiv.com/blog/getting-your-arms-around-the-cost-of-reverse-logistics-in-e-commerce
