# Respuestas de respaldo — Defensa oral

> Uso interno del equipo. **No** forma parte del discurso ni de las slides.
> Solo por si el jurado pregunta. Respuestas cortas, tono tranquilo, cerrar el tema.

## "¿De dónde salen los tiempos de retiro / las devoluciones?"
> "El tiempo de retiro y las devoluciones los **parametrizamos a partir de referencias
> de industria** y validamos el muestreo. Además, en el **análisis de sensibilidad**
> mostramos que el diseño óptimo **se mantiene** aunque ese valor varíe, así que el
> resultado no depende de un número puntual."

**No decir:** que un contacto nos pasó esos datos (no es cierto; el contacto aportó las
4 semanas reales de llegadas y tamaños, no el retiro ni las devoluciones).

## "¿Ajustaron una FDP a cada variable?"
> "Sí. **Retiros → lognormal** y **devoluciones → gamma**, con su función inversa y su
> test de bondad de ajuste (Kolmogorov-Smirnov, no se rechazan). En **llegadas**, que es
> dato real, probamos exponencial y Poisson: **ambas se rechazan** por sobredispersión y
> no-estacionariedad intradía, así que muestreamos la **distribución empírica** real."

## "¿Por qué evento a evento y no una librería?"
> "Es requisito de la cátedra y nos da control total del calendario de eventos. El motor
> está hecho a mano, con vectores de estado y HV como centinela."

## "¿Por qué 30 réplicas / horizonte de 1 año?"
> "30 réplicas para el IC del 95 %; horizonte de 1 año para capturar la estacionalidad
> completa. Verificamos que el óptimo a 1 año coincide con el de 30 días → es estable."

## "¿El resultado no depende de los costos que estimaron?"
> "No. En la sensibilidad, ±30 % en cualquier costo **no cambia el diseño óptimo**. El
> costo dominante es la amortización del locker, que es el mejor respaldado (dato de TCO)."
