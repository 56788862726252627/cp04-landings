// Paso 20 · Fase 5 — Generador de propuesta comercial basada en
// evidencia. Consume `CommercialAssessment`/`RoiModel`/
// `ImplementationRoadmap` (nunca los recalcula) y produce una
// propuesta en JSON/Markdown/HTML. NUNCA inventa datos del cliente —
// cuando falta información, la marca explícitamente como pendiente o
// como supuesto (reutilizando `assessment.missingData`/
// `roi.assumptionsUsed`/`roi.unavailableVariables`).

const DEFAULT_EXCLUSIONS = Object.freeze([
  "Compra de dominio propio (pendiente, ver checklist de integraciones).",
  "Contratación de WhatsApp Business Cloud API (pendiente).",
  "Configuración de Stripe en modo producción (pendiente).",
  "Migración de datos históricos no cubiertos por el alcance acordado.",
  "Soporte fuera del horario acordado en el contrato de mantenimiento.",
]);

const DEFAULT_CLIENT_RESPONSIBILITIES = Object.freeze([
  "Proporcionar acceso a las cuentas/credenciales necesarias (Airtable, Stripe, WhatsApp, dominio) cuando corresponda.",
  "Validar el contenido (textos, precios, horarios) antes de la publicación.",
  "Designar una persona de contacto para pruebas de aceptación.",
]);

const DEFAULT_TERMS = Object.freeze({ validityDays: 30, paymentTerms: "50% al inicio, 50% a la entrega — configurable por acuerdo comercial.", currency: "EUR" });

/**
 * @param {object} params
 * @param {ReturnType<import("./commercialAssessment.js").buildCommercialAssessment>} params.assessment
 * @param {ReturnType<import("./roiEngine.js").computeRoiScenarios>} params.roi
 * @param {ReturnType<import("./implementationRoadmap.js").buildImplementationRoadmap>} params.roadmap
 * @param {ReturnType<import("./integrationReadiness.js").computeIntegrationReadiness>} [params.integrationsReadiness]
 * @param {{validityDays?: number, paymentTerms?: string, currency?: string}} [params.terms]
 * @param {string[]} [params.exclusions]
 * @param {string[]} [params.clientResponsibilities]
 */
