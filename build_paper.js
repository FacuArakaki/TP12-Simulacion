const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, AlignmentType, SectionType,
  Table, TableRow, TableCell, WidthType, ImageRun, ShadingType
} = require('docx');

// ---- Formato exigido por la cátedra ----
// A4 (11906x16838 twips), márgenes 2,5 cm (1418), 2 columnas (esp. 1 cm = 566)
// Times New Roman. Sin numeración de página. Texto negro. Figuras B/N.
const F = "Times New Roman";
const S16 = 32, S14 = 28, S12 = 24, S10 = 20;   // half-points
const COLW = 283;                                // ancho útil de columna en px

// ---- helpers ----
const t = (text, o = {}) => new TextRun({ text, font: F, size: o.size || S12, bold: o.b, italics: o.i });
const p = (runs, o = {}) => new Paragraph({
  children: Array.isArray(runs) ? runs : [runs],
  alignment: o.al || AlignmentType.JUSTIFIED,
  spacing: { after: o.after === undefined ? 100 : o.after, line: 240 },
});
// Encabezado de sección (12, negrita)
const H = (text) => p([t(text, { b: true, size: S12 })], { al: AlignmentType.LEFT, after: 80 });
// Encabezado chico (10, negrita) para Abstract / Agradecimientos / Referencias
const Hs = (text) => p([t(text, { b: true, size: S10 })], { al: AlignmentType.LEFT, after: 60 });
// Subtítulo dentro de una sección
const Sub = (text) => p([t(text, { b: true, size: S12 })], { al: AlignmentType.LEFT, after: 60 });

const img = (file, h) => new Paragraph({
  alignment: AlignmentType.CENTER, spacing: { before: 120, after: 40 },
  children: [new ImageRun({ type: "png", data: fs.readFileSync(file),
                            transformation: { width: COLW, height: h } })],
});
const cap = (text) => p([t(text, { i: true, size: S10 })], { al: AlignmentType.CENTER, after: 160 });

// Tabla: ancho de columna = 4200 twips
function tabla(headers, rows, widths) {
  const cell = (txt, w, o = {}) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: o.head ? { type: ShadingType.CLEAR, fill: "D9D9D9" } : undefined,
    margins: { top: 30, bottom: 30, left: 60, right: 60 },
    children: [new Paragraph({
      alignment: o.al || AlignmentType.LEFT,
      children: [t(String(txt), { b: o.head, size: S10 })],
    })],
  });
  return new Table({
    columnWidths: widths,
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    rows: [
      new TableRow({ tableHeader: true, children: headers.map((h, i) => cell(h, widths[i], { head: true })) }),
      ...rows.map(r => new TableRow({ children: r.map((c, i) => cell(c, widths[i])) })),
    ],
  });
}

// ============================ PORTADA (1 columna) ============================
const portada = [
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 160 },
    children: [t("Análisis de una red de lockers inteligentes para la logística de última milla a través de la simulación de eventos discretos", { b: true, size: S16 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 80 },
    children: [t("Arakaki, Facundo Kenji; Dolce, Juan Martín; González Canosa, Agustín", { b: true, size: S14 })],
  }),
  new Paragraph({
    alignment: AlignmentType.CENTER, spacing: { after: 240 },
    children: [t("Universidad Tecnológica Nacional, Facultad Regional Buenos Aires", { b: true, i: true, size: S12 })],
  }),
];

// ============================ CUERPO (2 columnas) ============================
const c = [];

c.push(Hs("Abstract"));
c.push(p([t("Last-mile distribution accounts for a significant share of the logistics cost of e-commerce, and deliveries that fail because the customer is absent are one of its main sources of inefficiency. This work evaluates, through discrete-event simulation, the installation of a smart parcel-locker network in a neighborhood as an alternative to absorb those parcels and reduce the total logistics cost. A custom event-scheduling model was built, representing the arrival of parcels from failed home deliveries, pickup by the user, a reverse-logistics flow that competes for the same capacity, a flexible compartment-assignment policy, and the expiration of unclaimed parcels. The arrival and parcel-size distributions were obtained from real operational data of a delivery company in the Buenos Aires metropolitan area; pickup and return times were parameterized from industry-reported rates, since the analyzed network is not yet deployed and is therefore not observable. The number of compartments per size was determined through a sweep with common random numbers, thirty independent one-year replications, and 95 % confidence intervals. The results show a cost-per-delivered-parcel curve with an interior minimum and a least-cost configuration that varies with seasonality, requiring greater capacity in peak scenarios. The sensitivity analysis shows that the dominant cost is compartment amortization and that the least-cost design remains robust to ±30 % variations in the cost parameters, whereas user pickup behavior directly determines the required capacity.", { i: true, size: S10 })]));
c.push(Hs("Palabras Clave"));
c.push(p([t("Simulación de eventos discretos; logística de última milla; lockers inteligentes; entregas fallidas; logística inversa; análisis de costos.", { size: S10 })]));

