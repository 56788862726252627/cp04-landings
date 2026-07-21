// Paso 12 · Fase 18 — Informes de auditoría.
//
// Mismo principio que factory/reportGenerator.js (Paso 10): `buildReportData`
// separa el contenido determinista de `generatedAt` (no determinista), y
// cada render* es una función pura de reportData -> string. Todos citan
// evidenceId cuando existe evidencia, y marcan explícitamente inferencia/
// desconocido cuando no la hay.

import { classifyScore } from "./dimensionRegistry.js";

export function buildReportData(auditResult) {
  return {
    requestId: auditResult.requestId,
    sectorPresetId: auditResult.sectorPresetId,
    businessName: auditResult.businessName,
    scores: auditResult.scores,
    dimensionResults: auditResult.dimensionResults,
    recommendations: auditResult.recommendations,
    backlog: auditResult.backlog,
    impactEffortMatrix: auditResult.impactEffortMatrix,
    automations: auditResult.automations,
    competitorComparison: auditResult.competitorComparison,
    evidence: auditResult.evidence,
    limitations: auditResult.limitations,
    prudentNote: auditResult.prudentNote,
    durationMs: auditResult.durationMs,
    generatedAt: auditResult.generatedAt,
  };
}

function fmtScore(score) {
  return score === null ? "sin datos" : `${score}/100 (${classifyScore(score)})`;
}

export function renderExecutiveReportMarkdown(reportData) {
  const topRisks = Object.values(reportData.dimensionResults).flatMap((d) => d.risks).slice(0, 5);
  const topOpportunities = Object.values(reportData.dimensionResults).flatMap((d) => d.opportunities).slice(0, 5);
  const topRecommendations = reportData.recommendations.slice(0, 5);
  const lines = [
    `# Informe ejecutivo — ${reportData.businessName || reportData.requestId}`,
    "",
    `Score global: **${fmtScore(reportData.scores.global.score)}** (confianza ${Math.round(reportData.scores.global.confidence * 100)}%, cobertura ${Math.round(reportData.scores.global.coverage * 100)}%)`,
    "",
    "## Riesgos principales",
    ...(topRisks.length > 0 ? topRisks.map((r) => `- ${r}`) : ["- Sin riesgos detectados con la evidencia disponible."]),
    "",
    "## Oportunidades principales",
    ...(topOpportunities.length > 0 ? topOpportunities.map((o) => `- ${o}`) : ["- Sin oportunidades detectadas con la evidencia disponible."]),
    "",
    "## Recomendaciones prioritarias",
    ...(topRecommendations.length > 0 ? topRecommendations.map((r) => `- **${r.title}** (prioridad ${r.priority}) — ${r.problem}`) : ["- Ninguna: no hay dimensiones con score bajo detectadas."]),
  ];
  if (reportData.prudentNote) lines.push("", `> ${reportData.prudentNote}`);
  return lines.join("\n") + "\n";
}

export function renderTechnicalReportMarkdown(reportData) {
  const lines = [`# Informe técnico — ${reportData.businessName || reportData.requestId}`, "", "## Puntuaciones por categoría", "", "| Categoría | Score | Confianza | Cobertura |", "|---|---|---|---|"];
  for (const [category, result] of Object.entries(reportData.scores.categories)) {
    lines.push(`| ${category} | ${fmtScore(result.score)} | ${Math.round(result.confidence * 100)}% | ${Math.round(result.coverage * 100)}% |`);
  }
  lines.push("", "## Dimensiones", "", "| Dimensión | Score | Estado | Evidencias |", "|---|---|---|---|");
  for (const result of Object.values(reportData.dimensionResults)) {
    lines.push(`| ${result.label} | ${fmtScore(result.score)} | ${result.status} | ${result.evidenceIds.length} |`);
  }
  return lines.join("\n") + "\n";
}

