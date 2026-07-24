const pptxgen = require("pptxgenjs");
const pres = new pptxgen();
pres.layout = "LAYOUT_WIDE";          // 13.3 x 7.5
const W = 13.3, H = 7.5;

// ---- Paleta (logística / cargo) ----
const NAVY = "1E2761", AMBER = "E8833A", ICE = "7FA6D9",
      LIGHT = "F4F6FA", GREY = "5A6478", WHITE = "FFFFFF";
const TIT = "Cambria", BODY = "Calibri";

// ---- helpers ----
const titulo = (s, txt) => s.addText(txt, {
  x: 0.6, y: 0.42, w: W - 1.2, h: 0.8, fontFace: TIT, fontSize: 32, bold: true, color: NAVY,
});
const kicker = (s, txt) => s.addText(txt, {
  x: 0.6, y: 1.12, w: W - 1.2, h: 0.4, fontFace: BODY, fontSize: 15, color: GREY,
});
// tarjeta con número grande
const stat = (s, x, y, w, num, lab, colNum = AMBER) => {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h: 1.95, fill: { color: WHITE },
    line: { color: "E2E7F0", width: 1 }, rectRadius: 0.12,
    shadow: { type: "outer", blur: 8, offset: 2, angle: 90, color: "9AA5B8", opacity: 0.25 } });
  s.addText(num, { x, y: y + 0.22, w, h: 0.9, align: "center",
    fontFace: TIT, fontSize: 40, bold: true, color: colNum });
  s.addText(lab, { x: x + 0.15, y: y + 1.12, w: w - 0.3, h: 0.7, align: "center",
    fontFace: BODY, fontSize: 13, color: GREY });
};
const bullets = (s, x, y, w, items, size = 15) => s.addText(
  items.map((it, i) => ({ text: it, options: { bullet: true, breakLine: i < items.length - 1 } })),
  { x, y, w, h: 3.2, fontFace: BODY, fontSize: size, color: NAVY, paraSpaceAfter: 10, valign: "top" }
);

// ============================================================ 1 PORTADA
let s = pres.addSlide();
s.background = { color: NAVY };
s.addText("Optimización de costos en logística de última milla", {
  x: 0.9, y: 2.05, w: W - 1.8, h: 0.9, fontFace: TIT, fontSize: 38, bold: true, color: WHITE });
s.addText("mediante una red de lockers inteligentes", {
  x: 0.9, y: 2.95, w: W - 1.8, h: 0.7, fontFace: TIT, fontSize: 30, color: AMBER });
s.addText("Simulación de eventos discretos  ·  método evento a evento", {
  x: 0.9, y: 3.8, w: W - 1.8, h: 0.4, fontFace: BODY, fontSize: 16, color: ICE });
s.addText("UTN FRBA  —  Simulación  —  TP12", {
  x: 0.9, y: 5.5, w: W - 1.8, h: 0.4, fontFace: BODY, fontSize: 15, color: WHITE });
s.addText("[Integrantes: completar]", {
  x: 0.9, y: 5.95, w: W - 1.8, h: 0.4, fontFace: BODY, fontSize: 14, color: ICE });
s.addNotes("00:00-00:30 — Presentarnos y enunciar el problema en una frase: las entregas que fallan porque el cliente no está cuestan plata, y queremos saber si una red de lockers conviene y de qué tamaño.");

// ============================================================ 2 PROBLEMA
s = pres.addSlide(); s.background = { color: LIGHT };
titulo(s, "El problema: la entrega que falla");
kicker(s, "La última milla concentra el mayor costo de distribución del e-commerce");
stat(s, 0.85, 2.1, 3.5, "8 %", "de las entregas fallan\nen el primer intento");
stat(s, 4.9, 2.1, 3.5, "36 %", "de esos fallos son por\nausencia del cliente", NAVY);
stat(s, 8.95, 2.1, 3.5, "USD 8–18", "cuesta cada\nreintento de entrega");
s.addShape(pres.ShapeType.roundRect, { x: 0.85, y: 4.55, w: W - 1.7, h: 1.5,
  fill: { color: NAVY }, rectRadius: 0.12 });
