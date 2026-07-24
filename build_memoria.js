const fs = require('fs');
const {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, BorderStyle, ShadingType, ExternalHyperlink
} = require('docx');

const ACCENT = "1F4E79";      // azul oscuro
const GREY = "F2F2F2";

// --- helpers ---
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, spacing: { before: 260, after: 120 }, children: [new TextRun({ text: t, bold: true, color: ACCENT })] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, spacing: { before: 180, after: 80 }, children: [new TextRun({ text: t, bold: true, color: ACCENT })] });
const P = (runs, opts = {}) => new Paragraph({ spacing: { after: 120 }, children: Array.isArray(runs) ? runs : [new TextRun(runs)], ...opts });
const B = (t) => new TextRun({ text: t, bold: true });
const T = (t) => new TextRun(t);
const BULLET = (runs) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 60 }, children: Array.isArray(runs) ? runs : [new TextRun(runs)] });
const LINK = (label, url) => new Paragraph({ bullet: { level: 0 }, spacing: { after: 40 }, children: [new ExternalHyperlink({ link: url, children: [new TextRun({ text: label, style: "Hyperlink", size: 20 })] })] });

const TW = 9360; // ancho tabla (Letter - márgenes)
function table(headers, rows, widths) {
  const mkCell = (text, w, opts = {}) => new TableCell({
    width: { size: w, type: WidthType.DXA },
    shading: opts.head ? { type: ShadingType.CLEAR, fill: ACCENT } : (opts.zebra ? { type: ShadingType.CLEAR, fill: GREY } : undefined),
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    children: [new Paragraph({ children: [new TextRun({ text: text, bold: !!opts.head, color: opts.head ? "FFFFFF" : "000000", size: 20 })] })]
  });
  const headRow = new TableRow({ tableHeader: true, children: headers.map((h, i) => mkCell(h, widths[i], { head: true })) });
  const bodyRows = rows.map((r, ri) => new TableRow({ children: r.map((c, i) => mkCell(String(c), widths[i], { zebra: ri % 2 === 1 })) }));
  return new Table({ columnWidths: widths, width: { size: TW, type: WidthType.DXA }, rows: [headRow, ...bodyRows] });
}

const children = [];

// Portada
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200, after: 40 }, children: [new TextRun({ text: "Memoria técnica — TP Simulación", bold: true, size: 36, color: ACCENT })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 40 }, children: [new TextRun({ text: "Optimización de costos en logística de última milla mediante una red de lockers inteligentes", italics: true, size: 24 })] }));
children.push(new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 200 }, children: [new TextRun({ text: "UTN FRBA · Simulación · Método evento a evento (event-scheduling, HV = infinito)", size: 18, color: "555555" })] }));

// 1
children.push(H1("1. Problema y modelo"));
children.push(P([T("Una empresa de e-commerce pierde plata cuando una entrega domiciliaria falla por "), B("ausencia del cliente"), T(" (reprogramación, combustible, horas de chofer). La propuesta: derivar esos paquetes a una "), B("red de lockers inteligentes"), T(" de un barrio, con capacidad finita y tres tamaños (chico/mediano/grande).")]));
children.push(P([B("Pregunta del TP: "), T("¿cuántos lockers de cada tamaño instalar para minimizar el costo logístico total?")]));
children.push(P([B("Elementos del modelo:")]));
children.push(BULLET([B("Un único punto de lockers = un barrio. "), T("Compartimentos chico/mediano/grande (variables de control).")]));
children.push(BULLET([T("El paquete entra al locker "), B("tras una entrega fallida por ausencia"), T("; el usuario luego lo retira.")]));
children.push(BULLET([B("Logística inversa: "), T("los usuarios dejan devoluciones en los mismos lockers y compiten por la capacidad. Sin lugar, el usuario se lleva el paquete → cliente insatisfecho + costo de retiro manual.")]));
children.push(BULLET([B("Política flexible: "), T("un paquete chico puede ocupar un locker mayor si no hay del suyo (genera costo por espacio ocioso). Es el trade-off central.")]));
children.push(BULLET([B("TMP "), T("(Tiempo Máximo de Permanencia): si un paquete no se retira antes del TMP, se vence y lo levanta el camión.")]));
children.push(BULLET([B("Camión: "), T("pasa cada IPC a retirar devoluciones y vencidos.")]));
children.push(BULLET([B("Estacionalidad: "), T("tres escenarios — Normal, Navidad, Cyber — con distinta demanda.")]));