export function renderCommercialReportMarkdown(reportData) {
  const lines = [
    `# Informe comercial — ${reportData.businessName || reportData.requestId}`,
    "",
    `Madurez digital: ${fmtScore(reportData.scores.categories.digitalMaturity?.score ?? null)}`,
    "",
    "## Automatizaciones candidatas",
    ...(reportData.automations.length > 0 ? reportData.automations.map((a) => `- **${a.label}** — ROI cualitativo: ${a.qualitativeROI} (implementación sugerida: ${a.recommendedImplementation})`) : ["- Ninguna automatización candidata detectada."]),
    "",
    "## Backlog priorizado (top 10)",
    ...reportData.backlog.slice(0, 10).map((r, i) => `${i + 1}. **${r.title}** — impacto ${r.impact}, esfuerzo ${r.effort}, prioridad ${r.priority}${r.quickWin ? " (quick win)" : ""}`),
  ];
  if (reportData.competitorComparison && reportData.competitorComparison.table.length > 0) {
    lines.push("", "## Comparación con competidores", ...reportData.competitorComparison.advantages.map((a) => `- Ventaja: ${a}`), ...reportData.competitorComparison.weaknesses.map((w) => `- Debilidad: ${w}`));
  }
  return lines.join("\n") + "\n";
}

export function renderOpportunitiesSummaryMarkdown(reportData) {
  const opportunities = Object.values(reportData.dimensionResults).filter((d) => d.opportunities.length > 0);
  const lines = ["# Resumen de oportunidades", ""];
  for (const dim of opportunities) lines.push(`## ${dim.label}`, ...dim.opportunities.map((o) => `- ${o}`), "");
  if (opportunities.length === 0) lines.push("Sin oportunidades detectadas con la evidencia disponible.");
  return lines.join("\n") + "\n";
}

export function renderBacklogMarkdown(reportData) {
  const lines = ["# Backlog priorizado", "", "| # | Recomendación | Impacto | Esfuerzo | Urgencia | Confianza | Prioridad | Quick win |", "|---|---|---|---|---|---|---|---|"];
  reportData.backlog.forEach((r, i) => lines.push(`| ${i + 1} | ${r.title} | ${r.impact} | ${r.effort} | ${r.urgency} | ${r.confidence} | ${r.priority} | ${r.quickWin ? "sí" : "no"} |`));
  return lines.join("\n") + "\n";
}

export function renderImpactEffortMatrixMarkdown(reportData) {
  const m = reportData.impactEffortMatrix;
  return [
    "# Matriz impacto/esfuerzo",
    "",
    `## Quick wins (${m.quickWins.length})`,
    ...m.quickWins.map((id) => `- ${id}`),
    "",
    `## Proyectos mayores (${m.majorProjects.length})`,
    ...m.majorProjects.map((id) => `- ${id}`),
    "",
    `## Rellenos (${m.fillIns.length})`,
    ...m.fillIns.map((id) => `- ${id}`),
    "",
    `## Cuestionables (${m.questionable.length})`,
    ...m.questionable.map((id) => `- ${id}`),
  ].join("\n") + "\n";
}

export function renderAutomationMapMarkdown(reportData) {
  const lines = ["# Mapa de automatizaciones candidatas", "", "| Automatización | Trigger | Implementación sugerida | Prioridad |", "|---|---|---|---|"];
  for (const a of reportData.automations) lines.push(`| ${a.label} | ${a.trigger} | ${a.recommendedImplementation} | ${a.priority} |`);
  if (reportData.automations.length === 0) lines.push("| _ninguna_ | | | |");
  return lines.join("\n") + "\n";
}

export function renderRiskReportMarkdown(reportData) {
  const lines = ["# Informe de riesgos", ""];
  for (const dim of Object.values(reportData.dimensionResults)) {
    if (dim.risks.length === 0 && dim.contradictions.length === 0) continue;
    lines.push(`## ${dim.label}`, ...dim.risks.map((r) => `- Riesgo: ${r}`), ...dim.contradictions.map((c) => `- Contradicción: ${c.reason}`), "");
  }
  if (lines.length === 2) lines.push("Sin riesgos ni contradicciones detectados.");
  return lines.join("\n") + "\n";
}

export function renderEvidenceAppendixMarkdown(reportData) {
  const lines = ["# Apéndice de evidencias", "", "| evidenceId | fuente | dimensión | clasificación | extracto |", "|---|---|---|---|---|"];
  for (const e of reportData.evidence) lines.push(`| ${e.evidenceId} | ${e.sourceId} | ${e.relatedDimension} | ${e.classification} | ${e.excerpt.replace(/\|/g, "/")} |`);
  return lines.join("\n") + "\n";
}

export function renderAuditReportJson(reportData) {
  return JSON.stringify(reportData, null, 2) + "\n";
}