// ---------------- Introducción ----------------
c.push(H("Introducción"));
c.push(p([t("El crecimiento sostenido del comercio electrónico trasladó la mayor parte del costo de distribución al tramo final de la cadena, la denominada última milla. Dentro de ese tramo, la entrega fallida en el primer intento constituye una de las ineficiencias más costosas: se estima que alrededor del 8 % de los envíos no se concreta en el primer intento y que cerca del 36 % de esos fallos se debe a la ausencia del cliente en el domicilio [1]. Cada reintento obliga a reprogramar una visita, con el consiguiente consumo de combustible, horas de chofer y utilización de flota; el costo directo asociado se estima entre 8 y 17,78 dólares por envío fallido [1], [2].")]));
c.push(p([t("Una alternativa consolidada para mitigar este problema es la instalación de redes de lockers inteligentes: puntos de retiro automatizados que desacoplan la entrega de la presencia del destinatario y permiten consolidar varios paquetes en una única parada. Sin embargo, estos dispositivos presentan una restricción física relevante: su capacidad es finita y está segmentada en compartimentos de tamaños discretos. A esa restricción se suma el flujo de logística inversa, ya que las devoluciones del comercio electrónico —que alcanzan aproximadamente el 16,5 % de las ventas [3]— pueden depositarse en los mismos compartimentos y compiten por la misma capacidad.")]));
c.push(p([t("El problema de diseño consiste entonces en determinar cuántos compartimentos de cada tamaño instalar. Sobredimensionar la red implica pagar la amortización de capacidad que permanece ociosa; subdimensionarla provoca saturación, con paquetes que no pueden ser aceptados, devoluciones rechazadas y clientes insatisfechos. Ambas fuerzas operan en sentidos opuestos, por lo que existe una configuración de costo mínimo.")]));
c.push(p([t("El objetivo de este trabajo es determinar, mediante simulación de eventos discretos, la configuración de compartimentos que minimiza el costo logístico por paquete entregado en un punto de lockers, considerando tres escenarios estacionales de demanda, y evaluar la robustez de esa recomendación frente a la incertidumbre de los parámetros de costo.")]));

// ---------------- Metodología ----------------
c.push(H("Elementos del Trabajo y metodología"));

c.push(Sub("Descripción del sistema"));
c.push(p([t("Se modela un único punto de lockers, representativo de un barrio, con compartimentos de tres tamaños: chico, mediano y grande. Sus cantidades (CLTC, CLTM y CLTG) constituyen las variables de control del estudio.")]));
c.push(p([t("Los paquetes ingresan al sistema únicamente después de una entrega domiciliaria fallida por ausencia del cliente y permanecen ocupando un compartimento hasta que el usuario los retira. En paralelo, los usuarios depositan devoluciones en los mismos compartimentos; si al momento de la devolución no hay lugar disponible, el usuario se lleva el paquete, lo que genera un cliente insatisfecho y obliga a coordinar un retiro manual a domicilio.")]));
c.push(p([t("La política de asignación es flexible: un paquete chico puede ocupar un compartimento mediano o grande cuando no hay disponibilidad de su propio tamaño. Esta decisión evita el rechazo inmediato, pero genera un costo por espacio ocioso y aumenta el riesgo de saturación futura para paquetes mayores; constituye el compromiso central del modelo. Finalmente, un paquete que supera el Tiempo Máximo de Permanencia (TMP) sin ser retirado se considera vencido; un camión pasa cada Intervalo de Pase (IPC) y retira tanto las devoluciones acumuladas como los paquetes vencidos.")]));

