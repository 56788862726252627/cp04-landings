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
    networkUsed: auditResult.networkUsed ?? false,
    consultedUrls: auditResult.consultedUrls ?? [],
    // Paso 15 — presentes solo en modo multiproveedor; en legacy quedan en
    // sus valores neutros (pipeline: "legacy", el resto null/[]), por lo
    // que un informe legacy es indistinguible del generado en Paso 12/13/14.
    pipeline: auditResult.pipeline ?? "legacy",
    profileId: auditResult.profileId ?? null,
    providerRunSummary: auditResult.providerRunSummary ?? null,
    evidenceConflicts: auditResult.evidenceConflicts ?? [],
    providerScoreBreakdown: auditResult.providerScoreBreakdown ?? [],
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
    reportData.networkUsed ? `**Fuentes reales consultadas por red (${reportData.consultedUrls.length}):** ${reportData.consultedUrls.join(", ")}` : "_Auditoría offline: sin conexiones de red reales._",
    // Paso 15 — solo se añade cuando hubo pipeline multiproveedor
    // (reportData.providerRunSummary no nulo); en legacy esta línea no se
    // genera, por lo que el executive.md de una auditoría legacy es
    // idéntico byte a byte al de Paso 12/13/14.
    ...(reportData.providerRunSummary
      ? [`_Pipeline multiproveedor (perfil "${reportData.providerRunSummary.profileId}"): ${reportData.providerRunSummary.providers.length} proveedor(es) intentado(s), usado: ${reportData.providerRunSummary.usedProviderId ?? "ninguno"}. Detalle en reports/providers.md._`]
      : []),
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

// Paso 15 · Fase 7 — informe del pipeline multiproveedor. Solo se genera
// (ver auditOrchestrator.js) cuando `pipeline === "multiprovider"`; en
// legacy `providerRunSummary` es null y esta función no se llama.
const ORCHESTRATOR_STATUS_LABELS = Object.freeze({
  available: "disponible (evidencia real)",
  unavailable: "no disponible (stub/contrato preparado)",
  skipped: "omitido",
  failed: "falló",
  blocked: "bloqueado (circuit breaker)",
  timed_out: "tiempo agotado",
  cancelled: "cancelado",
});

export function renderProviderRunSummaryMarkdown(reportData) {
  const summary = reportData.providerRunSummary;
  if (!summary) return "# Proveedores\n\nEsta auditoría se ejecutó en modo legacy (pipeline=\"legacy\"): no se usó el registro multiproveedor.\n";

  const lines = [
    `# Proveedores — pipeline multiproveedor`,
    "",
    `Modo de ejecución: **${summary.executionMode}** · Perfil sectorial: **${summary.profileId ?? "genérico"}** · Proveedor usado: **${summary.usedProviderId ?? "ninguno"}**`,
    "",
    "## Proveedores intentados",
    "",
    "| Proveedor | Estado | Evidencia aportada | Prioridad | Errores |",
    "|---|---|---|---|---|",
  ];
  for (const p of summary.providers) {
    const errorText = p.errors.length > 0 ? p.errors.map((e) => e.message).join("; ") : "—";
    lines.push(`| ${p.providerId} | ${ORCHESTRATOR_STATUS_LABELS[p.orchestratorStatus] ?? p.orchestratorStatus} | ${p.evidenceContributed} | ${p.priority ?? "—"} | ${errorText} |`);
  }
  if (summary.providers.length === 0) lines.push("| _ninguno_ | | | | |");

  lines.push("", "## Desglose de evidencia por proveedor", "", "| Proveedor | Evidencias | Dimensiones cubiertas |", "|---|---|---|");
  for (const b of reportData.providerScoreBreakdown ?? []) lines.push(`| ${b.providerId} | ${b.evidenceCount} | ${b.dimensionsContributed.join(", ")} |`);
  if (!reportData.providerScoreBreakdown || reportData.providerScoreBreakdown.length === 0) lines.push("| _ninguno_ | | |");

  lines.push("", "## Conflictos de evidencia entre proveedores", "");
  const conflicts = reportData.evidenceConflicts ?? [];
  if (conflicts.length === 0) {
    lines.push("Sin conflictos detectados entre proveedores.");
  } else {
    for (const c of conflicts) lines.push(`- **${c.label}** (${c.dimensionId}): ${c.reason} — proveedores implicados: ${c.providersInvolved.join(", ") || "sin atribución"} (confianza tras penalización: ${Math.round(c.confidenceAfterPenalty * 100)}%)`);
  }

  if (summary.pluginLoadErrors.length > 0) {
    lines.push("", "## Errores al cargar plugins", "", ...summary.pluginLoadErrors.map((e) => `- ${e.file}: ${e.reason}`));
  }

  return lines.join("\n") + "\n";
}

// Paso 16 · Fase 5/7 — informe SEO dedicado. Solo se genera (ver
// auditOrchestrator.js) cuando `providerRunSummary.seo` no es null, es
// decir, cuando seoProvider analizó páginas reales en esta ejecución.
const SEO_SEVERITY_LABELS = Object.freeze({ critical: "Crítico", high: "Alto", medium: "Medio", low: "Bajo", opportunity: "Oportunidad", not_evaluable: "No evaluable" });

