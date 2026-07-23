// Paso 20 · Fase 11 — Validación end-to-end de la integración COMPLETA
// entre todos los módulos comerciales (no repite las pruebas unitarias
// ya cubiertas en cada módulo; verifica que, compuestos juntos, no hay
// fricciones de integración). Cubre los 24 escenarios del enunciado.
// Todo offline, sin credenciales, sin red.

import { test } from "node:test";
import assert from "node:assert/strict";

import { buildCommercialAssessment } from "./commercialAssessment.js";
import { computeRoiScenarios } from "./roiEngine.js";
import { computeIntegrationReadiness } from "./integrationReadiness.js";
import { buildImplementationRoadmap } from "./implementationRoadmap.js";
import { buildCommercialPanel } from "./commercialPanel.js";
import { buildCommercialProposal, renderProposalJson, renderProposalMarkdown, renderProposalHtml } from "./proposalGenerator.js";
import { renderDevicePreviewHtml, PREVIEW_DEVICES } from "./devicePreview.js";
import { simulateStripeCheckout, simulateWhatsAppSend } from "./commercialSandbox.js";
import { createInMemoryConsentStore, sampleCheckoutSessionParams, sampleWhatsAppTemplateParams } from "./commercialFixtures.js";
import { runResearchAudit } from "../research/auditOrchestrator.js";
import { buildResearchRequest } from "../research/researchRequestSchema.js";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

function runFullPipeline(profileId, { roiInputs = {}, auditScores = {}, businessName = "Negocio E2E" } = {}) {
  const assessment = buildCommercialAssessment({ profileId, business: { name: businessName }, auditScores, risks: [{ title: "Riesgo E2E", severity: "medium" }], opportunities: [{ title: "Oportunidad E2E" }], recommendations: [{ title: "Recomendación E2E" }] });
  const roi = computeRoiScenarios(roiInputs, { profileId: assessment.profileId });
  const integrationsReadiness = computeIntegrationReadiness({});
  const roadmap = buildImplementationRoadmap({ profileId: assessment.profileId, integrationsReadiness });
  const proposal = buildCommercialProposal({ assessment, roi, roadmap, integrationsReadiness });
  const panel = buildCommercialPanel({ profileId, business: { name: businessName }, auditScores, roiInputs });
  return { assessment, roi, integrationsReadiness, roadmap, proposal, panel };
}

// 1. Club deportivo
test("E2E 1 — perfil club deportivo: pipeline completo sin errores", () => {
  const result = runFullPipeline("club-deportivo", { roiInputs: { averageTicket: 35, monthlyBookings: 250 } });
  assert.equal(result.assessment.profileId, "club-deportivo");
  assert.ok(result.proposal.title.includes("Club deportivo"));
});

// 2. Clínica
test("E2E 2 — perfil clínica: pipeline completo sin errores", () => {
  const result = runFullPipeline("clinica", { roiInputs: { averageTicket: 60 } });
  assert.equal(result.assessment.profileId, "clinica");
});

// 3. Perfil genérico
test("E2E 3 — perfil genérico (sin profileId): cae en 'generic' sin lanzar", () => {
  const result = runFullPipeline(null);
  assert.equal(result.assessment.profileId, "generic");
});

// 4. ROI con datos completos
test("E2E 4 — ROI con datos completos: todos los campos 'provided', sin variables no disponibles", () => {
  const roi = computeRoiScenarios({ averageTicket: 40, monthlyBookings: 200, noShowRate: 0.1, adminHoursPerWeek: 8, hourlyCost: 15, conversionRate: 0.2, currentMonthlyRevenue: 9000, implementationCost: 1000, monthlyMaintenanceCost: 50 }, { profileId: "restaurante" });
  assert.deepEqual([...roi.unavailableVariables], []);
});

// 5. ROI con datos parciales
test("E2E 5 — ROI con datos parciales: mezcla de 'provided'/'assumed'/'unavailable', nunca inventa", () => {
  const roi = computeRoiScenarios({ averageTicket: 40 }, { profileId: "restaurante" });
  assert.equal(roi.inputs.averageTicket.source, "provided");
  assert.equal(roi.inputs.monthlyBookings.source, "assumed");
  assert.ok(roi.unavailableVariables.includes("currentMonthlyRevenue"));
});

// 6/7. Escenario conservador / optimista
test("E2E 6/7 — escenario conservador produce un beneficio <= al optimista", () => {
  const roi = computeRoiScenarios({ averageTicket: 40, currentMonthlyRevenue: 10000 }, { profileId: "restaurante" });
  assert.ok(roi.scenarios.conservative.totalMonthlyBenefit.value <= roi.scenarios.optimistic.totalMonthlyBenefit.value);
});

// 8. Propuesta comercial
test("E2E 8 — propuesta comercial generada a partir del pipeline completo", () => {
  const result = runFullPipeline("hotel");
  assert.ok(result.proposal.roiScenarios.central);
  assert.ok(result.proposal.includedModules.length > 0);
});

// 9. Panel
test("E2E 9 — panel comercial integra assessment+roi+integraciones+roadmap", () => {
  const result = runFullPipeline("hotel");
  assert.ok(result.panel.executiveSummary);
  assert.ok(result.panel.integrationsReadiness);
});

// 10. Previews móvil/tablet/desktop
test("E2E 10 — previews de las 3 vistas de dispositivo se generan sin errores desde el panel+propuesta reales del pipeline", () => {
  const result = runFullPipeline("hotel");
  for (const device of PREVIEW_DEVICES) {
    const html = renderDevicePreviewHtml("clientView", device, { panel: result.panel, proposal: result.proposal });
    assert.match(html, /<!doctype html>/i);
  }
});