c.push(Sub("Método de simulación"));
c.push(p([t("Se implementó un motor de simulación evento a evento desarrollado a medida. En cada iteración se construye el calendario de eventos, se selecciona el de menor tiempo y se avanza el reloj hasta él. Los eventos considerados son la llegada de un paquete por entrega fallida, el pase del camión, la llegada de una devolución de cada tamaño y el retiro por parte del usuario de cada tamaño.")]));
c.push(p([t("El estado del sistema se representa con vectores paralelos por tamaño de compartimento, en los que el valor HV (High Value) indica compartimento libre, el valor 1 indica ocupación por un pedido normal y el valor 2 ocupación por una devolución. Vectores auxiliares registran el instante de ocupación y el momento de retiro programado. El vencimiento no constituye un evento propio: se detecta durante el pase del camión comparando el tiempo transcurrido desde la ocupación contra el TMP, lo que mantiene la coherencia con el calendario de eventos.")]));

c.push(Sub("Datos y distribuciones"));
c.push(p([t("Las distribuciones de entrada se clasificaron explícitamente según su origen, distinguiendo los datos reales de los parametrizados (Tabla 1 y Figura 1).")]));
c.push(p([t("Los datos reales provienen de cuatro semanas de operación de una empresa de reparto del AMBA. A partir de esos registros se extrajeron los intervalos entre entregas fallidas filtrando exclusivamente por el motivo “Cliente Ausente”, de modo de no incluir fallos ajenos al modelo, y la distribución de tamaños de paquete para cada escenario. Estas distribuciones se incorporan al modelo por transformada inversa, tomando los valores directamente de la muestra empírica observada para cada escenario.")]));
c.push(p([t("El presente es un estudio ex-ante: analiza el dimensionamiento de una red que aún no se encuentra desplegada. En consecuencia, el tiempo de retiro del locker y la frecuencia de devolución no son magnitudes observables, ya que no existe operación previa de la cual medirlas. Ambas se parametrizaron con distribuciones de forma compatible con el fenómeno —una lognormal de cola derecha para el tiempo de retiro, que refleja que la mayoría de los usuarios retira dentro del primer día y una minoría se demora, y una gamma para el intervalo entre devoluciones, cuya tasa se ancló a la proporción de devoluciones reportada por la industria [3]—. Su influencia sobre las conclusiones se acota explícitamente mediante el análisis de sensibilidad presentado en la sección de resultados.")]));
c.push(img("fig1_distribuciones.png", 384));
c.push(cap("Figura 1. Distribuciones de entrada del modelo: (a) inter-arribo de entregas fallidas por escenario, obtenido de datos reales de operación; (b) tiempo de retiro del locker y (c) inter-arribo de devoluciones, ambos parametrizados por tratarse de magnitudes no observables en la situación actual."));
c.push(cap("Tabla 1. Variables de entrada del modelo, origen y unidades."));
c.push(tabla(
  ["Variable", "Origen y forma", "Unidad"],
  [
    ["Inter-arribo de entregas fallidas", "Real: empírica por escenario (media 4,27 / 5,20 / 3,62)", "min"],
    ["Distribución de tamaños", "Real: empírica por escenario", "—"],
    ["Tiempo de retiro", "Parametrizado: lognormal, mediana ≈ 600", "min"],
    ["Inter-arribo de devoluciones", "Parametrizado: gamma, media ≈ 360", "min"],
    ["TMP", "Parámetro de control: 4320 (3 días)", "min"],
    ["IPC", "Parámetro de control: 1440 (1 día)", "min"],
  ],
  [1150, 2000, 750]
));

c.push(Sub("Función de costos"));
c.push(p([t("El costo logístico total de una corrida se compone de la amortización de los compartimentos instalados, las penalizaciones por entregas que el locker no pudo aceptar, los retiros manuales originados en devoluciones rechazadas, los paquetes vencidos, la operación del camión y el espacio ocioso generado por la política flexible. La medida de desempeño empleada para comparar configuraciones es el costo por paquete entregado (CPE), que normaliza el costo total y permite comparar escenarios de distinto volumen.")]));
c.push(p([t("Los parámetros de costo se expresan en dólares y se anclaron a valores de referencia de la industria siempre que fue posible (Tabla 2). En particular, la amortización de los compartimentos se derivó de un costo total de propiedad publicado para un sistema exterior de treinta compartimentos con horizonte de diez años [4], y se distribuyó por tamaño empleando la composición típica de una red de lockers [6].")]));
c.push(cap("Tabla 2. Parámetros de costo del modelo (USD) y tipo de respaldo."));
c.push(tabla(
  ["Concepto", "Valor (USD)", "Respaldo"],
  [
    ["Entrega fallida (redespacho)", "15", "Fuente [1], [2]"],
    ["Devolución rechazada (retiro manual)", "25", "Fuente [5], [7]"],
    ["Amortización compartimento C / M / G", "0,27 / 0,40 / 0,67 por día", "Fuente [4], [6]"],
    ["Paquete vencido", "12", "Estimado"],
    ["Pase de camión", "8", "Estimado"],
    ["Espacio ocioso (C-M / C-G / M-G)", "0,5 / 1,0 / 0,7", "Estimado"],
  ],
  [1500, 1250, 1150]
));