export function renderSeoReportMarkdown(reportData) {
  const seo = reportData.providerRunSummary?.seo;
  if (!seo) return "# SEO\n\nEsta auditoría no incluye análisis SEO (pipeline legacy, o seoProvider no se ejecutó en esta ejecución).\n";

  const lines = [
    "# Informe SEO",
    "",
    `Score SEO global: **${seo.scoreBreakdown.overall.score === null ? "sin datos" : `${seo.scoreBreakdown.overall.score}/100`}** (confianza ${Math.round(seo.scoreBreakdown.overall.confidence * 100)}%, cobertura de grupos ${Math.round(seo.scoreBreakdown.overall.coverage * 100)}%)`,
    "",
    "## Desglose por grupo",
    "",
    "| Grupo | Score | Confianza | Cobertura | Hallazgos |",
    "|---|---|---|---|---|",
  ];
  for (const group of Object.values(seo.scoreBreakdown.groups)) {
    lines.push(`| ${group.label} | ${group.score === null ? "sin datos" : `${group.score}/100`} | ${Math.round(group.confidence * 100)}% | ${Math.round(group.coverage * 100)}% | ${group.findingsCount} |`);
  }

  lines.push("", "## Recomendaciones SEO", "");
  const recosBySeverity = {};
  for (const r of seo.recommendations) (recosBySeverity[r.severity] ??= []).push(r);
  const orderedSeverities = ["critical", "high", "medium", "low", "opportunity"];
  let anyRecommendation = false;
  for (const severity of orderedSeverities) {
    const group = recosBySeverity[severity] ?? [];
    if (group.length === 0) continue;
    anyRecommendation = true;
    lines.push(`### ${SEO_SEVERITY_LABELS[severity]} (${group.length})`, "");
    for (const r of group) lines.push(`- **${r.title}** — esfuerzo ${r.effort}, confianza ${Math.round(r.confidence * 100)}%. ${r.explanation} _(${r.affectedUrls.length} URL(s) afectada(s))_`);
    lines.push("");
  }
  if (!anyRecommendation) lines.push("Sin recomendaciones SEO: ningún hallazgo negativo ni oportunidad detectados.");

  return lines.join("\n") + "\n";
}

// Paso 17 · Fase 5/7 — informe de accesibilidad dedicado. Solo se genera
// (ver auditOrchestrator.js) cuando `providerRunSummary.accessibility` no
// es null. Incluye SIEMPRE el disclaimer legal: una puntuación
// automática nunca certifica conformidad WCAG ni sustituye una auditoría
// humana completa.
const A11Y_SEVERITY_LABELS = Object.freeze({ critical: "Crítico", high: "Alto", medium: "Medio", low: "Bajo", opportunity: "Oportunidad", manual_review: "Revisión manual pendiente" });

export function renderAccessibilityReportMarkdown(reportData) {
  const a11y = reportData.providerRunSummary?.accessibility;
  if (!a11y) return "# Accesibilidad\n\nEsta auditoría no incluye análisis de accesibilidad (pipeline legacy, o accessibilityProvider no se ejecutó en esta ejecución).\n";

  const lines = [
    "# Informe de accesibilidad",
    "",
    `> ${a11y.scoreBreakdown.disclaimer}`,
    "",
    `Score de accesibilidad global: **${a11y.scoreBreakdown.overall.score === null ? "sin datos" : `${a11y.scoreBreakdown.overall.score}/100`}** (confianza ${Math.round(a11y.scoreBreakdown.overall.confidence * 100)}%, cobertura de grupos ${Math.round(a11y.scoreBreakdown.overall.coverage * 100)}%, ${a11y.scoreBreakdown.overall.manualReviewCount} hallazgo(s) pendiente(s) de revisión manual)`,
    "",
    "## Desglose por grupo",
    "",
    "| Grupo | Score | Confianza | Cobertura | Hallazgos | Revisión manual |",
    "|---|---|---|---|---|---|",
  ];
  for (const group of Object.values(a11y.scoreBreakdown.groups)) {
    lines.push(`| ${group.label} | ${group.score === null ? "sin datos" : `${group.score}/100`} | ${Math.round(group.confidence * 100)}% | ${Math.round(group.coverage * 100)}% | ${group.findingsCount} | ${group.manualReviewCount} |`);
  }

  lines.push("", "## Recomendaciones de accesibilidad", "");
  const recosBySeverity = {};
  for (const r of a11y.recommendations) (recosBySeverity[r.severity] ??= []).push(r);
  const orderedSeverities = ["critical", "high", "medium", "low", "opportunity", "manual_review"];
  let anyRecommendation = false;
  for (const severity of orderedSeverities) {
    const group = recosBySeverity[severity] ?? [];
    if (group.length === 0) continue;
    anyRecommendation = true;
    lines.push(`### ${A11Y_SEVERITY_LABELS[severity]} (${group.length})`, "");
    for (const r of group) {
      const wcagText = r.wcagCriterion ? ` [WCAG ${r.wcagCriterion.criterion} (${r.wcagCriterion.level})]` : "";
      lines.push(`- **${r.title}**${wcagText} — esfuerzo ${r.effort}, confianza ${Math.round(r.confidence * 100)}%. ${r.explanation} _(${r.affectedUrls.length} URL(s) afectada(s))_`);
    }
    lines.push("");
  }
  if (!anyRecommendation) lines.push("Sin recomendaciones de accesibilidad: ningún hallazgo negativo, oportunidad ni revisión manual pendiente.");

  return lines.join("\n") + "\n";
}