// 2
children.push(H1("2. Datos"));
children.push(P([T("Distinción clave (y lo que se defiende en la exposición): "), B("qué es dato REAL y qué es SUPUESTO.")]));
children.push(H2("2.1 Reales (extraídos de la operación)"));
children.push(P([T("Origen: 4 archivos "), B("Semana x"), T(" de una empresa de reparto real (rutas NextDay, Buenos Aires), aportados por un contacto del equipo.")]));
children.push(BULLET([B("Llegadas: "), T("inter-arribos de las entregas fallidas por \"Cliente Ausente\", por escenario (se filtró por ese motivo, no toda \"Rechazada\"). Estacionalidad real: inter-arribo medio 4.27 / 5.20 / 3.62 min (Normal/Navidad/Cyber). Forma ≈ exponencial (proceso de Poisson).")]));
children.push(BULLET([B("Tamaños: "), T("distribución real por escenario. Dos mapeos: Completo (incluye muebles) y Lockeable (default; excluye los que no entran a un locker).")]));
children.push(H2("2.2 Supuestos (no existen en una operación sin lockers)"));
children.push(BULLET([B("Retiros: "), T("tiempo de retiro del locker. Lognormal cola derecha, mediana ~10 h.")]));
children.push(BULLET([B("Devoluciones: "), T("inter-arribo de devoluciones. Gamma, tasa anclada a NRF (~16.5%).")]));
children.push(P([B("Nota de rigor: "), T("el test de bondad de ajuste solo aplica a los datos reales; sobre un dataset sintético sería circular. Las llegadas se usan por distribución empírica (transformada inversa); los supuestos se defienden con análisis de sensibilidad, no con K-S.")]));

// 3
children.push(H1("3. Motor de simulación"));
children.push(P([T("Event-scheduling clásico de cátedra, escrito a mano (sin SimPy).")]));
children.push(BULLET([B("Eventos (TEF): "), T("LLP (llegada por fallo), PC (pase de camión), DPC/DPM/DPG (devoluciones por tamaño), RC/RM/RG (retiros del usuario). En cada paso se elige el evento de menor tiempo.")]));
children.push(BULLET([B("Estado de lockers: "), T("listas paralelas por tamaño. HV=libre, 1=pedido normal, 2=devolución; TOL=tiempo de ocupación; TPR=tiempo de próximo retiro.")]));
children.push(BULLET([B("colocar(): "), T("política flexible chico→[C,M,G], mediano→[M,G], grande→[G]. Ir a un compartimento mayor suma espacio ocioso.")]));
children.push(BULLET([B("Vencimiento: "), T("se detecta en el pase del camión (T − TOL ≥ TMP), consistente con el calendario.")]));
children.push(H2("Decisiones de modelado tomadas"));
children.push(BULLET([B("Sin Random de ausencia: "), T("las llegadas del dataset ya son los fallos por ausencia; agregar un Random sería doble-conteo.")]));
children.push(BULLET([B("SCALE_BARRIO: "), T("la data es de toda la operación (~5 zonas) y el modelo es un barrio, así que se estira el inter-arribo (supuesto de alcance a calibrar).")]));
children.push(BULLET([B("Mapeo Lockeable: "), T("un mueble no entra a un locker. Consecuencia realista: en Normal el tamaño grande casi no aparece (es estacional).")]));
children.push(H2("Números aleatorios comunes (CRN)"));
children.push(P([T("El Sampler tiene "), B("4 streams separados"), T(" (llegadas, tamaños, retiros, devoluciones). Dos configuraciones con la misma semilla ven la misma secuencia de eventos → la diferencia de resultado es por el diseño de lockers, no por ruido. Reduce la varianza al comparar configuraciones.")]));

// 4
children.push(H1("4. Función de costos"));
children.push(P([T("Costo Total = f(instalación, entregas fallidas, retiros manuales, vencidos, camión, espacio ocioso), y "), B("CPE = Costo Total / paquetes entregados"), T(" (métrica comparable entre escenarios y configuraciones). Cada término es un contador de la simulación multiplicado por su costo. Valores en USD, anclados a benchmarks de industria donde se pudo:")]));
children.push(table(
  ["Costo", "Valor", "Tipo / fuente"],
  [
    ["Entrega fallida (redespacho)", "$15", "FUENTE (Optivo/GoBolt)"],
    ["Devolución rechazada (retiro manual)", "$25", "FUENTE (Claimlane/Productiv)"],
    ["Amortización locker C / M / G", "$0.27 / 0.40 / 0.67 por día", "FUENTE (TCO 10 años, ParcelHive)"],
    ["Paquete vencido", "$12", "DEFINIDO"],
    ["Pase de camión", "$8", "DEFINIDO"],
    ["Espacio ocioso (CM / CG / MG)", "$0.5 / 1.0 / 0.7", "DEFINIDO"],
  ],
  [3900, 2760, 2700]
));
children.push(P([T("La "), B("tensión"), T(" entre el costo fijo (sube con más lockers) y las penalizaciones (bajan con más lockers) genera la "), B("curva U del CPE"), T(": existe un óptimo. Sin costo de instalación, la solución trivial sería \"infinitos lockers\".")], { spacing: { before: 120, after: 120 } }));

