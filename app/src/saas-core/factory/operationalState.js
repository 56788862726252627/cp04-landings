// Prompt Agencia IA 4/7 — Modelo de estado operativo normalizado para
// negocios generados por la fábrica SaaS. Puro (sin I/O): recibe datos ya
// calculados (informe de generación existente + matriz de integraciones de
// `commercial/integrationReadiness.js`, Paso 20) y deriva qué estados
// operativos aplican. Los 8 estados NO son una escalera lineal: "generado"
// nunca implica "listo para producción", y varios pueden coexistir (p. ej.
// "integrationReady" + "manualActionRequired" al mismo tiempo).

export const OPERATIONAL_STATES = Object.freeze([
  "generated",
  "validated",
  "dryRunReady",
  "integrationReady",
  "productionReady",
  "blocked",
  "degraded",
  "manualActionRequired",
]);

export const READINESS_CLASSIFICATIONS = Object.freeze(["A", "B", "C"]);

const STATUSES_NOT_PRODUCTION = Object.freeze(["READY_FOR_PRODUCTION", "PRODUCTION"]);
const STATUSES_MEANING_CREDENTIALS_STILL_PENDING = Object.freeze(["NOT_CONFIGURED", "READY_FOR_CREDENTIALS", "MOCK"]);

/**
 * @param {object} params
 * @param {string[]} [params.risks] - `risks` del report.json de generación (Paso 10, Fase 10)
 * @param {string[]} [params.manualSteps] - `manualSteps` del mismo report.json
 * @param {string[]} [params.declaredIntegrationIds] - ids de `INTEGRATION_IDS` (Paso 20) que este
 *   negocio concreto declara usar (derivados de `tenantConfig.integrations`), no todos los 11 posibles
 * @param {Record<string, object>} [params.integrationsById] - `computeIntegrationReadiness(...).integrations`
 */
export function computeOperationalStates({ risks = [], manualSteps = [], declaredIntegrationIds = [], integrationsById = {} } = {}) {
  const declared = declaredIntegrationIds.map((id) => integrationsById[id]).filter(Boolean);
  const allEntries = Object.values(integrationsById);

  const anyErrorAnywhere = allEntries.some((i) => i.status === "ERROR");
  const declaredDegraded = declared.filter((i) => i.status === "DEGRADED");
  const declaredBlocked = declared.filter((i) => i.blockedBy !== null);
  const declaredNotProductionReady = declared.filter((i) => !STATUSES_NOT_PRODUCTION.includes(i.status));
  const declaredCredentialsPending = declared.filter((i) => STATUSES_MEANING_CREDENTIALS_STILL_PENDING.includes(i.status));

  const validated = risks.length === 0;
  const dryRunReady = !anyErrorAnywhere;
  // Sin integraciones declaradas, "integrationReady" es vacuamente cierto: no hay nada que bloquee
  // el modo dry-run/demo por falta de integraciones (mismo criterio que un `every` sobre conjunto vacío).
  const integrationReady = declared.every((i) => i.status !== "NOT_CONFIGURED" && i.status !== "ERROR");
  const productionReady = validated && integrationReady && declaredNotProductionReady.length === 0 && manualSteps.length === 0;
  const blocked = declaredBlocked.length > 0;
  const degraded = risks.length > 0 || declaredDegraded.length > 0;
  const manualActionRequired = manualSteps.length > 0 || declaredCredentialsPending.length > 0;

  const active = ["generated"];
  if (validated) active.push("validated");
  if (dryRunReady) active.push("dryRunReady");
  if (integrationReady) active.push("integrationReady");
  if (productionReady) active.push("productionReady");
  if (blocked) active.push("blocked");
  if (degraded) active.push("degraded");
  if (manualActionRequired) active.push("manualActionRequired");

  return Object.freeze({
    generated: true,
    validated,
    dryRunReady,
    integrationReady,
    productionReady,
    blocked,
    degraded,
    manualActionRequired,
    active: Object.freeze(active),
    reasons: Object.freeze({
      blockedBy: Object.freeze(declaredBlocked.map((i) => ({ id: i.id, label: i.label, blockedBy: i.blockedBy }))),
      degradedBy: Object.freeze([
        ...risks.map((r) => ({ source: "risk", detail: r })),
        ...declaredDegraded.map((i) => ({ source: "integration", id: i.id, label: i.label })),
      ]),
      manualActionsPending: Object.freeze([...manualSteps]),
      credentialsPending: Object.freeze(declaredCredentialsPending.map((i) => ({ id: i.id, label: i.label, credentialsNeeded: [...i.credentialsNeeded] }))),
      notProductionReady: Object.freeze(declaredNotProductionReady.map((i) => ({ id: i.id, label: i.label, status: i.status }))),
    }),
  });
}