c.push(Sub("Diseño experimental"));
c.push(p([t("Cada configuración se evaluó con treinta réplicas independientes de un año cada una —equivalentes a treinta años de operación simulada en conjunto—, informando la media y el semiancho del intervalo de confianza del 95 %. Para comparar configuraciones se emplearon números aleatorios comunes: el generador mantiene cuatro flujos aleatorios separados —llegadas, tamaños, retiros y devoluciones— de modo que dos configuraciones con la misma semilla enfrentan exactamente la misma secuencia de eventos. De este modo, las diferencias observadas entre diseños se deben al diseño y no al ruido de la simulación, lo que reduce sensiblemente la varianza de la comparación.")]));
c.push(p([t("El análisis se realizó mediante un barrido exhaustivo sobre la grilla de configuraciones (CLTC, CLTM, CLTG) para cada escenario, seleccionando la de menor CPE. El horizonte de simulación es de un año, por lo que el período transitorio inicial —el sistema comienza con todos los compartimentos vacíos— resulta despreciable frente a la longitud de la corrida.")]));

// ---------------- Resultados ----------------
c.push(H("Resultados"));
c.push(p([t("La Tabla 3 presenta la configuración de mínimo CPE para cada escenario. El nivel de saturación resultante es bajo en los tres casos y el costo por paquete entregado se ubica entre 0,50 y 0,70 dólares.")]));
c.push(cap("Tabla 3. Configuración de menor CPE por escenario."));
c.push(tabla(
  ["Escenario", "C / M / G", "CPE (USD/paq)", "Saturac."],
  [
    ["Normal", "50 / 15 / 10", "0,50", "0,05 %"],
    ["Navidad", "40 / 15 / 15", "0,70", "0,07 %"],
    ["Cyber", "40 / 25 / 15", "0,70", "1,16 %"],
  ],
  [900, 1000, 1100, 900]
));
c.push(p([t("La Figura 2 muestra el comportamiento del CPE al variar la cantidad de compartimentos chicos, manteniendo los restantes en su valor de menor costo. En los tres escenarios la curva presenta la forma de U esperada: con capacidad insuficiente predominan las penalizaciones por saturación, mientras que a partir de cierto punto el costo vuelve a crecer por la amortización de capacidad ociosa. El mínimo es interior, lo que confirma la existencia de una configuración de costo mínimo.")]));
c.push(img("fig2_curvaU.png", 209));
c.push(cap("Figura 2. Costo por paquete entregado en función de la cantidad de compartimentos chicos, con los demás tamaños fijos en su valor de menor costo."));
c.push(p([t("La Figura 3 extiende el análisis a la interacción entre los tres tamaños para el escenario de mayor demanda, evaluando cada par de tamaños con el tercero fijo en su valor de menor costo. En los tres planos el costo desciende marcadamente al aumentar la capacidad hasta alcanzar una región amplia de bajo costo, dentro de la cual varias configuraciones resultan prácticamente equivalentes. El gradiente más pronunciado corresponde a los compartimentos chicos, coherente con el hecho de que concentran la mayor parte de la demanda: pasar de 10 a 40 unidades reduce el CPE de 15,5 a 3,4 dólares con los medianos en su mínimo. Los compartimentos grandes muestran un efecto menor pero no despreciable, ya que su escasez obliga a la política flexible a ocupar capacidad mayor con paquetes pequeños.")]));
c.push(img("fig3_heatmap.png", 456));
c.push(cap("Figura 3. CPE en función de cada par de tamaños de compartimento, escenario Cyber, con el tercer tamaño fijo en su valor de menor costo: (a) chicos vs. medianos, (b) chicos vs. grandes y (c) medianos vs. grandes."));
c.push(p([t("Para dimensionar el valor de la decisión de diseño, la Figura 4 compara cuatro diseños: uno subdimensionado, la configuración de referencia sin ajustar, la de menor costo y una configuración de máximo nivel de servicio. En el escenario Cyber, el diseño subdimensionado alcanza un CPE de 31,6 dólares con una saturación del 62 %, frente a 0,70 dólares y 1,2 % de la configuración de menor costo. La configuración de máximo servicio prácticamente no mejora el nivel de servicio de la de menor costo y sí incrementa el costo.")]));
c.push(img("fig4_comparacion.png", 209));
c.push(cap("Figura 4. Comparación del CPE entre cuatro diseños de red por escenario (escala logarítmica)."));
c.push(p([t("Finalmente, la Figura 5 y la Tabla 4 resumen el análisis de sensibilidad sobre los parámetros de costo. Dado que los costos no afectan la dinámica del sistema sino únicamente su valorización, cada variación se recalculó sobre los mismos contadores simulados, lo que elimina el ruido de muestreo en la comparación.")]));
c.push(img("fig5_tornado.png", 192));
c.push(cap("Figura 5. Sensibilidad del CPE a variaciones de ±30 % en cada parámetro de costo, escenario Cyber. La línea punteada indica el caso base."));
c.push(cap("Tabla 4. Variación del CPE ante ±30 % en cada parámetro de costo (escenario Cyber)."));
c.push(tabla(
  ["Parámetro", "−30 % (USD)", "+30 % (USD)", "Var."],
  [
    ["Amortización", "0,620", "0,855", "31,9 %"],
    ["Entrega fallida", "0,685", "0,790", "14,3 %"],
    ["Pase de camión", "0,707", "0,768", "8,3 %"],
    ["Retiro manual", "0,722", "0,753", "4,2 %"],
    ["Paquete vencido", "0,733", "0,741", "1,1 %"],
    ["Espacio ocioso", "0,737", "0,738", "0,2 %"],
  ],
  [1500, 900, 900, 800]
));
c.push(p([t("Dado que el tiempo de retiro y la frecuencia de devolución no son observables en la situación actual, se evaluó su influencia con el mismo criterio de ±30 % (Figura 6). El tiempo de retiro resulta el parámetro más influyente del modelo: en el escenario de mayor demanda, un incremento del 30 % en la mediana de retiro eleva el CPE de 0,74 a 1,33 dólares y multiplica la saturación de 1,2 % a 3,7 %, dado que los compartimentos permanecen ocupados durante más tiempo y la capacidad efectiva disminuye. El TMP prácticamente no altera el costo, pero gobierna la proporción de paquetes vencidos, que pasa de 0,03 % a 0,46 % al reducirlo un 30 %. La tasa de devolución incide de forma moderada sobre el costo y de forma directa sobre los clientes insatisfechos, que se duplican al incrementarla un 30 %.")]));
c.push(img("fig6_sensibilidad_supuestos.png", 384));
c.push(cap("Figura 6. Sensibilidad a los parámetros de comportamiento no observables: (a) tiempo de retiro, (b) TMP y (c) tasa de devolución."));
c.push(p([t("A diferencia de lo observado con los costos, el tiempo de retiro sí desplaza el diseño de menor costo. Al recalcular la mejor configuración sobre la grilla completa bajo cada nivel en el escenario Cyber, la configuración de mínimo costo pasa de 30/20/15 compartimentos con un retiro un 30 % más rápido, a 40/25/15 en el caso base y a 50/25/15 con un retiro un 30 % más lento. El comportamiento de retiro de los usuarios determina por lo tanto la capacidad requerida de manera aproximadamente proporcional, lo que constituye el principal factor a monitorear en una implementación real.")]));
c.push(p([t("La amortización de los compartimentos resulta el parámetro dominante, con una variación del 31,9 % del CPE, mientras que los restantes se mantienen por debajo del 15 %. Al recalcular la mejor configuración bajo cada variación, el diseño ganador no se modifica en los escenarios Navidad y Cyber, y sólo cambia en tres de las doce variaciones evaluadas en el escenario Normal, con intercambios menores entre tamaños contiguos.")]));

