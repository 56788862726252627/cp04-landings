// App 3 · Prompt 2/6 — Especificaciones de mockup (8 combinaciones
// dispositivo × sistema × orientación pedidas por el enunciado).
//
// Cada especificación separa dos estados honestos:
//  - `placeholderStatus`: el marco SVG/HTML que SÍ se genera hoy (real,
//    mismo motor que PreviewGenerator del Prompt 1/6).
//  - `captureStatus`: la captura de pantalla REAL del dispositivo, que
//    requeriría un motor de renderizado (navegador headless o similar)
//    todavía no conectado — siempre `not_implemented` en este prompt,
//    con `futureCapturePath` ya reservado para cuando exista.

export const CP04_MOCKUP_SPEC_LIST = Object.freeze([
  Object.freeze({
    normalizedName: "movil-android-vertical",
    device: "Móvil Android",
    system: "Android",
    orientation: "vertical",
    screenSizeInches: 6.1,
    resolution: Object.freeze({ width: 412, height: 915 }),
    futureCapturePath: "mockups/capturas/movil-android-vertical.png",
    metadata: Object.freeze({ densityDpi: 420, notes: "Referencia tipo Pixel, densidad xxhdpi" }),
  }),
  Object.freeze({
    normalizedName: "movil-ios-vertical",
    device: "Móvil iOS",
    system: "iOS",
    orientation: "vertical",
    screenSizeInches: 6.1,
    resolution: Object.freeze({ width: 390, height: 844 }),
    futureCapturePath: "mockups/capturas/movil-ios-vertical.png",
    metadata: Object.freeze({ densityDpi: 460, notes: "Referencia tipo iPhone estándar" }),
  }),
  Object.freeze({
    normalizedName: "tablet-android-horizontal",
    device: "Tablet Android",
    system: "Android",
    orientation: "horizontal",
    screenSizeInches: 10.9,
    resolution: Object.freeze({ width: 1194, height: 834 }),
    futureCapturePath: "mockups/capturas/tablet-android-horizontal.png",
    metadata: Object.freeze({ densityDpi: 275, notes: "Rotación horizontal del tamaño tablet de referencia" }),
  }),
  Object.freeze({
    normalizedName: "ipad-horizontal",
    device: "iPad",
    system: "iPadOS",
    orientation: "horizontal",
    screenSizeInches: 10.9,
    resolution: Object.freeze({ width: 1194, height: 834 }),
    futureCapturePath: "mockups/capturas/ipad-horizontal.png",
    metadata: Object.freeze({ densityDpi: 264, notes: "Referencia tipo iPad de 11 pulgadas" }),
  }),
  Object.freeze({
    normalizedName: "escritorio-windows",
    device: "Escritorio Windows",
    system: "Windows",
    orientation: "horizontal",
    screenSizeInches: 24,
    resolution: Object.freeze({ width: 1920, height: 1080 }),
    futureCapturePath: "mockups/capturas/escritorio-windows.png",
    metadata: Object.freeze({ densityDpi: 96, notes: "Referencia 1080p estándar de escritorio" }),
  }),
  Object.freeze({
    normalizedName: "escritorio-macos",
    device: "Escritorio macOS",
    system: "macOS",
    orientation: "horizontal",
    screenSizeInches: 13.6,
    resolution: Object.freeze({ width: 1440, height: 900 }),
    futureCapturePath: "mockups/capturas/escritorio-macos.png",
    metadata: Object.freeze({ densityDpi: 110, notes: "Referencia tipo MacBook Air" }),
  }),
  Object.freeze({
    normalizedName: "escritorio-linux",
    device: "Escritorio Linux",
    system: "Linux",
    orientation: "horizontal",
    screenSizeInches: 24,
    resolution: Object.freeze({ width: 1920, height: 1080 }),
    futureCapturePath: "mockups/capturas/escritorio-linux.png",
    metadata: Object.freeze({ densityDpi: 96, notes: "Referencia 1080p, entorno de escritorio genérico (GNOME/KDE)" }),
  }),
  Object.freeze({
    normalizedName: "web-pwa-responsive",
    device: "Web / PWA responsive",
    system: "Web/PWA",
    orientation: "adaptable",
    screenSizeInches: null,
    resolution: Object.freeze({ width: 1024, height: 768 }),
    futureCapturePath: "mockups/capturas/web-pwa-responsive.png",
    metadata: Object.freeze({ densityDpi: null, notes: "Referencia intermedia; se adapta de 360px a 1920px de ancho, sin una resolución fija" }),
  }),
]);

export function cp04GetMockupSpec(normalizedName) {
  return CP04_MOCKUP_SPEC_LIST.find((spec) => spec.normalizedName === normalizedName) || null;
}

/** Añade el estado honesto (placeholder real hoy, captura pendiente) a cada especificación — separado de los datos estáticos para que estos últimos sean puramente descriptivos. */
export function cp04ListMockupSpecsWithStatus() {
  return CP04_MOCKUP_SPEC_LIST.map((spec) => ({
    ...spec,
    placeholderStatus: "completed",
    captureStatus: "not_implemented",
    captureStatusReason: "requiere un motor de renderizado real (navegador headless o equivalente), no conectado en este prompt",
  }));
}
