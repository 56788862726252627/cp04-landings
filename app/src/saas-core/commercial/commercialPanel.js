// Paso 20 · Fase 4 — Panel comercial: combina CommercialAssessment +
// RoiModel + IntegrationReadiness + ImplementationRoadmap en una única
// estructura de datos reutilizable por cualquier superficie (CLI, HTML,
// React futuro) — la lógica sectorial vive SOLO en
// `commercialSectorProfiles.js`, nunca aquí ni en el HTML.

import { buildCommercialAssessment } from "./commercialAssessment.js";
import { computeRoiScenarios } from "./roiEngine.js";
import { computeIntegrationReadiness } from "./integrationReadiness.js";
import { buildImplementationRoadmap } from "./implementationRoadmap.js";
import { describeSandboxReadiness } from "./commercialSandbox.js";

/**
 * @param {object} input
 * @param {string|null} input.profileId
 * @param {object} input.business
 * @param {object} [input.auditScores]
 * @param {Array} [input.risks]
 * @param {Array} [input.opportunities]
 * @param {Array} [input.recommendations]
 * @param {object} [input.roiInputs]
 * @param {object} [input.env] - entorno para IntegrationReadiness/sandbox (inyectable, por defecto {})
 * @param {object} [input.externalContext] - hechos ya conocidos (Airtable degradado, flujos Make validados)
 */
export function buildCommercialPanel(input = {}) {
  const assessment = buildCommercialAssessment(input);
  const roi = computeRoiScenarios(input.roiInputs ?? {}, { profileId: assessment.profileId });
  const integrationsReadiness = computeIntegrationReadiness(input.env ?? {}, input.externalContext ?? {});
  const roadmap = buildImplementationRoadmap({ profileId: assessment.profileId, integrationsReadiness });
  const sandboxReadiness = describeSandboxReadiness(input.env ?? {});

  const nextStepChecklist = [];
  for (const integration of Object.values(integrationsReadiness.integrations)) {
    if (integration.blockedBy) nextStepChecklist.push({ integration: integration.label, blockedBy: integration.blockedBy, nextSteps: [...integration.nextSteps] });
  }

  return Object.freeze({
    generatedForProfile: assessment.profileId,
    executiveSummary: {
      businessName: assessment.business.name,
      profileLabel: assessment.profileLabel,
      overallScore: assessment.scores.overall.score,
      overallScoreCoverage: assessment.scores.overall.coverage,
      topRisks: assessment.risks.slice(0, 3),
      topOpportunities: assessment.opportunities.slice(0, 3),
      priorityRecommendations: assessment.recommendations.slice(0, 5),
    },
    assessment,
    roi,
    integrationsReadiness,
    sandboxReadiness,
    roadmap,
    nextStepChecklist: Object.freeze(nextStepChecklist),
    disclaimer: "Panel generado a partir de datos aportados y supuestos declarados — ninguna cifra de este panel es un resultado garantizado ni una operación real (ver assessment.scores.source y roi.disclaimer).",
  });
}

const PANEL_CATEGORY_LABELS = {};

function scoreCell(score) {
  return score === null || score === undefined ? "sin datos" : `${score}/100`;
}