s.addText("¿Cuántos compartimentos de cada tamaño conviene instalar?", {
  x: 1.15, y: 4.75, w: W - 2.3, h: 0.5, fontFace: TIT, fontSize: 22, bold: true, color: WHITE });
s.addText("Pocos → saturación y entregas rechazadas.   Muchos → se paga capacidad ociosa.", {
  x: 1.15, y: 5.3, w: W - 2.3, h: 0.5, fontFace: BODY, fontSize: 16, color: ICE });
s.addNotes("00:30-01:15 — Tres datos de industria. El 36% por ausencia es el que justifica el locker. Cerrar con la pregunta del TP: existe un óptimo porque las dos fuerzas van en sentidos opuestos.");

// ============================================================ 3 MODELO
s = pres.addSlide(); s.background = { color: WHITE };
titulo(s, "El modelo");
kicker(s, "Un punto de lockers en un barrio · tres tamaños de compartimento");
s.addImage({ path: "slide_esquema.png", x: 0.7, y: 1.75, w: 11.9, h: 4.55 });
s.addText("Variables de control: cantidad de compartimentos chicos, medianos y grandes", {
  x: 0.7, y: 6.45, w: 11.9, h: 0.4, align: "center", fontFace: BODY, fontSize: 14, color: GREY });
s.addNotes("01:15-02:15 — Recorrer el esquema: el paquete entra tras el fallo, el usuario lo retira. Las devoluciones compiten por la misma capacidad. El camión pasa cada IPC y levanta devoluciones y vencidos. Destacar la política flexible: es el trade-off central del trabajo.");

// ============================================================ 3b VARIABLES
s = pres.addSlide(); s.background = { color: LIGHT };
titulo(s, "Variables del modelo");
kicker(s, "Clasificadas según la metodología de simulación");
const vcard = (x, y, w, h, head, headColor, items) => {
  s.addShape(pres.ShapeType.roundRect, { x, y, w, h, fill: { color: WHITE },
    line: { color: "E2E7F0", width: 1 }, rectRadius: 0.1,
    shadow: { type: "outer", blur: 7, offset: 2, angle: 90, color: "9AA5B8", opacity: 0.22 } });
  s.addText(head, { x: x + 0.28, y: y + 0.16, w: w - 0.5, h: 0.4,
    fontFace: TIT, fontSize: 17, bold: true, color: headColor });
  s.addText(items.map((it, i) => ({ text: it, options: { bullet: true, breakLine: i < items.length - 1 } })),
    { x: x + 0.32, y: y + 0.66, w: w - 0.58, h: h - 0.82, fontFace: BODY, fontSize: 12,
      color: NAVY, paraSpaceAfter: 4, valign: "top" });
};
const XA = 0.7, XB = 6.75, WC = 5.85, HC = 2.2, YA = 1.7, YB = 4.05;
vcard(XA, YA, WC, HC, "Datos  (entrada)", ICE, [
  "FDP de llegadas, por escenario",
  "Tiempo de retiro del usuario (TPR)",
  "FDP de devoluciones",
  "Distribución de tamaños de paquete"]);
vcard(XB, YA, WC, HC, "Control  (lo que optimizamos)", AMBER, [
  "CLTC / CLTM / CLTG — compartimentos por tamaño",
  "TMP — tiempo máximo de permanencia",
  "IPC — intervalo de pase del camión"]);
vcard(XA, YB, WC, HC, "Resultado  (salida)", "3C8C6E", [
  "CPE — costo por paquete entregado (objetivo)",
  "EF % — entregas fallidas · PPV % — vencidos",
  "CI — clientes insatisfechos · EO — espacio ocioso"]);
