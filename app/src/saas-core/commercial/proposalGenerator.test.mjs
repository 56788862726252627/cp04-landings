import { test } from "node:test";
import assert from "node:assert/strict";

import { buildCommercialProposal, renderProposalJson, renderProposalMarkdown, renderProposalHtml } from "./proposalGenerator.js";
import { buildCommercialAssessment } from "./commercialAssessment.js";
import { computeRoiScenarios } from "./roiEngine.js";
import { buildImplementationRoadmap } from "./implementationRoadmap.js";
import { computeIntegrationReadiness } from "./integrationReadiness.js";

function fullContext(overrides = {}) {
  const assessment = buildCommercialAssessment({
    profileId: "restaurante",
    business: { name: "Restaurante Demo" },
    auditScores: { seo: { score: 50 } },
    risks: [{ title: "Sin HTTPS", severity: "high" }],
    opportunities: [{ title: "Automatizar recordatorios" }],
    recommendations: [{ title: "Activar reservas online" }],
    ...overrides.assessmentOverrides,
  });
  const roi = computeRoiScenarios({ averageTicket: 30 }, { profileId: "restaurante" });
  const integrationsReadiness = computeIntegrationReadiness({});
  const roadmap = buildImplementationRoadmap({ profileId: "restaurante", integrationsReadiness });
  return { assessment, roi, roadmap, integrationsReadiness, ...overrides };
}

test("buildCommercialProposal requiere assessment/roi/roadmap ya calculados", () => {
  assert.throws(() => buildCommercialProposal({}));
});

test("buildCommercialProposal produce todas las secciones pedidas por el enunciado", () => {
  const proposal = buildCommercialProposal(fullContext());
  for (const key of ["title", "executiveSummary", "currentSituation", "problemsDetected", "opportunities", "proposedSolution", "includedModules", "automations", "implementationPlan", "estimatedCalendar", "initialInvestment", "monthlyMaintenance", "roiScenarios", "risks", "dependencies", "exclusions", "clientResponsibilities", "terms", "nextSteps"]) {
    assert.ok(key in proposal, `falta la sección "${key}"`);
  }
});

test("sin riesgos/oportunidades registrados, se marcan explícitamente como pendientes, nunca se inventan", () => {
  const context = fullContext({ assessmentOverrides: { risks: [], opportunities: [] } });
  const proposal = buildCommercialProposal(context);
  assert.match(proposal.problemsDetected[0].title, /pendiente/i);
  assert.match(proposal.opportunities[0].title, /pendiente/i);
});

test("pendingInformation refleja missingData/assumptionsUsed/unavailableVariables sin inventar datos del cliente", () => {
  const assessment = buildCommercialAssessment({ profileId: "restaurante" }); // sin business.name -> missingData
  const roi = computeRoiScenarios({}, { profileId: "restaurante" }); // todo asumido
  const roadmap = buildImplementationRoadmap({ profileId: "restaurante" });
  const proposal = buildCommercialProposal({ assessment, roi, roadmap });
  assert.ok(proposal.pendingInformation.some((p) => p.includes("business.name")));
  assert.ok(proposal.pendingInformation.some((p) => p.includes("Supuesto usado")));
  assert.match(proposal.currentSituation.businessName, /pendiente/i);
});

test("dependencies refleja los bloqueos reales de integrationsReadiness", () => {
  const proposal = buildCommercialProposal(fullContext());
  assert.ok(proposal.dependencies.length > 0);
  assert.ok(proposal.dependencies.every((d) => d.blockedBy));
});

test("es determinista", () => {
  const context = fullContext();
  assert.deepEqual(buildCommercialProposal(context), buildCommercialProposal(context));
});

test("renderProposalJson produce JSON parseable con el mismo contenido", () => {
  const proposal = buildCommercialProposal(fullContext());
  const json = renderProposalJson(proposal);
  const parsed = JSON.parse(json);
  assert.equal(parsed.title, proposal.title);
});

test("renderProposalMarkdown incluye todas las secciones y el disclaimer", () => {
  const proposal = buildCommercialProposal(fullContext());
  const md = renderProposalMarkdown(proposal);
  for (const heading of ["Resumen ejecutivo", "Situación actual", "Problemas detectados", "Oportunidades", "Solución propuesta", "Módulos incluidos", "Plan de implantación", "Calendario estimado", "Inversión y mantenimiento", "Escenarios ROI", "Riesgos", "Dependencias", "Exclusiones", "Responsabilidades del cliente", "Términos", "Próximos pasos"]) {
    assert.match(md, new RegExp(heading), heading);
  }
  assert.match(md, /disclaimer|garantizad/i);
});

test("renderProposalMarkdown añade la sección de información pendiente solo si hay algo pendiente", () => {
  const withPending = buildCommercialProposal({ assessment: buildCommercialAssessment({ profileId: "restaurante" }), roi: computeRoiScenarios({}, { profileId: "restaurante" }), roadmap: buildImplementationRoadmap({ profileId: "restaurante" }) });
  assert.match(renderProposalMarkdown(withPending), /Información pendiente de confirmar/);
});

test("renderProposalHtml produce HTML con las secciones clave", () => {
  const proposal = buildCommercialProposal(fullContext());
  const html = renderProposalHtml(proposal);
  assert.match(html, /Resumen ejecutivo/);
  assert.match(html, /Escenarios ROI/);
  assert.match(html, /Responsabilidades del cliente/);
});

test("nunca promete un resultado de negocio concreto sin cualificar (evita 'garantizamos'/'aseguramos')", () => {
  const proposal = buildCommercialProposal(fullContext());
  const md = renderProposalMarkdown(proposal);
  assert.doesNotMatch(md, /garantizamos|aseguramos|100% seguro/i);
});
