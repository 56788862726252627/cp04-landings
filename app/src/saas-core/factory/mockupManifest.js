// Paso 10 · Fase 8 — Infraestructura de mockups responsive.
//
// Genera un manifest determinista de vistas demostrativas (nombres
// estables, viewport por breakpoint) para un negocio. No captura pantallas
// aquí: eso lo hace `factory-cli/lib/captureMockups.mjs` (Fase 8, script
// preparado) SOLO si Playwright está disponible en el entorno — no se
// añade la dependencia en este paso.

export const VIEWPORT_PRESETS = Object.freeze({
  mobile: Object.freeze({ id: "mobile", label: "Móvil", width: 375, height: 812, deviceScaleFactor: 3 }),
  tablet: Object.freeze({ id: "tablet", label: "Tablet", width: 834, height: 1194, deviceScaleFactor: 2 }),
  laptop: Object.freeze({ id: "laptop", label: "Portátil", width: 1366, height: 768, deviceScaleFactor: 1 }),
  desktop: Object.freeze({ id: "desktop", label: "Escritorio", width: 1920, height: 1080, deviceScaleFactor: 1 }),
});

export const DEMO_ROUTES = Object.freeze([
  { id: "landing", label: "Landing pública", route: "/", requiresAuth: false },
  { id: "login", label: "Login demo", route: "/login", requiresAuth: false },
  { id: "inicio", label: "Panel de inicio", route: "/app/inicio", requiresAuth: true },
  { id: "citas", label: "Agenda/citas", route: "/app/citas", requiresAuth: true },
]);

// Compatibilidad prevista (documental): dónde correría cada vista, sin
// implicar que ya se ha probado en cada plataforma.
export const PLATFORM_COMPATIBILITY_NOTES = Object.freeze([
  { platform: "Android", vehicle: "PWA instalada / Chrome", status: "planned" },
  { platform: "iOS", vehicle: "PWA instalada / Safari", status: "planned" },
  { platform: "iPadOS", vehicle: "PWA instalada / Safari", status: "planned" },
  { platform: "Windows", vehicle: "PWA instalada / Edge-Chrome", status: "planned" },
  { platform: "macOS", vehicle: "PWA instalada / Safari-Chrome", status: "planned" },
  { platform: "Linux", vehicle: "Navegador (Chrome/Firefox), PWA si el navegador lo soporta", status: "planned" },
]);

function stableMockupName({ businessId, routeId, viewportId }) {
  return `${businessId}__${routeId}__${viewportId}`;
}

/**
 * Construye el manifest de mockups (nombres estables, sin capturar nada).
 * Determinista: mismo businessId + mismas rutas/viewports -> mismo manifest.
 * @param {{businessId: string, routes?: object[], viewports?: string[]}} params
 */
export function buildMockupManifest({ businessId, routes = DEMO_ROUTES, viewports = Object.keys(VIEWPORT_PRESETS) }) {
  const entries = [];
  for (const route of routes) {
    for (const viewportId of viewports) {
      const viewport = VIEWPORT_PRESETS[viewportId];
      if (!viewport) continue;
      entries.push({
        name: stableMockupName({ businessId, routeId: route.id, viewportId }),
        businessId,
        route: route.route,
        routeLabel: route.label,
        requiresAuth: route.requiresAuth,
        viewport,
        captured: false,
        capturedAt: null,
        outputPathHint: `mockups/${stableMockupName({ businessId, routeId: route.id, viewportId })}.png`,
      });
    }
  }
  return {
    businessId,
    generatedAt: null,
    tool: "playwright (opcional, no incluido como dependencia en este paso)",
    entries,
    compatibilityNotes: PLATFORM_COMPATIBILITY_NOTES,
  };
}