vcard(XB, YB, WC, HC, "Estado", NAVY, [
  "DispPaqC/M/G — HV libre · 1 normal · 2 devolución",
  "TOL — tiempo de ocupación del compartimento",
  "TPR — próximo retiro programado"]);
s.addText("Optimizamos las variables de CONTROL para minimizar el CPE (variable de resultado).", {
  x: 0.7, y: 6.45, w: 11.9, h: 0.4, align: "center", fontFace: BODY, fontSize: 13.5, bold: true, color: NAVY });
s.addNotes("~00:45 — Clasificación de variables de la metodologia de simulacion. Lo clave: las de Control (cantidad de lockers, TMP, IPC) son las palancas que movemos; el CPE es la variable de resultado que minimizamos. Datos y Estado sostienen la dinamica.");

// ============================================================ 4 DATOS
s = pres.addSlide(); s.background = { color: LIGHT };
titulo(s, "Los datos");
kicker(s, "4 semanas de operación real de una empresa de reparto del AMBA");
s.addImage({ path: "slide_datos.png", x: 0.7, y: 1.8, w: 7.0, h: 3.8 });
s.addShape(pres.ShapeType.roundRect, { x: 8.1, y: 1.9, w: 4.4, h: 1.75,
  fill: { color: WHITE }, line: { color: "E2E7F0", width: 1 }, rectRadius: 0.1 });
s.addText("Llegadas y tamaños", { x: 8.35, y: 2.05, w: 3.9, h: 0.35, fontFace: TIT, fontSize: 17, bold: true, color: AMBER });
s.addText("Inter-arribos de entregas fallidas y distribución de tamaños de paquete, por escenario", {
  x: 8.35, y: 2.45, w: 3.9, h: 1.0, fontFace: BODY, fontSize: 13.5, color: NAVY });
s.addShape(pres.ShapeType.roundRect, { x: 8.1, y: 3.85, w: 4.4, h: 1.75,
  fill: { color: WHITE }, line: { color: "E2E7F0", width: 1 }, rectRadius: 0.1 });
s.addText("Comportamiento", { x: 8.35, y: 4.0, w: 3.9, h: 0.35, fontFace: TIT, fontSize: 17, bold: true, color: ICE });
s.addText("Tiempo de retiro del usuario y devoluciones (logística inversa) como entradas del modelo", {
  x: 8.35, y: 4.4, w: 3.9, h: 1.0, fontFace: BODY, fontSize: 13.5, color: NAVY });
s.addText("Estacionalidad real: Cyber 3,62 min · Normal 4,27 min · Navidad 5,20 min entre fallos", {
  x: 0.7, y: 5.85, w: 11.9, h: 0.4, fontFace: BODY, fontSize: 14.5, bold: true, color: NAVY });
s.addNotes("02:15-03:00 — Los inter-arribos salen de 4 semanas reales de operación y muestran estacionalidad (Cyber más frecuente que Normal). El modelo usa además las distribuciones de tiempo de retiro, devoluciones y tamaños de paquete.");

// ============================================================ 5 MÉTODO
s = pres.addSlide(); s.background = { color: WHITE };
titulo(s, "Cómo lo resolvimos");
const pasos = [
  ["1", "Motor evento a evento", "Implementado a medida, sin librerías de simulación"],
  ["2", "30 réplicas + IC 95 %", "Cada configuración se informa con su intervalo de confianza"],
  ["3", "Números aleatorios comunes", "4 flujos separados: las configs se comparan sin ruido"],
  ["4", "Barrido de 90 configuraciones", "Se busca la de mínimo costo por paquete entregado"],
];
pasos.forEach((p, i) => {
  const y = 1.75 + i * 1.25;
  s.addShape(pres.ShapeType.ellipse, { x: 0.9, y: y + 0.08, w: 0.62, h: 0.62, fill: { color: AMBER } });
  s.addText(p[0], { x: 0.9, y: y + 0.08, w: 0.62, h: 0.62, align: "center", valign: "middle",
    fontFace: TIT, fontSize: 20, bold: true, color: WHITE });
  s.addText(p[1], { x: 1.75, y: y, w: 5.0, h: 0.42, fontFace: TIT, fontSize: 19, bold: true, color: NAVY, margin: 0 });
  s.addText(p[2], { x: 1.75, y: y + 0.42, w: 10.5, h: 0.4, fontFace: BODY, fontSize: 14, color: GREY, margin: 0 });
});
s.addText("Horizonte: 1 año simulado por réplica", {
  x: 0.9, y: 6.6, w: 11.5, h: 0.4, fontFace: BODY, fontSize: 14, italic: true, color: GREY });