// 5
children.push(H1("5. Experimentación"));
children.push(BULLET([B("simulacion_lockers.py "), T("(main): corre los 3 escenarios con la config por defecto, con N réplicas + IC 95%.")]));
children.push(BULLET([B("barrido.py: "), T("recorre la grilla (CLTC, CLTM, CLTG) × escenario con CRN y busca la config que minimiza el CPE. Genera la curva U y el heatmap.")]));
children.push(BULLET([B("comparacion.py: "), T("deriva del barrido 4 diseños (Malo / Normal / Óptimo / Óptimo excelente) y los compara.")]));
children.push(H2("Verificación hecha"));
children.push(BULLET([T("Reproducibilidad por semilla · 0 lockers → EF 100% · muchos lockers → EF 0% · el CPE muestra la U con mínimo interior.")]));

// 6
children.push(H1("6. Resultados actuales"));
children.push(P([T("Config óptima por escenario (minimiza CPE, con costos reales USD, mapeo Lockeable, SCALE_BARRIO=5):")]));
children.push(table(
  ["Escenario", "Óptimo (C / M / G)", "CPE (USD/paq)", "EF"],
  [
    ["Normal", "50 / 15 / 10", "~$0.5", "0.0%"],
    ["Navidad", "40 / 15 / 15", "~$0.7", "0.1%"],
    ["Cyber", "40 / 25 / 15", "~$0.7", "0.9%"],
  ],
  [2340, 2340, 2340, 2340]
));
children.push(P([B("Conclusiones para la defensa:")], { spacing: { before: 120, after: 60 } }));
children.push(BULLET([T("La estacionalidad es real y cambia el diseño óptimo: Cyber exige más capacidad que Navidad.")]));
children.push(BULLET([T("En Normal el tamaño grande óptimo baja a 5 (casi no hay grandes) → dimensionar para el pico vs. para el promedio es la decisión de fondo.")]));
children.push(BULLET([T("Una config subdimensionada (\"Malo\") tiene CPE ~$26–32/paq contra ~$0.6–0.7 del óptimo: el valor de optimizar.")]));

// 6.1 Sensibilidad
children.push(H2("6.1 Análisis de sensibilidad de costos"));
children.push(P([T("Se varió cada parámetro de costo "), B("±30%"), T(" (método OAT, uno por vez), midiendo el impacto sobre el CPE y, sobre todo, si cambia el "), B("diseño óptimo"), T(". Como los costos no afectan la dinámica de la simulación, se simuló una vez y se recalcularon los costos sobre los mismos contadores: la comparación es exacta, sin ruido de semillas.")]));
children.push(BULLET([B("La amortización de lockers (C_CAP) es el costo dominante: "), T("±30% mueve el CPE ~32–44% (Cyber 31,9%; Navidad 44,0%). Todos los demás quedan por debajo del ~13%. Motivo: en la configuración óptima la saturación es casi nula, así que prácticamente no se pagan penalizaciones y el costo es esencialmente capacidad instalada.")]));
children.push(BULLET([B("Los costos respaldados por fuente (C_EF, C_MANUAL) tienen impacto bajo (≤5%): "), T("su incertidumbre no amenaza las conclusiones.")]));
children.push(BULLET([B("Robustez del óptimo: "), T("el diseño ganador se mantiene en la gran mayoría de las variaciones (Navidad y Cyber 0/12 cambios; Normal 3/12, con intercambios menores entre chicos y medianos).")]));
children.push(P([B("Conclusión: "), T("la recomendación de diseño es robusta a la incertidumbre de costos. La sensibilidad señaló a C_CAP como el parámetro dominante y por eso se lo refinó con un dato real de TCO (ver §9), pasando de supuesto a fuente: el costo que más pesa es hoy el mejor respaldado.")]));

// 7
children.push(H1("7. Estado y qué falta"));
children.push(P([T("El núcleo técnico está completo: datos reales (llegadas, tamaños) y parametrizados (retiros, devoluciones), motor evento a evento, función de costos anclada a fuentes, barrido con CRN + IC 95%, comparación de configs, sensibilidad de costos (Grupo A) y de comportamiento (Grupo B), diagrama de flujo sincronizado con el código, y paper + slides + guión (7 min). Corridas definitivas a horizonte de 1 año (TF = 60·24·365 min). Falta solo: completar autores/datos de contacto, enviar a David el link de GitHub 24 hs antes e imprimir 3 papers, y ensayar la presentación. El detalle vive en CHECKLIST_TP.md.")]));