// ---------------- Discusión ----------------
c.push(H("Discusión"));
c.push(p([t("Los resultados confirman que el dimensionamiento de una red de lockers constituye un problema de decisión con solución interior. La forma de U del costo responde a la tensión entre dos componentes de signo opuesto: un costo fijo que crece con la capacidad instalada y un conjunto de penalizaciones que decrece con ella. La consecuencia práctica es que ni la estrategia de instalar la mayor capacidad posible ni la de minimizar la inversión inicial resultan convenientes.")]));
c.push(p([t("La estacionalidad tiene un efecto directo sobre el diseño recomendado. El escenario de mayor demanda requiere más capacidad, particularmente en compartimentos medianos y grandes, mientras que en el escenario de demanda habitual la proporción de paquetes grandes es marginal. Esto plantea una decisión de fondo para el operador: dimensionar la red para el pico implica sostener capacidad ociosa durante la mayor parte del año, mientras que dimensionarla para la demanda habitual implica aceptar saturación y pérdida de servicio durante los eventos de alta demanda.")]));
c.push(p([t("Un hallazgo relevante es la planicie de la región de menor costo. Varias configuraciones presentan costos estadísticamente equivalentes en el entorno del mínimo, lo que otorga al operador un grado de libertad adicional para decidir según criterios no contemplados en la función de costos, tales como restricciones de espacio físico o disponibilidad de módulos comerciales.")]));
c.push(p([t("El análisis de sensibilidad aporta dos conclusiones de distinta naturaleza. La primera es metodológica: identificó a la amortización de los compartimentos como el parámetro determinante del costo, que es además el mejor respaldado del modelo, dado que se ancló a un costo total de propiedad publicado [4]. La segunda es sustantiva: el diseño de menor costo se mantiene estable ante variaciones de ±30 % en los costos, de modo que la recomendación no depende de la precisión de los parámetros menos documentados.")]));
c.push(p([t("El trabajo presenta limitaciones que conviene explicitar. Se modela un único punto de lockers, por lo que no se capturan efectos de red ni la posibilidad de derivar paquetes entre puntos cercanos. La tasa de arribos proviene de una operación que abarca varias zonas y se escaló para representar un barrio, lo que constituye un supuesto de alcance. El costo total de propiedad utilizado no incluye el alquiler del espacio que hospeda el locker, por lo que la amortización empleada podría subestimar el costo real. Por último, corresponde distinguir entre dos tipos de incertidumbre. La incertidumbre económica resultó inocua: el diseño de menor costo no se modifica ante variaciones de ±30 % en los costos. La incertidumbre de comportamiento, en cambio, sí es determinante: el tiempo de retiro desplaza la mejor configuración de 30 a 50 compartimentos chicos dentro del rango evaluado. Esto no invalida el modelo, sino que precisa su alcance: la metodología y la estructura de costos son robustas, mientras que el dimensionamiento absoluto debe recalibrarse una vez que exista operación real de la que medir el comportamiento de retiro.")]));

