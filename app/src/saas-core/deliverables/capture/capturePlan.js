// App 3 · Prompt 3/6 — CapturePlan (Fase 3).
//
// Qué se captura para el proyecto demo. Alcance deliberado de este
// prompt: las 8 capturas de dispositivo (núcleo de la Fase 2/6, cada
// una renderiza el índice del paquete de entregables ya generado en el
// Prompt 2 — la "página principal / índice demo" pedida) + 1 captura
// de la galería de mockups. No se capturan individualmente propuesta/
// contrato/informe/documentación técnica: son Markdown/HTML de texto
// plano ya reales desde el Prompt 2, y renderizarlos crudos en un
// navegador no aporta valor visual adicional — decisión de alcance
// documentada, no una omisión accidental (ver
// docs/APP-3-LIMITACIONES-SIMULACION-DISPOSITIVOS.md).
//
// Como valor añadido explícitamente invitado por el enunciado ("si la
// aplicación demo dispone de varias pantallas navegables"), se añaden
// 3 capturas REALES de Club Pádel 04 (la app que ya corre en
// localhost:5175) — sin modificar su código, solo visitándola.

import path from "node:path";
import { pathToFileURL } from "node:url";
import { CP04_VIEWPORT_REGISTRY, CP04_VIEWPORT_IDS } from "./viewportRegistry.js";

/**
 * @param {{baseDir:string}} options - directorio del paquete de entregables ya generado (Prompt 2/6).
 */
export function cp04BuildDeviceCapturePlan({ baseDir }) {
  const indexUrl = pathToFileURL(path.join(baseDir, "index.html")).href;
  return CP04_VIEWPORT_IDS.map((viewportId) => {
    const viewport = CP04_VIEWPORT_REGISTRY[viewportId];
    return {
      kind: "device",
      viewportId,
      viewport,
      url: indexUrl,
      name: `${viewportId}-index`,
      folder: path.join("mockups", viewport.folderName),
    };
  });
}

export function cp04BuildGalleryCapturePlan({ baseDir }) {
  const galleryUrl = pathToFileURL(path.join(baseDir, "mockups", "galeria.html")).href;
  return [
    {
      kind: "gallery",
      viewportId: "web-pwa",
      viewport: CP04_VIEWPORT_REGISTRY["web-pwa"],
      url: galleryUrl,
      name: "gallery-overview",
      folder: path.join("mockups", "gallery"),
    },
  ];
}

const CP04_APP_SCREENS = Object.freeze([
  { name: "club-padel-04-login", route: null, role: null, label: "Login" },
  { name: "club-padel-04-inicio", route: "inicio", role: "ADMIN", label: "Inicio (ADMIN)" },
  { name: "club-padel-04-perfil", route: "perfil", role: "ADMIN", label: "Perfil (ADMIN)" },
]);

/**
 * Capturas de la app real Club Pádel 04 (localhost:5175, ya en marcha —
 * nunca se lanza un servidor nuevo). `injectRole` es una función que
 * debe dejar el localStorage listo con el rol antes de navegar (ver
 * captureOrchestrator.js) — este módulo solo describe el plan, no
 * ejecuta ningún navegador.
 */
export function cp04BuildClubPadel04CapturePlan({ appUrl = "http://localhost:5175" } = {}) {
  const viewport = CP04_VIEWPORT_REGISTRY.macos;
  return CP04_APP_SCREENS.map((screen) => ({
    kind: "club-padel-04",
    viewportId: "macos",
    viewport,
    url: appUrl,
    role: screen.role,
    name: screen.name,
    label: screen.label,
    folder: path.join("mockups", "club-padel-04-screens"),
  }));
}

export function cp04BuildFullCapturePlan({ baseDir, appUrl }) {
  return [
    ...cp04BuildDeviceCapturePlan({ baseDir }),
    ...cp04BuildGalleryCapturePlan({ baseDir }),
    ...cp04BuildClubPadel04CapturePlan({ appUrl }),
  ];
}
