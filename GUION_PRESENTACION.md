# Guión de presentación — 7 minutos
### TP12 Simulación · Lockers de última milla

> **Cómo usarlo:** es una guía para practicar, no para leer palabra por palabra.
> Cronometren con las 3 marcas de tiempo. Son 10 slides ≈ 42 s cada una.
> **Sugerencia de reparto (3 integrantes):** A → slides 1–4 · B → slides 5–7 · C → slides 8–10.

---

## Slide 1 — Portada · (0:00 – 0:20)
Buenas, somos [nombres]. Vamos a presentar nuestro TP de Simulación: **optimización de costos en logística de última milla mediante una red de lockers inteligentes**. Lo resolvimos con un modelo de simulación de eventos discretos, método evento a evento.

## Slide 2 — El problema · (0:20 – 1:05)
Arranquemos por el problema. En el e-commerce, la **última milla** —el tramo final de la entrega— concentra la mayor parte del costo de distribución. Y ahí, una de las mayores ineficiencias es la **entrega que falla en el primer intento**: pasa en cerca del **8 %** de los envíos, y el **36 %** de esos fallos es simplemente porque el cliente no estaba en su casa. Cada reintento cuesta entre **8 y 18 dólares** en combustible, chofer y flota.
La alternativa que estudiamos es derivar esos paquetes a una **red de lockers** en el barrio. Pero los lockers tienen capacidad finita, así que la pregunta del trabajo es: **¿cuántos compartimentos de cada tamaño conviene instalar?** Pocos, y se satura; muchos, y pagás capacidad ociosa. Justo en el medio hay un óptimo.

## Slide 3 — El modelo · (1:05 – 2:00)
Este es el modelo. Un **único punto de lockers**, que representa un barrio, con compartimentos **chicos, medianos y grandes**. El paquete entra a la red **después de una entrega fallida por ausencia**, y el usuario después lo retira.
Le sumamos dos complejidades. Primero, **logística inversa**: los usuarios dejan devoluciones en los mismos lockers, así que **compiten por la misma capacidad**. Si no hay lugar, el cliente se lleva el paquete —queda insatisfecho y hay que ir a buscarlo al domicilio. Segundo, una **política flexible**: un paquete chico puede ocupar un compartimento más grande si no hay del suyo. Eso evita el rechazo, pero desperdicia espacio. **Ese es el trade-off central.** Y un camión pasa cada cierto intervalo a retirar devoluciones y paquetes vencidos.

## Slide 4 — Variables del modelo · (2:00 – 2:35)
Las variables las clasificamos según la metodología. Los **datos de entrada** son las distribuciones de llegadas, retiro, devoluciones y tamaños. Las de **control** —las que optimizamos— son la **cantidad de compartimentos de cada tamaño**, el tiempo máximo de permanencia y el intervalo del camión. La variable de **resultado**, la que queremos minimizar, es el **costo por paquete entregado**. Y el **estado** del sistema son los vectores de ocupación de cada locker.

## Slide 5 — Los datos · (2:35 – 3:20)
Sobre los datos: trabajamos con **cuatro semanas reales** de operación de una empresa de reparto del conurbano. De ahí salen los **tiempos entre llegadas** y la **distribución de tamaños** de paquete, y se ve la **estacionalidad** —en Cyber las llegadas son más frecuentes que en un mes normal. El modelo incorpora además el **tiempo de retiro** de los usuarios y las **devoluciones** de logística inversa, con sus distribuciones. El detalle de cada variable, con su función y su bondad de ajuste, está en la documentación.

## Slide 6 — Cómo lo resolvimos · (3:20 – 4:05)
¿Cómo lo resolvimos? Un **motor evento a evento hecho a mano**, sin librerías de simulación. Cada configuración la corrimos con **30 réplicas** y su intervalo de confianza del **95 %**. Y usamos **números aleatorios comunes**: mantenemos cuatro flujos de aleatorios separados, así dos configuraciones distintas enfrentan **exactamente la misma secuencia de eventos**. Eso es importante, porque nos permite afirmar que una configuración es mejor que otra **por su diseño y no por el ruido** de la simulación. Sobre eso hicimos un **barrido de 90 configuraciones** por escenario, buscando la de menor costo por paquete. El horizonte es de un año.

## Slide 7 — Existe un óptimo · (4:05 – 5:00)
Y este es el resultado central. Si graficamos el costo por paquete contra la cantidad de lockers, aparece una **curva en U**: con poca capacidad dominan las penalizaciones por saturación; con demasiada, la amortización de lo que queda ocioso. El **mínimo es interior** —o sea, **existe un óptimo**. Y no es el mismo para todos los escenarios: en la tabla se ve que **Cyber necesita más medianos y grandes** que un mes normal. El costo óptimo queda entre **50 y 70 centavos de dólar** por paquete.

## Slide 8 — Cuánto vale optimizar · (5:00 – 5:40)
Para dimensionar cuánto vale optimizar, comparamos cuatro diseños. Ojo con la escala, que es **logarítmica**: una red **subdimensionada** paga más de **30 dólares** por paquete, contra **70 centavos** del óptimo. Son **45 veces más**. Y del otro lado, la configuración de máximo servicio casi no mejora nada respecto del óptimo y cuesta más. O sea, el óptimo es realmente el **punto de equilibrio**.

## Slide 9 — ¿Y si los costos están mal? · (5:40 – 6:30)
Chequeamos qué tan sensible es el resultado a los parámetros. Variamos cada costo un **30 %** para arriba y para abajo. Dos conclusiones. La primera: el **diseño óptimo no cambia** ante esas variaciones de costo —es robusto. La segunda: el parámetro que **más pesa es el tiempo de retiro** de los usuarios. Si la gente tarda un 30 % más en retirar, el óptimo se corre de **30 a 50 compartimentos chicos**, porque los lockers quedan ocupados más tiempo. Ese es el factor a monitorear en la operación.

## Slide 10 — Conclusiones · (6:30 – 7:00)
Para cerrar. **Uno:** existe un óptimo de diseño. **Dos:** la estacionalidad lo modifica, así que hay que decidir si dimensionar para el pico o para el promedio. **Tres:** la recomendación es robusta a la incertidumbre de los costos. Y **cuatro:** el factor más sensible es el **comportamiento de retiro** de los usuarios, el punto a monitorear en la operación. **Muchas gracias, quedamos abiertos a preguntas.**

---

## Tips para la exposición
- **Ensayen con cronómetro** al menos dos veces. Si se pasan, la slide 4 (Variables) es la primera a acortar.
- No lean la slide: la slide es el apoyo visual, ustedes cuentan la historia.
- Frases cortas, una pausa después de cada número fuerte (8 %, 36 %, 45 veces).
- Miren al jurado, no a la pantalla.
- Respuestas de respaldo para preguntas del jurado: ver **RESPUESTAS_DEFENSA.md** (no forman parte del discurso; solo por si preguntan).