// 8
children.push(H1("8. Inventario de archivos"));
children.push(BULLET([B("Código: "), T("simulacion_lockers.py (motor+costos), barrido.py (optimización), comparacion.py (4 configs), generar_datasets.py (regenera datasets).")]));
children.push(BULLET([B("Datos: "), T("dataset_llegadas_*.xlsx (real), dataset_tamanos.xlsx (real), dataset_retiros.xlsx, dataset_devoluciones.xlsx (supuestos).")]));
children.push(BULLET([B("Resultados: "), T("resultados_barrido.xlsx, comparacion_configs.xlsx, barrido_curvas.png, barrido_heatmap.png, comparacion_configs.png, control_histogramas.png.")]));
children.push(BULLET([B("Documentación: "), T("MEMORIA_TECNICA (este), DOCUMENTACION_DATOS.md, COSTOS_REFERENCIA.md, CHECKLIST_TP.md, CLAUDE.md, README.txt.")]));

// 9. Referencias
children.push(H1("9. Referencias (fuentes de costos)"));
children.push(P([T("Los costos en USD del modelo se anclaron a benchmarks de industria. Detalle en COSTOS_REFERENCIA.md.")]));
children.push(H2("Con fuente"));
children.push(P([B("C_EF = $15 "), T("(entrega fallida / redespacho). Base: ~$17.78 costo directo total, $8 redespacho directo, $25–40 impacto total.")], { spacing: { after: 40 } }));
children.push(LINK("Optivo — Failed first delivery: true cost", "https://www.optivologistics.com/en/blog/failed-delivery-first-attempt-cost/"));
children.push(LINK("GoBolt — Last Mile Delivery Cost", "https://www.gobolt.com/blog/last-mile-delivery-cost/"));
children.push(P([B("C_MANUAL = $25 "), T("(devolución rechazada / retiro manual). Base: $15–30 por devolución (directo).")], { spacing: { before: 80, after: 40 } }));
children.push(LINK("Claimlane — True cost of returns", "https://www.claimlane.com/resources/blog/returns-for-ecommerce-brands"));
children.push(LINK("Productiv — Cost of reverse logistics", "https://getproductiv.com/blog/getting-your-arms-around-the-cost-of-reverse-logistics-in-e-commerce"));
children.push(P([B("C_CAP = $0.27 / 0.40 / 0.67 por día "), T("(amortización locker). Derivado de un TCO real a 10 años: sistema outdoor de 30 compartimentos = €18.000 equipo + €2.000 sitio + €20.000 operación = €40.000 → €0.365 por compartimento-día ≈ USD 0.395, repartido por tamaño con el mix 43/43/16 y ratio 1 : 1.5 : 2.5. Vida útil 10–15 años. Salvedad: no incluye el alquiler del espacio que hospeda el locker.")], { spacing: { before: 80, after: 40 } }));
children.push(LINK("ParcelHive — Outdoor Parcel Locker Systems: Costs, Specs & ROI", "https://www.parcelhive.com/blog/outdoor-parcel-locker-costs-specs-roi"));
children.push(LINK("Material Handling USA — Parcel Locker Guide", "https://mh-usa.com/blogs/parcel-locker-guide/"));
children.push(LINK("ParcelPort — Smart Locker Sizing (mix 43/43/16)", "https://theparcelport.com/smart-locker-sizing-for-residential-buildings/"));
children.push(LINK("Pitney Bowes — Smart parcel locker cost", "https://www.pitneybowes.com/us/blog/parcel-locker-price-how-much-will-it-cost-your-organization.html"));
children.push(LINK("ClickNCollect — How much do smart lockers cost", "https://www.clickncollect.com/insights/smart-locker-cost"));
children.push(H2("Definidos por el equipo (sin fuente pública)"));
children.push(P([T("C_VENCIDO ($12), C_CAMION ($8) y ociosos ($0.5 / 1.0 / 0.7): definidos en orden de magnitud coherente. Se defienden con análisis de sensibilidad ±30%.")]));
children.push(H2("Datos que validan el modelo (no son costos)"));
children.push(P([T("~8% de las entregas fallan en el primer intento; 36% de esos fallos son por cliente ausente → respaldan el supuesto central (Optivo / GoBolt). Además, el mix típico de compartimentos de una red de lockers es 43% chico / 43% mediano / 16% grande (ParcelPort), que respalda de forma independiente la distribución de tamaños del modelo.")]));
children.push(P([T("Nota: son informes/blogs de industria (citables para el TP), no papers peer-reviewed. Para números locales, la mejor fuente es el contacto de la empresa de reparto.", )], { spacing: { before: 60 } }));

const doc = new Document({
  styles: { default: { document: { run: { font: "Calibri", size: 22 } } } },
  sections: [{
    properties: { page: { size: { width: 12240, height: 15840 }, margin: { top: 1440, bottom: 1440, left: 1440, right: 1440 } } },
    children
  }]
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("MEMORIA_TECNICA.docx", buf);
  console.log("MEMORIA_TECNICA.docx generado (" + buf.length + " bytes)");
});