// ---------------- Conclusión ----------------
c.push(H("Conclusión"));
c.push(p([t("Se desarrolló un modelo de simulación de eventos discretos, implementado con la metodología de evento a evento, que representa la operación de una red de lockers inteligentes alimentada por entregas domiciliarias fallidas e integrada con un flujo de logística inversa. El modelo combina distribuciones obtenidas de datos reales de operación para las llegadas y los tamaños de paquete con distribuciones parametrizadas y documentadas para los tiempos de retiro y devolución.")]));
c.push(p([t("El barrido de configuraciones, ejecutado con números aleatorios comunes e intervalos de confianza del 95 %, permitió identificar la configuración de mínimo costo por paquete entregado en cada escenario estacional, con valores de entre 0,50 y 0,70 dólares por paquete y niveles de saturación inferiores al 1,2 %. La comparación contra diseños alternativos muestra que una red subdimensionada multiplica el costo por paquete en más de cuarenta veces, lo que cuantifica el valor de la decisión de diseño.")]));
c.push(p([t("El análisis de sensibilidad establece que la amortización de los compartimentos es el componente de costo determinante y que, no obstante, el diseño de menor costo permanece estable ante variaciones de ±30 % en los parámetros de costo. El análisis sobre los parámetros de comportamiento muestra en cambio que el tiempo de retiro escala la capacidad requerida de forma aproximadamente proporcional, desplazando la mejor configuración de 30 a 50 compartimentos chicos dentro del rango evaluado. La recomendación es por lo tanto robusta frente a la incertidumbre económica, mientras que el dimensionamiento absoluto queda condicionado al comportamiento de retiro de los usuarios, magnitud que sólo podrá medirse una vez desplegada la red.")]));

