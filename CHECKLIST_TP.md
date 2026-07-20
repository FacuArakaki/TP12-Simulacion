# Checklist TP Simulación — Lockers última milla

> Presentación: 2da fecha del receso invernal. Faltan ~3 semanas.
> (Revisado: el motor y los datasets están OK; se agregaron los ítems de rigor estadístico/de modelo que faltaban.)

---

## ✅ HECHO
- [x] Datasets de llegadas (REALES, por escenario, desde los "Semana x")
- [x] Distribución de tamaños (REAL, mapeos Completo/Lockeable)
- [x] Datasets de retiros y devoluciones (SUPUESTOS anclados + documentados)
- [x] Motor evento a evento consolidado (sin código duplicado, sin Random de ausencia)
- [x] Función de costos (CPE + costo total desglosado)
- [x] N réplicas + IC 95% + números aleatorios comunes (CRN, streams separados)
- [x] Barrido de optimización + curvas U + heatmap
- [x] Documentación de datos (real vs supuesto)
- [x] Sensibilidad de costos: tornado + robustez del óptimo (sensibilidad.py)
- [x] Pruebas de borde del motor (0 lockers→EF100%, muchos lockers→EF0%, reproducibilidad por semilla)

---

## 1. DECISIONES A CERRAR CON EL GRUPO (rápidas, mueven los números)
- [ ] Valores de costo reales (los 9 supuestos) — idealmente estimar $/hora chofer+flota del contacto de reparto
- [ ] Mapeo de tamaños: Completo vs Lockeable (o intermedio)
- [ ] Escala barrio: confirmar SCALE_BARRIO=5 o filtrar por una zona real
- [ ] Ajuste de llegadas para el paper: empírica (inverse-transform) vs exponencial por escenario
- [ ] TMP: dejarlo en 3 días o bajarlo si quieren que PPV (vencidos) sea un resultado con señal

## 2. TRABAJO TÉCNICO RESTANTE (gráficos y experimentos)
- [x] Paper redactado en formato de cátedra (PAPER_TP12.docx) con 6 figuras y 4 tablas
- [ ] Gráficos faltantes: EF / PPV / EO por escenario (barras comparativas) — opcional
- [x] Análisis de sensibilidad de costos (±30%, tornado + robustez del óptimo) — HECHO
- [x] Análisis de sensibilidad de parámetros de comportamiento (retiro, TMP, tasa de devolución) — HECHO (sensibilidad_b.py)
- [ ] Refinar la grilla del barrido alrededor del óptimo (grilla fina)
- [ ] Test de bondad de ajuste formal para llegadas y tamaños (método + parámetros + conclusión)

## 2b. RIGOR ESTADÍSTICO / DE MODELO  (NUEVO — lo que pregunta el jurado)
- [ ] Análisis del TRANSITORIO (warm-up): el sistema arranca con los lockers VACÍOS
      → hay sesgo inicial. Descartar el período de calentamiento o justificar que con
      TF=30d el transitorio es despreciable. Graficar una métrica vs tiempo para mostrarlo.
- [ ] Justificar el NÚMERO DE RÉPLICAS: hoy N=15/30 es arbitrario. Fijarlo por precisión
      del IC (ej. semiancho < 5% de la media) vía corrida piloto.
- [ ] Justificar el HORIZONTE de corrida (TF=30d): por qué alcanza para estado estable.
- [ ] VERIFICACIÓN vs VALIDACIÓN:
      - Verificación (¿el código hace lo que dice?) → pruebas de borde ✅ + prueba de escritorio.
      - Validación (¿el modelo representa la realidad?) → contrastar resultados con la
        intuición / datos del contacto (ej. % de fallos, ocupación esperada).
- [ ] Coherencia de la política flexible con la realidad si se usa mapeo Completo
      (un mueble BIG-SIZE no entra a un locker) — dejar el supuesto explícito.

## 3. COHERENCIA TRIPLE (regla de cátedra: código = diagrama = doc)
- [ ] Actualizar el diagrama de flujo (draw.io): sacar el Random de ausencia
- [ ] Reflejar en el diagrama: tamaños por escenario + retiro lognormal + 4 streams (CRN)
- [ ] Confirmar TEF documentado = TEF implementado (vencimiento en el pase del camión, no evento propio)
- [ ] Actualizar el doc de variables (nomenclatura: TPRPML/TPRPGL, no TPRPCM/TPRPCG)

## 4. PAPER (todo lo que pidió David)
- [ ] Título
- [ ] Descripción del modelo y objetivo
- [ ] Funciones (FDPs con parámetros y unidades)
- [ ] Gráficos (llegadas, U del CPE, heatmap, comparativos)
- [ ] Resultados con unidades (min, $, %, paquetes)
- [ ] Comparativos entre escenarios y configuraciones
- [ ] Conclusiones (¿dimensionar para pico o promedio?)
- [ ] Agradecimientos
- [ ] Referencias (NRF, Olist, contacto de reparto)

## 5. SLIDES (7 min — pocas, mucho gráfico, poco texto)
- [ ] Armar deck (con unidades, gráficos, conclusiones, comparativas)
- [ ] Ensayar tiempo (7 min reales)

## 6. LOGÍSTICA DE PRESENTACIÓN
- [ ] Anotarse en el final
- [ ] 24hs antes: enviar a David el link con código + BBDD + documentación
- [ ] Imprimir al menos 3 papers
- [ ] Llevar la notebook

---

**Orden sugerido:** cerrar decisiones §1 → gráficos + sensibilidad + rigor §2/§2b → coherencia §3 → paper §4 → slides §5 → logística §6.
