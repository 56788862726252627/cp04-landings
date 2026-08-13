import { test } from "node:test";
import assert from "node:assert/strict";

import { buildCommercialPanel, renderCommercialPanelHtml } from "./commercialPanel.js";

function fullPanelInput(overrides = {}) {
  return {
    profileId: "club-deportivo",
    business: { name: "Club Pádel Demo", sector: "padel-sports" },
    auditScores: { seo: { score: 55, coverage: 0.8 }, accessibility: { score: 40, coverage: 0.6 }, technicalQuality: { score: 60, coverage: 0.7 } },
    risks: [{ title: "Sin HTTPS", severity: "high" }],
    opportunities: [{ title: "Activar recordatorios automáticos" }],
    recommendations: [{ title: "Migrar a HTTPS" }],
    roiInputs: { averageTicket: 35, monthlyBookings: 250 },
    ...overrides,
  };
}

test("buildCommercialPanel combina assessment/roi/integraciones/roadmap en una sola estructura", () => {
  const panel = buildCommercialPanel(fullPanelInput());
  assert.equal(panel.executiveSummary.businessName, "Club Pádel Demo");
  assert.ok(panel.assessment);
  assert.ok(panel.roi);
  assert.ok(panel.integrationsReadiness);
  assert.ok(panel.roadmap);
  assert.ok(panel.sandboxReadiness);
});

test("executiveSummary limita top riesgos/oportunidades/recomendaciones a como mucho 3/3/5", () => {
  const panel = buildCommercialPanel(fullPanelInput({
    risks: Array.from({ length: 5 }, (_, i) => ({ title: `Riesgo ${i}`, severity: "medium" })),
    opportunities: Array.from({ length: 5 }, (_, i) => ({ title: `Oportunidad ${i}` })),
    recommendations: Array.from({ length: 8 }, (_, i) => ({ title: `Recomendación ${i}` })),
  }));
  assert.equal(panel.executiveSummary.topRisks.length, 3);
  assert.equal(panel.executiveSummary.topOpportunities.length, 3);
  assert.equal(panel.executiveSummary.priorityRecommendations.length, 5);
});

test("nextStepChecklist recoge exactamente las integraciones bloqueadas", () => {
  const panel = buildCommercialPanel(fullPanelInput());
  const blockedIds = Object.values(panel.integrationsReadiness.integrations).filter((i) => i.blockedBy).length;
  assert.equal(panel.nextStepChecklist.length, blockedIds);
});

test("admite los 10 perfiles sectoriales + genérico sin lanzar", () => {
  const profiles = ["club-deportivo", "clinica", "dentista", "veterinario", "abogado", "restaurante", "hotel", "inmobiliaria", "peluqueria", "centro-estetica", "generic", null];
  for (const profileId of profiles) {
    const panel = buildCommercialPanel(fullPanelInput({ profileId }));
    assert.ok(panel.roadmap.profileId);
  }
});

test("es determinista: mismo input -> mismo panel", () => {
  const input = fullPanelInput();
  assert.deepEqual(buildCommercialPanel(input), buildCommercialPanel(input));
});

test("nunca presenta el panel como certificación/garantía: el disclaimer general lo aclara", () => {
  const panel = buildCommercialPanel(fullPanelInput());
  assert.match(panel.disclaimer, /ninguna cifra.*garantizad|no es un resultado garantizado/i);
});

test("renderCommercialPanelHtml produce HTML autocontenido con las secciones pedidas", () => {
  const panel = buildCommercialPanel(fullPanelInput());
  const html = renderCommercialPanelHtml(panel);
  assert.match(html, /Puntuaciones por categoría/);
  assert.match(html, /Principales riesgos/);
  assert.match(html, /Oportunidades/);
  assert.match(html, /Recomendaciones prioritarias/);
  assert.match(html, /ROI/);
  assert.match(html, /Estado de integraciones/);
  assert.match(html, /Roadmap de implantación/);
});

test("renderCommercialPanelHtml no lanza sin scores/riesgos/oportunidades/recomendaciones (panel vacío)", () => {
  const panel = buildCommercialPanel({ profileId: "generic" });
  const html = renderCommercialPanelHtml(panel);
  assert.match(html, /Negocio sin nombre/);
  assert.match(html, /Sin riesgos registrados/);
});