// ---------------- Agradecimientos ----------------
c.push(Hs("Agradecimientos"));
c.push(p([t("Los autores agradecen a los docentes Ing. David Mammana e Ing. Erica Milin por el seguimiento y las observaciones realizadas durante la definición del modelo, y a Matías Aréchaga, de Enviopack, por facilitar los registros de operación que hicieron posible la caracterización de la demanda.", { size: S10 })]));

// ---------------- Referencias ----------------
c.push(Hs("Referencias"));
const refs = [
  "Optivo Logistics, “Failed first delivery: the true cost”. [En línea]. Disponible en: https://www.optivologistics.com/en/blog/failed-delivery-first-attempt-cost/",
  "GoBolt, “Last Mile Delivery Cost”. [En línea]. Disponible en: https://www.gobolt.com/blog/last-mile-delivery-cost/",
  "National Retail Federation, “2023 Consumer Returns in the Retail Industry”. [En línea]. Disponible en: https://nrf.com/research/2023-consumer-returns-retail-industry",
  "ParcelHive, “Outdoor Parcel Locker Systems: Costs, Specs & ROI”. [En línea]. Disponible en: https://www.parcelhive.com/blog/outdoor-parcel-locker-costs-specs-roi",
  "Claimlane, “The True Cost of Returns for Ecommerce Brands”. [En línea]. Disponible en: https://www.claimlane.com/resources/blog/returns-for-ecommerce-brands",
  "ParcelPort, “Smart Locker Sizing”. [En línea]. Disponible en: https://theparcelport.com/smart-locker-sizing-for-residential-buildings/",
  "Productiv, “Getting your arms around the cost of reverse logistics in e-commerce”. [En línea]. Disponible en: https://getproductiv.com/blog/getting-your-arms-around-the-cost-of-reverse-logistics-in-e-commerce",
  "Olist, “Brazilian E-Commerce Public Dataset”, Kaggle. [En línea]. Disponible en: https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce",
];
refs.forEach((r, i) => c.push(p([t(`[${i + 1}] ${r}`, { size: S10 })], { after: 40 })));

// ---------------- Datos de contacto ----------------
c.push(Hs("Datos de Contacto"));
c.push(p([t("Arakaki, Facundo Kenji. Universidad Tecnológica Nacional, Facultad Regional Buenos Aires. Medrano 951, C1179AAQ, Ciudad Autónoma de Buenos Aires, Argentina. farakaki@frba.utn.edu.ar", { i: true, size: S10 })], { after: 60 }));
c.push(p([t("Dolce, Juan Martín. Universidad Tecnológica Nacional, Facultad Regional Buenos Aires. Medrano 951, C1179AAQ, Ciudad Autónoma de Buenos Aires, Argentina. jdolce@frba.utn.edu.ar", { i: true, size: S10 })], { after: 60 }));
c.push(p([t("González Canosa, Agustín. Universidad Tecnológica Nacional, Facultad Regional Buenos Aires. Medrano 951, C1179AAQ, Ciudad Autónoma de Buenos Aires, Argentina. agonzalezcanosa@frba.utn.edu.ar", { i: true, size: S10 })]));

// ============================ DOCUMENTO ============================
const pageProps = {
  size: { width: 11906, height: 16838 },
  margin: { top: 1418, bottom: 1418, left: 1418, right: 1418 },
};
const doc = new Document({
  styles: { default: { document: { run: { font: F, size: S12, color: "000000" } } } },
  sections: [
    { properties: { page: pageProps }, children: portada },
    {
      properties: {
        type: SectionType.CONTINUOUS,
        page: pageProps,
        column: { count: 2, space: 566, equalWidth: true },
      },
      children: c,
    },
  ],
});

Packer.toBuffer(doc).then(b => {
  fs.writeFileSync("PAPER_TP12.docx", b);
  console.log("PAPER_TP12.docx generado (" + b.length + " bytes)");
});