/** Sección: puntuaciones + riesgos + oportunidades + recomendaciones — "panel de diagnóstico". */
export function renderDiagnosticSectionHtml(panel) {
  const categoriesRows = Object.entries(panel.assessment.scores.categories)
    .map(([id, c]) => `<tr><td>${PANEL_CATEGORY_LABELS[id] ?? id}</td><td>${scoreCell(c.score)}</td><td>${c.coverage === null ? "—" : `${Math.round(c.coverage * 100)}%`}</td></tr>`)
    .join("\n");
  const risksRows = panel.assessment.risks.map((r) => `<li><strong>${r.title}</strong> (${r.severity})</li>`).join("\n") || "<li>Sin riesgos registrados.</li>";
  const opportunitiesRows = panel.assessment.opportunities.map((o) => `<li><strong>${o.title}</strong></li>`).join("\n") || "<li>Sin oportunidades registradas.</li>";
  const recommendationsRows = panel.assessment.recommendations.map((r) => `<li><strong>${r.title}</strong></li>`).join("\n") || "<li>Sin recomendaciones registradas.</li>";

  return `<header>
    <h1>${panel.executiveSummary.businessName ?? "Negocio sin nombre"} — ${panel.executiveSummary.profileLabel}</h1>
    <p class="score-global">Puntuación global: <strong>${scoreCell(panel.executiveSummary.overallScore)}</strong></p>
  </header>
  <article class="panel-block">
    <h2>Puntuaciones por categoría</h2>
    <table><thead><tr><th>Categoría</th><th>Score</th><th>Cobertura</th></tr></thead><tbody>${categoriesRows || "<tr><td colspan=3>Sin puntuaciones disponibles</td></tr>"}</tbody></table>
  </article>
  <article class="panel-block">
    <h2>Principales riesgos</h2><ul>${risksRows}</ul>
    <h2>Oportunidades</h2><ul>${opportunitiesRows}</ul>
    <h2>Recomendaciones prioritarias</h2><ul>${recommendationsRows}</ul>
  </article>`;
}

/** Sección: escenarios ROI — "panel ROI". */
export function renderRoiSectionHtml(panel) {
  const roiRows = Object.values(panel.roi.scenarios)
    .map((s) => `<tr><td>${s.label}</td><td>${s.totalMonthlyBenefit.value} EUR/mes</td><td>${s.paybackMonths.value ?? "sin datos"}</td><td>${s.roi12Months.value ?? "sin datos"}%</td></tr>`)
    .join("\n");
  return `<article class="panel-block">
    <h2>ROI (estimaciones, nunca garantizadas)</h2>
    <table><thead><tr><th>Escenario</th><th>Beneficio mensual</th><th>Payback (meses)</th><th>ROI a 12m</th></tr></thead><tbody>${roiRows}</tbody></table>
    <p class="disclaimer">${panel.roi.disclaimer}</p>
  </article>`;
}

/** Sección: estado de integraciones. */
export function renderIntegrationsSectionHtml(panel) {
  const integrationsRows = Object.values(panel.integrationsReadiness.integrations)
    .map((i) => `<tr><td>${i.label}</td><td class="status status-${i.status}">${i.status}</td><td>${i.blockedBy ?? "—"}</td></tr>`)
    .join("\n");
  return `<article class="panel-block">
    <h2>Estado de integraciones</h2>
    <table><thead><tr><th>Integración</th><th>Estado</th><th>Bloqueo</th></tr></thead><tbody>${integrationsRows}</tbody></table>
    <p class="disclaimer">${panel.integrationsReadiness.disclaimer}</p>
  </article>`;
}

/** Sección: roadmap de implantación. */
export function renderRoadmapSectionHtml(panel) {
  const roadmapRows = panel.roadmap.steps.map((s) => `<li>${s.order}. ${s.title}${s.estimatedWeeks ? ` (~${s.estimatedWeeks} semana(s))` : ""}</li>`).join("\n");
  return `<article class="panel-block">
    <h2>Roadmap de implantación</h2><ol>${roadmapRows}</ol>
    <p class="disclaimer">${panel.roadmap.disclaimer}</p>
  </article>`;
}

/**
 * Renderiza el panel COMPLETO a HTML autocontenido (sin dependencias
 * externas) — compone las secciones de arriba, reutilizadas
 * individualmente por `devicePreview.js` para las vistas de dispositivo.
 */
export function renderCommercialPanelHtml(panel) {
  return `<section class="commercial-panel">
  ${renderDiagnosticSectionHtml(panel)}
  ${renderRoiSectionHtml(panel)}
  ${renderIntegrationsSectionHtml(panel)}
  ${renderRoadmapSectionHtml(panel)}
  <footer><p class="disclaimer">${panel.disclaimer}</p></footer>
</section>`;
}