export function buildCommercialProposal({ assessment, roi, roadmap, integrationsReadiness = null, terms = {}, exclusions = DEFAULT_EXCLUSIONS, clientResponsibilities = DEFAULT_CLIENT_RESPONSIBILITIES } = {}) {
  if (!assessment || !roi || !roadmap) throw new Error("buildCommercialProposal requiere assessment, roi y roadmap ya calculados (no los recalcula)");

  const businessName = assessment.business.name ?? "[Nombre del negocio pendiente]";
  const title = `Propuesta comercial — ${businessName} (${assessment.profileLabel})`;

  const problemsDetected = assessment.risks.length > 0 ? assessment.risks.map((r) => ({ title: r.title, severity: r.severity })) : [{ title: "Sin problemas detectados registrados todavía — pendiente de una auditoría o diagnóstico previo.", severity: "pending" }];

  const opportunities = assessment.opportunities.length > 0 ? [...assessment.opportunities] : [{ title: "Sin oportunidades registradas todavía — pendiente de diagnóstico." }];

  const dependencies = integrationsReadiness ? Object.values(integrationsReadiness.integrations).filter((i) => i.blockedBy).map((i) => ({ integration: i.label, blockedBy: i.blockedBy })) : [];

  const pendingInformation = [...assessment.missingData.map((f) => `Dato de negocio pendiente: ${f}`), ...roi.unavailableVariables.map((f) => `Dato ROI pendiente: ${f}`), ...roi.assumptionsUsed.map((a) => `Supuesto usado (a confirmar con el cliente): ${a.field} = ${a.value}`)];

  return Object.freeze({
    title,
    executiveSummary: `Propuesta para ${businessName}, perfil "${assessment.profileLabel}". Puntuación global actual: ${assessment.scores.overall.score ?? "sin datos"}/100. Beneficio mensual estimado (escenario central): ${roi.scenarios.central.totalMonthlyBenefit.value} EUR/mes (estimación, no garantizada).`,
    currentSituation: { businessName, profileLabel: assessment.profileLabel, overallScore: assessment.scores.overall.score, categoriesEvaluated: assessment.scores.overall.categoriesEvaluated, categoriesTotal: assessment.scores.overall.categoriesTotal },
    problemsDetected: Object.freeze(problemsDetected),
    opportunities: Object.freeze(opportunities),
    proposedSolution: `Implantación de ${roadmap.steps.filter((s) => s.type === "module").length} módulo(s) prioritarios para el perfil "${assessment.profileLabel}", con automatizaciones de recordatorios/reservas y preparación de la capa de pagos/mensajería (Stripe/WhatsApp) para cuando existan credenciales reales.`,
    includedModules: Object.freeze(roadmap.steps.filter((s) => s.type === "module").map((s) => s.title)),
    automations: Object.freeze(assessment.recommendations.map((r) => r.title)),
    implementationPlan: Object.freeze(roadmap.steps.map((s) => ({ order: s.order, title: s.title, type: s.type }))),
    estimatedCalendar: `${roadmap.totalEstimatedWeeks} semana(s) de implantación de módulos (estimación; los bloqueos de integraciones dependen de terceros y no se incluyen en este plazo).`,
    initialInvestment: { value: roi.implementationCost.value, source: roi.implementationCost.source, currency: terms.currency ?? DEFAULT_TERMS.currency },
    monthlyMaintenance: { value: roi.monthlyMaintenanceCost.value, source: roi.monthlyMaintenanceCost.source, currency: terms.currency ?? DEFAULT_TERMS.currency },
    roiScenarios: roi.scenarios,
    risks: Object.freeze([
      { title: "Los plazos de integraciones externas (Airtable/WhatsApp/Stripe/dominio) dependen de terceros y pueden desviar el calendario.", severity: "medium" },
      ...dependencies.map((d) => ({ title: `Bloqueo activo: ${d.integration} (${d.blockedBy})`, severity: "medium" })),
    ]),
    dependencies: Object.freeze(dependencies),
    exclusions: Object.freeze([...exclusions]),
    clientResponsibilities: Object.freeze([...clientResponsibilities]),
    terms: Object.freeze({ ...DEFAULT_TERMS, ...terms }),
    nextSteps: Object.freeze(["Validar los datos y supuestos marcados como pendientes.", "Confirmar el perfil sectorial y el alcance de módulos.", "Acordar términos e iniciar implantación."]),
    pendingInformation: Object.freeze(pendingInformation),
    disclaimer: "Esta propuesta se basa en datos aportados y supuestos declarados — ninguna cifra es un resultado garantizado. Los datos marcados como pendientes/supuestos deben confirmarse con el cliente antes de firmar.",
  });
}

export function renderProposalJson(proposal) {
  return JSON.stringify(proposal, null, 2) + "\n";
}

