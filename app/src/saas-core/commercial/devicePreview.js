// Paso 20 · Fase 6 — Mockups y multidispositivo.
//
// Genera previews HTML/CSS AUTOCONTENIDOS (sin dependencias externas,
// sin capturas de pantalla, sin Playwright/navegador automatizado) para
// las 7 vistas pedidas por el enunciado, en 3 anchos de dispositivo
// (móvil/tablet/desktop) simulados con CSS puro (media queries +
// contenedor de ancho fijo) — el mismo enfoque que cualquier diseño
// "mobile-first" real, sin necesitar herramientas pesadas.
//
// Compatibilidad prevista (declarada, no verificada con dispositivos
// físicos en esta sesión): HTML5/CSS3 estándar, funciona en cualquier
// motor de renderizado moderno (WebKit/Blink/Gecko) — por tanto
// compatible con Android (Chrome/WebView), iOS (Safari), navegadores de
// escritorio, y apto como base de una PWA (sin Service Worker en este
// paso; ver limitaciones en la documentación).

import { renderDiagnosticSectionHtml, renderRoiSectionHtml, renderIntegrationsSectionHtml, renderRoadmapSectionHtml } from "./commercialPanel.js";
import { renderProposalHtml } from "./proposalGenerator.js";

export const PREVIEW_VIEWS = Object.freeze(["diagnostic", "roi", "proposal", "integrations", "roadmap", "clientView", "agencyView"]);
export const PREVIEW_DEVICES = Object.freeze(["mobile", "tablet", "desktop"]);

const DEVICE_WIDTHS = Object.freeze({ mobile: "390px", tablet: "834px", desktop: "1280px" });
const DEVICE_LABELS = Object.freeze({ mobile: "Móvil (Android/iOS)", tablet: "Tablet (Android/iPadOS)", desktop: "Escritorio (navegador)" });

// CSS compartido por todas las vistas — sin ninguna imagen ni marca de
// terceros, solo color/tipografía/espaciado genéricos.
const SHARED_CSS = `
  :root { --fg: #1a1a2e; --bg: #ffffff; --accent: #2b6cb0; --muted: #6b7280; --border: #e5e7eb; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, -apple-system, sans-serif; color: var(--fg); background: var(--bg); }
  .device-frame { margin: 24px auto; border: 1px solid var(--border); border-radius: 12px; overflow: hidden; }
  .device-frame .device-label { background: var(--muted); color: white; font-size: 12px; padding: 6px 12px; }
  .device-frame .device-viewport { padding: 16px; overflow-x: auto; }
  h1 { font-size: 1.3rem; }
  h2 { font-size: 1.05rem; color: var(--accent); border-bottom: 1px solid var(--border); padding-bottom: 4px; }
  table { width: 100%; border-collapse: collapse; margin: 8px 0; }
  th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--border); font-size: 0.85rem; }
  .disclaimer { font-size: 0.75rem; color: var(--muted); font-style: italic; }
  .status { padding: 2px 6px; border-radius: 4px; font-size: 0.75rem; }
  @media (max-width: 480px) { table, thead, tbody, th, td, tr { display: block; } th { display: none; } td { padding: 4px 8px; } }
`;

function deviceFrame(device, innerHtml) {
  return `<div class="device-frame" style="max-width: ${DEVICE_WIDTHS[device]};">
  <div class="device-label">${DEVICE_LABELS[device]} · ancho simulado ${DEVICE_WIDTHS[device]}</div>
  <div class="device-viewport">${innerHtml}</div>
</div>`;
}

function pageShell(title, bodyHtml) {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${title}</title><style>${SHARED_CSS}</style></head><body>${bodyHtml}</body></html>`;
}

function viewInnerHtml(view, { panel, proposal }) {
  switch (view) {
    case "diagnostic":
      return renderDiagnosticSectionHtml(panel);
    case "roi":
      return renderRoiSectionHtml(panel);
    case "proposal":
      return proposal ? renderProposalHtml(proposal) : "<p>Sin propuesta generada todavía.</p>";
    case "integrations":
      return renderIntegrationsSectionHtml(panel);
    case "roadmap":
      return renderRoadmapSectionHtml(panel);
    case "clientView":
      // Vista de cliente: resumen + ROI + próximos pasos — SIN bloqueos internos ni información pendiente/sensible.
      return `${renderDiagnosticSectionHtml(panel)}${renderRoiSectionHtml(panel)}${proposal ? `<article class="panel-block"><h2>Próximos pasos</h2><ul>${proposal.nextSteps.map((s) => `<li>${s}</li>`).join("")}</ul></article>` : ""}`;
    case "agencyView":
      // Vista interna de agencia: todo, incluidos bloqueos e información pendiente.
      return `${renderDiagnosticSectionHtml(panel)}${renderRoiSectionHtml(panel)}${renderIntegrationsSectionHtml(panel)}${renderRoadmapSectionHtml(panel)}${proposal && proposal.pendingInformation.length > 0 ? `<article class="panel-block"><h2>Información pendiente (solo agencia)</h2><ul>${proposal.pendingInformation.map((p) => `<li>${p}</li>`).join("")}</ul></article>` : ""}`;
    default:
      throw new Error(`viewInnerHtml: vista desconocida "${view}"`);
  }
}

const VIEW_TITLES = Object.freeze({ diagnostic: "Panel de diagnóstico", roi: "Panel ROI", proposal: "Propuesta comercial", integrations: "Estado de integraciones", roadmap: "Roadmap de implantación", clientView: "Vista de cliente", agencyView: "Vista interna de agencia" });

/**
 * @param {"diagnostic"|"roi"|"proposal"|"integrations"|"roadmap"|"clientView"|"agencyView"} view
 * @param {"mobile"|"tablet"|"desktop"} device
 * @param {{panel: object, proposal?: object}} context
 */
export function renderDevicePreviewHtml(view, device, context) {
  if (!PREVIEW_VIEWS.includes(view)) throw new Error(`renderDevicePreviewHtml: vista desconocida "${view}". Usa una de: ${PREVIEW_VIEWS.join(", ")}`);
  if (!PREVIEW_DEVICES.includes(device)) throw new Error(`renderDevicePreviewHtml: dispositivo desconocido "${device}". Usa uno de: ${PREVIEW_DEVICES.join(", ")}`);
  const inner = viewInnerHtml(view, context);
  return pageShell(`${VIEW_TITLES[view]} — ${DEVICE_LABELS[device]}`, deviceFrame(device, inner));
}

/**
 * Genera las 7 vistas × 3 dispositivos = 21 previews, indexadas por
 * `[view][device]`.
 */
export function buildAllDevicePreviews(context) {
  const previews = {};
  for (const view of PREVIEW_VIEWS) {
    previews[view] = {};
    for (const device of PREVIEW_DEVICES) previews[view][device] = renderDevicePreviewHtml(view, device, context);
  }
  return previews;
}

export const DEVICE_COMPATIBILITY_NOTES = Object.freeze({
  android: "HTML5/CSS3 estándar — compatible con Chrome/WebView en Android sin JavaScript adicional.",
  ios: "HTML5/CSS3 estándar — compatible con Safari/WebView en iOS sin JavaScript adicional.",
  desktopBrowsers: "Compatible con cualquier navegador moderno (Chrome/Firefox/Safari/Edge) sin polyfills.",
  pwa: "Base apta para una PWA (HTML/CSS responsive) — este paso NO añade manifest.json ni Service Worker: queda como trabajo futuro explícito, no se afirma que exista una PWA ya instalable.",
});
