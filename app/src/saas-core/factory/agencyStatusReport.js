// Prompt Agencia IA 5/7 — Vista agregada multi-negocio de la agencia.
//
// Reutiliza (no duplica) `buildBusinessStatusReport` (./businessStatusReport.js,
// Prompt 4/7) para cada negocio en un bucle, y agrega los resultados en una
// vista única orientada al operador de la agencia (no al dueño de un único negocio).
//
// Módulo puro (sin I/O): recibe los inputs ya cargados (mismo patrón que P4/7).
// El CLI (factory-cli/agency-status.mjs) se encarga de la carga y la salida.

import { INTEGRATION_IDS } from "../commercial/integrationReadiness.js";
import { buildBusinessStatusReport } from "./businessStatusReport.js";

/**
 * Clasificación de la agencia como conjunto (más conservadora que el promedio):
 * - "no_businesses": lista vacía — no hay nada que evaluar
 * - "C": al menos un negocio bloqueado — la agencia tiene un cliente sin poder operar
 * - "B": al menos un negocio parcial, ninguno bloqueado
 * - "A": todos los negocios listos para el alcance evaluado
 */
function deriveOverallClassification(byClassification, total) {
  if (total === 0) return "no_businesses";
  if (byClassification.C > 0) return "C";
  if (byClassification.B > 0) return "B";
  return "A";
}

/**
 * Resumen agregado de integraciones: para cada id de integración (Paso 20),
 * cuántos negocios lo tienen en cada `status` y cuántos lo tienen en
 * modo producción real (mode === "production").
 *
 * Permite detectar, de un vistazo, qué integraciones son el cuello de botella
 * en la cartera completa sin revisar cada negocio por separado.
 */
function buildAgencyIntegrationSummary(businessReports) {
  const summary = {};
  for (const id of INTEGRATION_IDS) {
    summary[id] = { id, byStatus: {}, productionReadyCount: 0, businessCount: businessReports.length };
  }
  for (const status of businessReports) {
    for (const row of status.integrations) {
      if (!summary[row.id]) continue;
      summary[row.id].byStatus[row.status] = (summary[row.id].byStatus[row.status] || 0) + 1;
      if (row.mode === "production") summary[row.id].productionReadyCount++;
    }
  }
  return Object.freeze(summary);
}

/**
 * Construye el informe agregado de toda la agencia a partir de los inputs de
 * cada negocio ya cargados. No hace I/O. Igual que P4/7 pero para N negocios.
 *
 * @param {Array<{report: object, tenantConfig: object}>} businessInputs
 *   Inputs de cada negocio, en el mismo formato que espera `buildBusinessStatusReport`.
 * @param {object} integrationsReadiness
 *   Resultado de `computeIntegrationReadiness(env)` — se reutiliza para todos los negocios
 *   porque refleja el entorno real de la agencia (mismo env para todos los clientes en este
 *   análisis; en un multi-tenant con env por cliente, el caller puede agrupar por separado).
 * @param {{ scope?: "dryRun"|"production" }} [opts]
 */
export function buildAgencyStatusReport(businessInputs, integrationsReadiness, { scope = "dryRun" } = {}) {
  const businessReports = businessInputs.map(({ report, tenantConfig }) =>
    buildBusinessStatusReport({ report, tenantConfig, integrationsReadiness, scope })
  );

  const byClassification = { A: 0, B: 0, C: 0 };
  for (const b of businessReports) {
    if (b.classification === "A" || b.classification === "B" || b.classification === "C") {
      byClassification[b.classification]++;
    }
  }

  const total = businessReports.length;
  const integrationSummary = buildAgencyIntegrationSummary(businessReports);
  const overallClassification = deriveOverallClassification(byClassification, total);

  return Object.freeze({
    scope,
    totalBusinesses: total,
    byClassification: Object.freeze({ ...byClassification }),
    businesses: Object.freeze([...businessReports]),
    integrationSummary: Object.freeze(integrationSummary),
    overallClassification,
    queriedAt: new Date().toISOString(),
  });
}

export function renderAgencyStatusMarkdown(agencyReport) {
  const { scope, totalBusinesses, byClassification, overallClassification, businesses, integrationSummary, queriedAt } = agencyReport;

  const lines = [
    `# Panel de la Agencia IA — Vista agregada (${scope})`,
    "",
    "## Resumen",
    `- **Total de negocios:** ${totalBusinesses}`,
    `- **Clasificación global de la agencia:** ${overallClassification}`,
    `  - A (listos para este alcance): ${byClassification.A}`,
    `  - B (parcialmente operativos): ${byClassification.B}`,
    `  - C (bloqueados): ${byClassification.C}`,
    "",
  ];

  if (totalBusinesses === 0) {
    lines.push(
      "_No hay negocios generados todavía. Usa `npm run business:create -- --example=full`._",
      ""
    );
  } else {
    lines.push("## Negocios");
    lines.push("");
    lines.push("| ID | Nombre | Sector | Clasificación | Siguiente paso |");
    lines.push("|---|---|---|---|---|");
    for (const b of businesses) {
      lines.push(`| ${b.businessId} | ${b.commercialName} | ${b.sector} | **${b.classification}** | ${b.classificationNextStep} |`);
    }
    lines.push("");

    lines.push("## Resumen de integraciones (todos los negocios)");
    lines.push("");
    lines.push("| Integración | En producción | Distribución de estados |");
    lines.push("|---|---|---|");
    for (const [id, s] of Object.entries(integrationSummary)) {
      const statusParts = Object.entries(s.byStatus)
        .map(([st, n]) => `${st}:${n}`)
        .join(", ");
      lines.push(`| ${id} | ${s.productionReadyCount}/${s.businessCount} | ${statusParts || "(sin datos)"} |`);
    }
    lines.push("");
  }

  lines.push(`_Consultado: ${queriedAt} (dinámico — no forma parte de ningún report.json determinista)_`, "");
  return lines.join("\n") + "\n";
}

export function renderAgencyStatusJson(agencyReport) {
  return JSON.stringify(agencyReport, null, 2) + "\n";
}