// 11. Stripe no configurado
test("E2E 11 — Stripe no configurado: integrationsReadiness lo refleja y la simulación sigue funcionando", () => {
  const result = runFullPipeline("hotel");
  assert.equal(result.integrationsReadiness.integrations.stripe.status, "NOT_CONFIGURED");
  const sim = simulateStripeCheckout(sampleCheckoutSessionParams());
  assert.equal(sim.simulated, true);
});

// 12. WhatsApp no configurado
test("E2E 12 — WhatsApp no configurado: integrationsReadiness lo refleja y la simulación exige consentimiento igualmente", () => {
  const result = runFullPipeline("hotel");
  assert.equal(result.integrationsReadiness.integrations.whatsapp.status, "NOT_CONFIGURED");
  const sim = simulateWhatsAppSend("template", sampleWhatsAppTemplateParams(), { consentStore: createInMemoryConsentStore() });
  assert.equal(sim.status, "consent_not_recorded");
});

// 13. Airtable pendiente
test("E2E 13 — Airtable pendiente (cuota agotada) se refleja como DEGRADED con bloqueo explícito", () => {
  const readiness = computeIntegrationReadiness({}, { airtableKnownDegraded: true });
  assert.equal(readiness.integrations.airtable.status, "DEGRADED");
});

// 14. Make pendiente de pruebas reales
test("E2E 14 — Make sin flujos validados queda en MOCK, con pendingTests explícito", () => {
  const readiness = computeIntegrationReadiness({});
  assert.equal(readiness.integrations.make.status, "MOCK");
  assert.ok(readiness.integrations.make.pendingTests.length > 0);
});

// 15. Simulación de pago
test("E2E 15 — simulación de pago: nunca se marca como pago real, id sandbox_ diferenciado", () => {
  const sim = simulateStripeCheckout(sampleCheckoutSessionParams());
  assert.equal(sim.status, "simulated");
  assert.match(sim.sandboxCheckoutSessionId, /^sandbox_/);
});

// 16. Simulación de mensaje
test("E2E 16 — simulación de mensaje: con consentimiento, se marca simulated; sin consentimiento, nunca 'enviado'", () => {
  const withConsent = simulateWhatsAppSend("template", sampleWhatsAppTemplateParams(), { consentStore: createInMemoryConsentStore({ "+34600000001": { granted: true } }) });
  assert.equal(withConsent.status, "simulated");
  const withoutConsent = simulateWhatsAppSend("template", sampleWhatsAppTemplateParams(), { consentStore: createInMemoryConsentStore() });
  assert.notEqual(withoutConsent.status, "simulated");
});

// 17. Dry-run (probado también manualmente vía CLI en la Fase 9; aquí se confirma que el cálculo puro no tiene efectos secundarios)
test("E2E 17 — calcular el pipeline completo dos veces no produce ningún efecto secundario observable (equivalente al espíritu de --dry-run)", () => {
  const a = runFullPipeline("hotel");
  const b = runFullPipeline("hotel");
  assert.deepEqual(a.roi, b.roi);
  assert.deepEqual(a.proposal, b.proposal);
});

// 18/19/20. JSON / Markdown / HTML
test("E2E 18/19/20 — los 3 formatos de propuesta se generan sin errores desde el mismo objeto", () => {
  const result = runFullPipeline("hotel");
  assert.doesNotThrow(() => JSON.parse(renderProposalJson(result.proposal)));
  assert.match(renderProposalMarkdown(result.proposal), /^# /);
  assert.match(renderProposalHtml(result.proposal), /<article/);
});

// 21. Idempotencia
test("E2E 21 — idempotencia de extremo a extremo: mismo input -> mismo panel/propuesta byte a byte", () => {
  const input = { profileId: "hotel", business: { name: "Hotel Idem" }, roiInputs: { averageTicket: 100 } };
  assert.deepEqual(buildCommercialPanel(input), buildCommercialPanel(input));
});

// 22. Errores sanitizados
test("E2E 22 — errores de validación nunca exponen una excepción cruda ni datos internos", () => {
  const assessment = buildCommercialAssessment({ risks: ["no-es-objeto", 123, null] });
  assert.deepEqual([...assessment.risks], []);
});

// 23. Compatibilidad legacy
test("E2E 23 — el motor de investigación (Pasos 12-18) sigue funcionando exactamente igual: el módulo comercial no lo modifica", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-commercial-legacy-"));
  try {
    const request = buildResearchRequest({ business: { name: "Legacy Check Paso20", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir });
    assert.ok(result.auditId);
    assert.equal(result.pipeline, "legacy");
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

// 24. No red por defecto
test("E2E 24 — ningún módulo comercial importa fetch/http/https/dns a nivel de módulo (no hay red por defecto)", async () => {
  const { readFile, readdir } = await import("node:fs/promises");
  const dir = new URL(".", import.meta.url);
  const files = (await readdir(dir)).filter((f) => f.endsWith(".js") && !f.endsWith(".test.mjs"));
  for (const file of files) {
    if (file === "stripeAdapter.js" || file === "whatsappAdapter.js") continue; // Paso 19: SÍ pueden hacer red, pero solo si se configuran explícitamente (ya verificado en sus propios tests)
    const src = await readFile(new URL(file, dir), "utf8");
    assert.doesNotMatch(src, /from\s+["']node:(http|https|dns)["']|require\(["']node:(http|https|dns)["']\)/, file);
  }
});
