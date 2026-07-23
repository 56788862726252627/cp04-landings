import { test } from "node:test";
import assert from "node:assert/strict";

import { renderDevicePreviewHtml, buildAllDevicePreviews, PREVIEW_VIEWS, PREVIEW_DEVICES, DEVICE_COMPATIBILITY_NOTES } from "./devicePreview.js";
import { buildCommercialPanel } from "./commercialPanel.js";
import { buildCommercialProposal } from "./proposalGenerator.js";
import { buildCommercialAssessment } from "./commercialAssessment.js";
import { computeRoiScenarios } from "./roiEngine.js";
import { buildImplementationRoadmap } from "./implementationRoadmap.js";

function buildContext() {
  const panel = buildCommercialPanel({ profileId: "hotel", business: { name: "Hotel Demo" }, auditScores: { seo: { score: 50 } }, risks: [{ title: "Sin HTTPS", severity: "high" }] });
  const assessment = buildCommercialAssessment({ profileId: "hotel", business: { name: "Hotel Demo" } });
  const roi = computeRoiScenarios({}, { profileId: "hotel" });
  const roadmap = buildImplementationRoadmap({ profileId: "hotel", integrationsReadiness: panel.integrationsReadiness });
  const proposal = buildCommercialProposal({ assessment, roi, roadmap, integrationsReadiness: panel.integrationsReadiness });
  return { panel, proposal };
}

test("PREVIEW_VIEWS cubre las 7 vistas pedidas por el enunciado", () => {
  assert.deepEqual([...PREVIEW_VIEWS], ["diagnostic", "roi", "proposal", "integrations", "roadmap", "clientView", "agencyView"]);
});

test("PREVIEW_DEVICES cubre móvil/tablet/desktop", () => {
  assert.deepEqual([...PREVIEW_DEVICES], ["mobile", "tablet", "desktop"]);
});

test("renderDevicePreviewHtml produce HTML válido autocontenido para cada vista y dispositivo (21 combinaciones)", () => {
  const context = buildContext();
  for (const view of PREVIEW_VIEWS) {
    for (const device of PREVIEW_DEVICES) {
      const html = renderDevicePreviewHtml(view, device, context);
      assert.match(html, /<!doctype html>/i);
      assert.match(html, /device-frame/);
      assert.match(html, new RegExp(device === "mobile" ? "390px" : device === "tablet" ? "834px" : "1280px"));
    }
  }
});

test("renderDevicePreviewHtml rechaza una vista o dispositivo desconocido", () => {
  const context = buildContext();
  assert.throws(() => renderDevicePreviewHtml("vista-inexistente", "mobile", context));
  assert.throws(() => renderDevicePreviewHtml("diagnostic", "smartwatch", context));
});

test("buildAllDevicePreviews genera las 7×3 = 21 combinaciones indexadas por [view][device]", () => {
  const previews = buildAllDevicePreviews(buildContext());
  let count = 0;
  for (const view of PREVIEW_VIEWS) {
    for (const device of PREVIEW_DEVICES) {
      assert.ok(previews[view][device]);
      count++;
    }
  }
  assert.equal(count, 21);
});

test("la vista de cliente NUNCA incluye información pendiente/bloqueos internos; la vista de agencia SÍ los incluye si existen", () => {
  const context = buildContext();
  const clientHtml = renderDevicePreviewHtml("clientView", "desktop", context);
  const agencyHtml = renderDevicePreviewHtml("agencyView", "desktop", context);
  assert.doesNotMatch(clientHtml, /Información pendiente/);
  if (context.proposal.pendingInformation.length > 0) assert.match(agencyHtml, /Información pendiente/);
});

test("cada preview es determinista", () => {
  const context = buildContext();
  assert.equal(renderDevicePreviewHtml("roi", "tablet", context), renderDevicePreviewHtml("roi", "tablet", context));
});

test("no se referencian imágenes externas ni marcas de terceros en ningún preview", () => {
  const previews = buildAllDevicePreviews(buildContext());
  const allHtml = Object.values(previews).flatMap((byDevice) => Object.values(byDevice)).join("\n");
  assert.doesNotMatch(allHtml, /<img\s/i);
  assert.doesNotMatch(allHtml, /stripe\.com\/logo|whatsapp\.com\/logo|facebook\.com\/logo/i);
});

test("DEVICE_COMPATIBILITY_NOTES declara compatibilidad Android/iOS/desktop/PWA sin afirmar una PWA instalable", () => {
  assert.match(DEVICE_COMPATIBILITY_NOTES.android, /Android/);
  assert.match(DEVICE_COMPATIBILITY_NOTES.ios, /iOS/);
  assert.match(DEVICE_COMPATIBILITY_NOTES.desktopBrowsers, /navegador/i);
  assert.match(DEVICE_COMPATIBILITY_NOTES.pwa, /NO añade manifest/i);
});

test("proposal ausente en la vista 'proposal' no lanza: mensaje explícito de 'sin propuesta'", () => {
  const panel = buildCommercialPanel({ profileId: "generic" });
  const html = renderDevicePreviewHtml("proposal", "mobile", { panel });
  assert.match(html, /Sin propuesta generada/);
});
