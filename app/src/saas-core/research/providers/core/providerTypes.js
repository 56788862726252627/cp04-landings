// Paso 14 · Fase 1 — Tipos y fábricas del sistema multiproveedor.
//
// Generaliza el contrato de proveedor de Paso 13 (`publicWebsiteFetcher`)
// para soportar N proveedores (reales o stub) bajo una misma interfaz,
// sin modificar la implementación real existente — solo se abstrae
// (ver providers/plugins/publicWebsiteFetcherPlugin.js).

export const PROVIDER_STATUSES = Object.freeze(["real", "stub", "disabled"]);

export const DEFAULT_PROVIDER_PRIORITY = 50;

/**
 * ProviderCapabilities: lo que un proveedor declara poder producir.
 * `dimensions` son ids del registro de 45 dimensiones de Paso 12 (o "*"
 * para "cualquiera", como ya usaban varios adaptadores offline).
 */
export function defineProviderCapabilities({ dimensions = ["*"], categories = [] } = {}) {
  return Object.freeze({ dimensions: Object.freeze([...dimensions]), categories: Object.freeze([...categories]) });
}

/**
 * ProviderHealth: resultado normalizado de un healthCheck().
 */
export function defineProviderHealth({ healthy, mode, message, checkedCapability = null }) {
  return Object.freeze({ healthy: Boolean(healthy), mode, message, checkedCapability });
}

/**
 * ProviderResult: envoltorio uniforme de lo que devuelve `collect()`,
 * independientemente de si el proveedor es real o stub.
 */
export function defineProviderResult({ providerId, status, evidence = [], errors = [], durationMs = 0, metadata = {} }) {
  if (!["success", "partial", "failed", "not_implemented", "skipped", "timeout", "cancelled"].includes(status)) {
    throw new Error(`ProviderResult.status desconocido: "${status}"`);
  }
  return Object.freeze({
    providerId,
    status,
    evidence: Object.freeze([...evidence]),
    errors: Object.freeze([...errors]),
    durationMs,
    metadata: Object.freeze({ ...metadata }),
  });
}

/**
 * ProviderEvidence: azúcar sintáctico sobre `createEvidence` (Paso 12)
 * para que los proveedores stub no necesiten conocer evidenceSchema.js
 * directamente — mismo contrato, mismo hashing determinista.
 */
export function defineProviderEvidencePlaceholder({ providerId, dimension, note }) {
  return Object.freeze({
    sourceId: providerId,
    sourceType: "provider_stub",
    title: `${providerId}: no implementado`,
    excerpt: note || `El proveedor "${providerId}" es un stub preparado; no produce evidencia real todavía.`,
    relatedDimension: dimension,
    classification: "unknown",
    signal: Object.freeze({ strength: 0, polarity: "neutral" }),
    confidence: 0,
  });
}

/**
 * Define un ResearchProvider completo. Todos los campos son explícitos y
 * congelados — evita que un plugin registre un objeto a medias.
 * @param {{id:string, version?:number, status:string, capabilities:object, priority?:number, credentialsNeeded?:string[], limitations?:string[], collect: Function, healthCheck?: Function}} def
 */
export function defineResearchProvider(def) {
  if (!def || typeof def.id !== "string" || def.id.trim().length === 0) {
    throw new Error("defineResearchProvider requiere un `id` no vacío");
  }
  if (!PROVIDER_STATUSES.includes(def.status)) {
    throw new Error(`defineResearchProvider("${def.id}"): status inválido "${def.status}" (usa: ${PROVIDER_STATUSES.join(", ")})`);
  }
  if (typeof def.collect !== "function") {
    throw new Error(`defineResearchProvider("${def.id}") requiere collect(input, options)`);
  }
  return Object.freeze({
    id: def.id,
    version: def.version ?? 1,
    status: def.status,
    capabilities: def.capabilities ?? defineProviderCapabilities(),
    priority: def.priority ?? DEFAULT_PROVIDER_PRIORITY,
    credentialsNeeded: Object.freeze([...(def.credentialsNeeded ?? [])]),
    limitations: Object.freeze([...(def.limitations ?? [])]),
    enabledByDefault: def.enabledByDefault ?? true,
    collect: def.collect,
    healthCheck: def.healthCheck ?? (async () => defineProviderHealth({ healthy: def.status !== "disabled", mode: def.status, message: `${def.id}: sin healthCheck propio, estado declarado "${def.status}"` })),
  });
}

/**
 * Fábrica compartida para los 12 proveedores stub de Fase 3: todos
 * comparten la misma forma (nunca hacen red, siempre devuelven
 * ProviderResult status="not_implemented" con evidencia placeholder por
 * dimensión declarada), evitando duplicar boilerplate en 12 archivos.
 */
export function defineStubProvider({ id, label, capabilities, priority, credentialsNeeded = [], limitations = [], docsNote }) {
  return defineResearchProvider({
    id,
    status: "stub",
    capabilities,
    priority,
    credentialsNeeded,
    limitations: [`"${label}" es un contrato preparado (stub): no realiza ninguna llamada real todavía.`, ...limitations],
    async collect() {
      const dims = capabilities.dimensions.includes("*") ? [] : capabilities.dimensions;
      const evidence = dims.map((dimension) => ({ ...defineProviderEvidencePlaceholder({ providerId: id, dimension, note: docsNote }) }));
      return defineProviderResult({ providerId: id, status: "not_implemented", evidence, metadata: { label, docsNote } });
    },
    async healthCheck() {
      return defineProviderHealth({ healthy: true, mode: "stub", message: `"${id}" es un stub preparado y documentado; requiere implementación real antes de producir evidencia.` });
    },
  });
}