export function renderProposalMarkdown(proposal) {
  const lines = [
    `# ${proposal.title}`,
    "",
    `> ${proposal.disclaimer}`,
    "",
    "## Resumen ejecutivo",
    proposal.executiveSummary,
    "",
    "## Situación actual",
    `- Negocio: ${proposal.currentSituation.businessName}`,
    `- Perfil: ${proposal.currentSituation.profileLabel}`,
    `- Puntuación global: ${proposal.currentSituation.overallScore ?? "sin datos"}/100 (${proposal.currentSituation.categoriesEvaluated}/${proposal.currentSituation.categoriesTotal} categorías evaluadas)`,
    "",
    "## Problemas detectados",
    ...proposal.problemsDetected.map((p) => `- **${p.title}** (${p.severity})`),
    "",
    "## Oportunidades",
    ...proposal.opportunities.map((o) => `- ${o.title}`),
    "",
    "## Solución propuesta",
    proposal.proposedSolution,
    "",
    "## Módulos incluidos",
    ...proposal.includedModules.map((m) => `- ${m}`),
    "",
    "## Plan de implantación",
    ...proposal.implementationPlan.map((s) => `${s.order}. ${s.title}`),
    "",
    `## Calendario estimado`,
    proposal.estimatedCalendar,
    "",
    "## Inversión y mantenimiento",
    `- Inversión inicial: ${proposal.initialInvestment.value} ${proposal.initialInvestment.currency} (${proposal.initialInvestment.source})`,
    `- Mantenimiento mensual: ${proposal.monthlyMaintenance.value} ${proposal.monthlyMaintenance.currency} (${proposal.monthlyMaintenance.source})`,
    "",
    "## Escenarios ROI",
    ...Object.values(proposal.roiScenarios).map((s) => `- **${s.label}**: beneficio mensual ${s.totalMonthlyBenefit.value} EUR, payback ${s.paybackMonths.value ?? "sin datos"} meses, ROI 12m ${s.roi12Months.value ?? "sin datos"}%`),
    "",
    "## Riesgos",
    ...proposal.risks.map((r) => `- ${r.title} (${r.severity})`),
    "",
    "## Dependencias",
    ...(proposal.dependencies.length > 0 ? proposal.dependencies.map((d) => `- ${d.integration}: ${d.blockedBy}`) : ["Sin dependencias externas bloqueantes registradas."]),
    "",
    "## Exclusiones",
    ...proposal.exclusions.map((e) => `- ${e}`),
    "",
    "## Responsabilidades del cliente",
    ...proposal.clientResponsibilities.map((r) => `- ${r}`),
    "",
    "## Términos",
    `- Validez de la propuesta: ${proposal.terms.validityDays} días`,
    `- Condiciones de pago: ${proposal.terms.paymentTerms}`,
    "",
    "## Próximos pasos",
    ...proposal.nextSteps.map((s) => `- ${s}`),
  ];
  if (proposal.pendingInformation.length > 0) {
    lines.push("", "## Información pendiente de confirmar", ...proposal.pendingInformation.map((p) => `- ${p}`));
  }
  return lines.join("\n") + "\n";
}

export function renderProposalHtml(proposal) {
  const li = (items) => items.map((i) => `<li>${typeof i === "string" ? i : i.title}</li>`).join("\n");
  return `<article class="commercial-proposal">
  <h1>${proposal.title}</h1>
  <p class="disclaimer">${proposal.disclaimer}</p>
  <h2>Resumen ejecutivo</h2><p>${proposal.executiveSummary}</p>
  <h2>Problemas detectados</h2><ul>${li(proposal.problemsDetected)}</ul>
  <h2>Oportunidades</h2><ul>${li(proposal.opportunities)}</ul>
  <h2>Solución propuesta</h2><p>${proposal.proposedSolution}</p>
  <h2>Módulos incluidos</h2><ul>${li(proposal.includedModules)}</ul>
  <h2>Calendario estimado</h2><p>${proposal.estimatedCalendar}</p>
  <h2>Inversión</h2><p>${proposal.initialInvestment.value} ${proposal.initialInvestment.currency} inicial + ${proposal.monthlyMaintenance.value} ${proposal.monthlyMaintenance.currency}/mes de mantenimiento.</p>
  <h2>Escenarios ROI</h2><ul>${Object.values(proposal.roiScenarios).map((s) => `<li>${s.label}: ${s.totalMonthlyBenefit.value} EUR/mes, ROI 12m ${s.roi12Months.value ?? "sin datos"}%</li>`).join("\n")}</ul>
  <h2>Riesgos</h2><ul>${li(proposal.risks)}</ul>
  <h2>Exclusiones</h2><ul>${li(proposal.exclusions)}</ul>
  <h2>Responsabilidades del cliente</h2><ul>${li(proposal.clientResponsibilities)}</ul>
  <h2>Próximos pasos</h2><ul>${li(proposal.nextSteps)}</ul>
  ${proposal.pendingInformation.length > 0 ? `<h2>Información pendiente de confirmar</h2><ul>${li(proposal.pendingInformation)}</ul>` : ""}
</article>`;
}
