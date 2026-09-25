// App 3 · Prompt 3/6 — ViewportRegistry.
//
// Los 8 viewports de referencia pedidos por el enunciado (Fase 2).
//
// AVISO IMPORTANTE (léase antes de usar este registro en cualquier
// informe): estos viewports SIMULAN dimensiones de pantalla dentro de
// un navegador Chromium de escritorio — no certifican el renderizado
// físico real de Android, iOS, Windows, macOS o Linux. Una fuente
// distinta, un motor de scroll distinto, gestos táctiles reales o el
// compositor gráfico nativo de cada sistema operativo pueden producir
// un resultado visual distinto al de esta simulación. Este registro no
// sustituye una validación física en un dispositivo o máquina virtual
// reales — ver docs/APP-3-LIMITACIONES-SIMULACION-DISPOSITIVOS.md.

export const CP04_VIEWPORT_REGISTRY = Object.freeze({
  "android-mobile": Object.freeze({
    folderName: "android-mobile",
    device: "Android móvil",
    system: "Android",
    orientation: "vertical",
    width: 412,
    height: 915,
    deviceScaleFactor: 2.6,
  }),
  "ios-mobile": Object.freeze({
    folderName: "ios-mobile",
    device: "iPhone",
    system: "iOS",
    orientation: "vertical",
    width: 390,
    height: 844,
    deviceScaleFactor: 3,
  }),
  "android-tablet": Object.freeze({
    folderName: "android-tablet",
    device: "Tablet Android",
    system: "Android",
    orientation: "horizontal",
    width: 1194,
    height: 834,
    deviceScaleFactor: 2,
  }),
  ipad: Object.freeze({
    folderName: "ipad",
    device: "iPad",
    system: "iPadOS",
    orientation: "horizontal",
    width: 1194,
    height: 834,
    deviceScaleFactor: 2,
  }),
  windows: Object.freeze({
    folderName: "windows",
    device: "Escritorio Windows",
    system: "Windows",
    orientation: "horizontal",
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  }),
  macos: Object.freeze({
    folderName: "macos",
    device: "Escritorio macOS",
    system: "macOS",
    orientation: "horizontal",
    width: 1440,
    height: 900,
    deviceScaleFactor: 2,
  }),
  linux: Object.freeze({
    folderName: "linux",
    device: "Escritorio Linux",
    system: "Linux",
    orientation: "horizontal",
    width: 1920,
    height: 1080,
    deviceScaleFactor: 1,
  }),
  "web-pwa": Object.freeze({
    folderName: "web-pwa",
    device: "Web / PWA",
    system: "Web/PWA",
    orientation: "responsive",
    width: 1024,
    height: 768,
    deviceScaleFactor: 1,
  }),
});

export const CP04_VIEWPORT_IDS = Object.freeze(Object.keys(CP04_VIEWPORT_REGISTRY));

export function cp04GetViewport(viewportId) {
  return CP04_VIEWPORT_REGISTRY[viewportId] || null;
}

export function cp04ListViewportIds() {
  return [...CP04_VIEWPORT_IDS];
}