/**
 * Clasifica el estado operativo en A/B/C según el enunciado del Prompt 4/7.
 * `scope` distingue el alcance declarado del negocio: "dryRun" (por defecto —
 * demo/piloto sin proveedores reales) vs "production" (todas las integraciones
 * declaradas deben estar en producción real). Sin `scope` explícito NUNCA se
 * asume producción — sería una afirmación falsa de preparación.
 * @param {ReturnType<typeof computeOperationalStates>} states
 * @param {{scope?: "dryRun"|"production"}} [options]
 */
export function classifyReadiness(states, { scope = "dryRun" } = {}) {
  if (scope !== "dryRun" && scope !== "production") {
    throw new Error(`classifyReadiness: scope desconocido "${scope}". Usa "dryRun" o "production".`);
  }

  const missing = [];
  for (const b of states.reasons.blockedBy) missing.push(`Bloqueo: ${b.label} — ${b.blockedBy}`);
  for (const c of states.reasons.credentialsPending) missing.push(`Credencial pendiente: ${c.label} (${c.credentialsNeeded.join(", ") || "sin variables declaradas"})`);
  for (const m of states.reasons.manualActionsPending) missing.push(`Acción manual: ${m}`);
  for (const d of states.reasons.degradedBy) missing.push(d.source === "risk" ? `Riesgo: ${d.detail}` : `Degradado: ${d.label}`);
  if (scope === "production") {
    for (const n of states.reasons.notProductionReady) missing.push(`Sin producción: ${n.label} (estado actual: ${n.status})`);
  }

  if (scope === "dryRun") {
    // "blocked"/"!dryRunReady" son bloqueos reales (algo concreto lo impide).
    // "!validated" (riesgo estructural: contraste/terminología/normativa) es
    // degradación, no bloqueo — el demo sigue siendo usable, por eso NO
    // escala a C por sí solo (coherente con el estado "degraded").
    if (states.blocked || !states.dryRunReady) {
      return { classification: "C", scope, missing, nextStep: "Resolver los bloqueos/riesgos listados antes de considerar este negocio operativo, incluso en modo demo." };
    }
    if (!states.validated || states.degraded || states.manualActionRequired) {
      return { classification: "B", scope, missing, nextStep: "El modo demo/dry-run funciona; completar las acciones manuales y credenciales listadas para avanzar de fase." };
    }
    return { classification: "A", scope, missing: [], nextStep: "Operativo para el alcance demo/dry-run declarado. Para producción real, repetir esta clasificación con scope=\"production\"." };
  }

  // scope === "production"
  if (states.blocked || !states.integrationReady) {
    return { classification: "C", scope, missing, nextStep: "Resolver los bloqueos de integración (credenciales/contratación/cuotas) antes de intentar producción real." };
  }
  if (!states.productionReady) {
    return { classification: "B", scope, missing, nextStep: "Las integraciones declaradas responden, pero falta al menos una en estado de producción real o queda una acción manual pendiente." };
  }
  return { classification: "A", scope, missing: [], nextStep: "Operativo para producción según el alcance declarado. Repetir la validación tras cualquier cambio de credenciales." };
}