s.addNotes("03:00-03:45 — Cuatro puntos rápidos. Enfatizar números aleatorios comunes: es lo que permite afirmar que una config es mejor que otra sin que sea ruido de la simulación.");

// ============================================================ 6 CURVA U
s = pres.addSlide(); s.background = { color: LIGHT };
titulo(s, "Resultado: existe un óptimo");
s.addImage({ path: "slide_curvaU.png", x: 0.6, y: 1.55, w: 7.5, h: 3.95 });
s.addText("Configuración óptima", { x: 8.4, y: 1.75, w: 4.3, h: 0.4, fontFace: TIT, fontSize: 19, bold: true, color: NAVY });
const filas = [["Normal", "50 / 15 / 10", "0,50"], ["Navidad", "40 / 15 / 15", "0,70"], ["Cyber", "40 / 25 / 15", "0,70"]];
s.addTable(
  [[{ text: "Escenario", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
    { text: "C / M / G", options: { bold: true, color: WHITE, fill: { color: NAVY } } },
    { text: "USD/paq", options: { bold: true, color: WHITE, fill: { color: NAVY } } }],
   ...filas.map(r => r.map(cell => ({ text: cell, options: { color: NAVY } })))],
  { x: 8.4, y: 2.25, w: 4.3, colW: [1.5, 1.6, 1.2], fontFace: BODY, fontSize: 13,
    border: { type: "solid", color: "E2E7F0", pt: 1 }, rowH: 0.42, valign: "middle" });
s.addText("Con capacidad insuficiente mandan las penalizaciones; con capacidad de más, la amortización.", {
  x: 0.6, y: 5.75, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 15, color: NAVY });
s.addNotes("03:45-04:45 — La curva en U es el resultado central: el mínimo es interior, o sea existe un óptimo. Señalar que el óptimo cambia con el escenario: Cyber pide más medianos y grandes que Navidad.");

// ============================================================ 7 COMPARATIVA
s = pres.addSlide(); s.background = { color: WHITE };
titulo(s, "¿Cuánto vale optimizar?");
s.addImage({ path: "slide_comparacion.png", x: 0.6, y: 1.6, w: 7.5, h: 3.95 });
stat(s, 8.4, 1.9, 4.3, "45×", "más caro por paquete si la red\nqueda subdimensionada", AMBER);
s.addShape(pres.ShapeType.roundRect, { x: 8.4, y: 4.15, w: 4.3, h: 1.5,
  fill: { color: NAVY }, rectRadius: 0.1 });
s.addText("USD 31,7  →  USD 0,70", { x: 8.55, y: 4.35, w: 4.0, h: 0.5, align: "center",
  fontFace: TIT, fontSize: 20, bold: true, color: WHITE });
s.addText("subdimensionado vs. óptimo (Cyber)", { x: 8.55, y: 4.9, w: 4.0, h: 0.5, align: "center",
  fontFace: BODY, fontSize: 13, color: ICE });
s.addText("Sobredimensionar casi no mejora el servicio y sí agrega costo.", {
  x: 0.6, y: 5.8, w: 12.1, h: 0.5, fontFace: BODY, fontSize: 15, color: NAVY });
s.addNotes("04:45-05:30 — Comparamos cuatro diseños. El subdimensionado paga 45 veces más por paquete. Y el de máximo servicio no compensa: gasta más sin mejorar casi nada. El óptimo es el punto de equilibrio.");

// ============================================================ 8 SENSIBILIDAD
s = pres.addSlide(); s.background = { color: LIGHT };
titulo(s, "¿Y si los costos están mal?");
kicker(s, "Se varió cada parámetro ±30 % y se volvió a optimizar");
s.addImage({ path: "slide_tornado.png", x: 0.6, y: 1.75, w: 7.5, h: 3.85 });
s.addShape(pres.ShapeType.roundRect, { x: 8.4, y: 1.9, w: 4.3, h: 1.7,
  fill: { color: WHITE }, line: { color: "E2E7F0", width: 1 }, rectRadius: 0.1 });
s.addText("El diseño no cambia", { x: 8.6, y: 2.05, w: 3.9, h: 0.4, fontFace: TIT, fontSize: 18, bold: true, color: AMBER });
s.addText("Ante ±30 % en los costos, la configuración óptima se mantiene", {
  x: 8.6, y: 2.5, w: 3.9, h: 0.95, fontFace: BODY, fontSize: 13.5, color: NAVY });
s.addShape(pres.ShapeType.roundRect, { x: 8.4, y: 3.8, w: 4.3, h: 1.8,
  fill: { color: WHITE }, line: { color: "E2E7F0", width: 1 }, rectRadius: 0.1 });
s.addText("El retiro sí manda", { x: 8.6, y: 3.95, w: 3.9, h: 0.4, fontFace: TIT, fontSize: 18, bold: true, color: NAVY });
s.addText("+30 % en el tiempo de retiro mueve el óptimo de 30 a 50 compartimentos chicos",
  { x: 8.6, y: 4.4, w: 3.9, h: 1.05, fontFace: BODY, fontSize: 13.5, color: NAVY });
s.addNotes("05:30-06:15 — La incertidumbre económica es inocua: el diseño aguanta. La de comportamiento no: el tiempo de retiro escala la capacidad necesaria. Por eso es el factor a monitorear en una implementación real.");

// ============================================================ 9 CONCLUSIONES
s = pres.addSlide(); s.background = { color: NAVY };
s.addText("Conclusiones", { x: 0.8, y: 0.5, w: W - 1.6, h: 0.8,
  fontFace: TIT, fontSize: 34, bold: true, color: WHITE });
const conc = [
  ["Existe un óptimo", "La curva de costo tiene mínimo interior: ni máxima capacidad ni mínima inversión."],
  ["La estacionalidad decide el diseño", "Cyber exige más capacidad que Navidad: hay que elegir entre dimensionar para el pico o para el promedio."],
  ["Robusto a los costos", "El diseño óptimo no cambia ante variaciones de ±30 % en los parámetros económicos."],
  ["El comportamiento es la palanca fina", "El tiempo de retiro escala la capacidad requerida: es el factor a monitorear en la operación."],
];
conc.forEach((c, i) => {
  const y = 1.6 + i * 1.28;
  s.addShape(pres.ShapeType.ellipse, { x: 0.85, y: y + 0.1, w: 0.42, h: 0.42, fill: { color: AMBER } });
  s.addText(c[0], { x: 1.5, y: y, w: 11.0, h: 0.45, fontFace: TIT, fontSize: 20, bold: true, color: AMBER, margin: 0 });
  s.addText(c[1], { x: 1.5, y: y + 0.45, w: 11.0, h: 0.6, fontFace: BODY, fontSize: 14.5, color: WHITE, margin: 0 });
});
s.addNotes("06:15-07:00 — Cerrar con las cuatro conclusiones. La cuarta es la honesta: sabemos cuál es el límite del trabajo y por qué. Agradecer y abrir a preguntas.");

pres.writeFile({ fileName: "SLIDES_TP12.pptx" }).then(f => console.log("OK ->", f));
