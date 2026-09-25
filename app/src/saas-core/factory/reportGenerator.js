// Paso 10 · Fase 10 — Informe automático de una ejecución de la fábrica.
//
// Construye el informe en Markdown + el mismo contenido en JSON a partir
// del resultado del orquestador (Fase 3). La estructura es la misma para
// que un paso futuro pueda convertir report.json a PDF sin reescribir esta
// función (JSON estable, Markdown solo para lectura humana).

export function buildReportData(runResult) {
  return {
    businessId: runResult.businessId,
    blueprint: { businessId: runResult.blueprint.businessId, sector: runResult.blueprint.sector, commercialName: runResult.blueprint.commercialName },
    filesCreated: runResult.filesCreated,
    filesUpdated: runResult.filesUpdated,
    filesPreserved: runResult.filesPreserved,
    modulesActivated: runResult.tenantConfig.modulesEnabled,
    modulesDiscarded: runResult.modulesDiscarded || [],
    automationsSelected: runResult.blueprint.automations || [],
    integrationsDeclared: Object.keys(runResult.tenantConfig.integrations),
    demoDataSummary: runResult.demoDataSummary,
    reuse: runResult.reuse,
    manualSteps: runResult.manualSteps,
    risks: runResult.risks,
    limitations: runResult.limitations,
    durationMs: runResult.durationMs,
    compatibility: runResult.compatibility,
    idempotent: runResult.idempotent,
    dryRun: runResult.dryRun,
    nextStep: runResult.nextStep,
    generatedAt: runResult.generatedAt,
  };
}

export function renderReportMarkdown(reportData) {
  const lines = [
    `# Informe de generación — ${reportData.blueprint.commercialName}`,
    "",
    `Business ID: \`${reportData.businessId}\` · Sector: \`${reportData.blueprint.sector}\` · Generado: ${reportData.generatedAt}`,
    "",
    "## Archivos",
    `- Creados: ${reportData.filesCreated.length}`,
    `- Actualizados: ${reportData.filesUpdated.length}`,
    `- Preservados (no sobrescritos): ${reportData.filesPreserved.length}`,
    "",
    "## Módulos y automatizaciones",
    `- Módulos activados (${reportData.modulesActivated.length}): ${reportData.modulesActivated.join(", ")}`,
    `- Automatizaciones seleccionadas: ${reportData.automationsSelected.join(", ") || "(ninguna)"}`,
    `- Integraciones declaradas: ${reportData.integrationsDeclared.join(", ")}`,
    "",
    "## Datos demo",
    `- Clientes: ${reportData.demoDataSummary.customers} · Profesionales: ${reportData.demoDataSummary.professionals} · Citas: ${reportData.demoDataSummary.appointments} · Incidencias: ${reportData.demoDataSummary.incidents}`,
    "",
    "## Reutilización",
    `- Módulos reutilizados del catálogo genérico: ${reportData.reuse.reusedModulesRatio}`,
    `- Archivos centrales del núcleo modificados: ${reportData.reuse.coreFilesModified}`,
    "",
    "## Pasos manuales pendientes",
    ...(reportData.manualSteps.length > 0 ? reportData.manualSteps.map((s) => `- ${s}`) : ["- (ninguno declarado)"]),
    "",
    "## Riesgos y limitaciones",
    ...reportData.risks.map((r) => `- Riesgo: ${r}`),
    ...reportData.limitations.map((l) => `- Limitación: ${l}`),
    "",
    "## Rendimiento",
    `- Duración de la generación: ${reportData.durationMs} ms`,
    `- Idempotente: ${reportData.idempotent ? "sí" : "no evaluado en esta ejecución"}`,
    `- Modo dry-run: ${reportData.dryRun ? "sí (no se escribió nada)" : "no"}`,
    "",
    "## Siguiente paso recomendado",
    `- ${reportData.nextStep}`,
  ];
  return lines.join("\n") + "\n";
}

export function renderReportJson(reportData) {
  return JSON.stringify(reportData, null, 2) + "\n";
}
