// Paso 12 · Fase 4 — Research Request: descriptor de entrada versionado.
//
// Sigue el mismo patrón fail-closed de businessIntentSchema.js/
// businessBlueprintSchema.js: validate() nunca lanza, siempre
// {valid, errors}; requestId es determinista (hash del contenido
// relevante, nunca de un timestamp); migrateResearchRequest() deja lista
// la ruta de migración de versión futura.

import { createHash } from "node:crypto";

export const RESEARCH_REQUEST_SCHEMA_VERSION = 1;

// "offline" y "online" existen desde Paso 12. Paso 13 añade "public-web"
// (usa el proveedor real publicWebsiteFetcher para las URLs declaradas) y
// "hybrid" (fixtures/archivos locales + URLs reales) — ambos requieren
// ADEMÁS la bandera de tiempo de ejecución allowNetwork:true
// (auditOrchestrator.js); sin ella, cualquier modo se comporta como
// offline para las URLs (evidencia "unavailable"), nunca conecta por sí solo.
export const RESEARCH_MODES = Object.freeze(["offline", "online", "public-web", "hybrid"]);

export const REQUESTED_DIMENSIONS_WILDCARD = "*";

const SECRET_LOOKALIKE = /(sk_live|sk_test|whsec_|AIza|xox[baprs]-|Bearer [A-Za-z0-9._-]{20,})/;

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}
function isStringArray(value) {
  return Array.isArray(value) && value.every((v) => typeof v === "string");
}

function pushError(errors, path, message) {
  errors.push({ path, message });
}

const TOP_LEVEL_FIELDS = Object.freeze([
  "schemaVersion",
  "requestId",
  "mode",
  "language",
  "locale",
  "country",
  "timezone",
  "seed",
  "business",
  "inputs",
  "objectives",
  "requestedDimensions",
  "excludedDimensions",
  "sourcePolicy",
  "crawlPolicy",
  "privacyPolicy",
  "limits",
  "expectedOutputs",
  "metadata",
]);

const REQUIRED_TOP_LEVEL_FIELDS = Object.freeze(["schemaVersion", "requestId", "mode", "language", "business"]);

const BUSINESS_REQUIRED_FIELDS = Object.freeze(["name", "sector"]);
const BUSINESS_ALLOWED_FIELDS = Object.freeze(["name", "sector", "subsector", "location", "domains", "aliases"]);

const INPUTS_ALLOWED_FIELDS = Object.freeze(["urls", "localFiles", "snapshots", "fixtures", "businessIntent", "businessBlueprint", "competitors"]);

const LIMITS_ALLOWED_FIELDS = Object.freeze(["maxSources", "maxDepth", "maxContentLength", "timeoutMs", "rateLimitPerMinute"]);

const DEFAULT_LIMITS = Object.freeze({ maxSources: 20, maxDepth: 2, maxContentLength: 200_000, timeoutMs: 5000, rateLimitPerMinute: 30 });

function validateBusinessSection(business, errors) {
  if (!isPlainObject(business)) {
    pushError(errors, "business", "business debe ser un objeto");
    return;
  }
  for (const key of Object.keys(business)) {
    if (!BUSINESS_ALLOWED_FIELDS.includes(key)) pushError(errors, `business.${key}`, "propiedad de business desconocida");
  }
  for (const field of BUSINESS_REQUIRED_FIELDS) {
    if (!isNonEmptyString(business[field])) pushError(errors, `business.${field}`, "campo obligatorio ausente o vacío");
  }
  if (business.domains !== undefined && !isStringArray(business.domains)) pushError(errors, "business.domains", "domains debe ser un array de strings");
  if (business.aliases !== undefined && !isStringArray(business.aliases)) pushError(errors, "business.aliases", "aliases debe ser un array de strings");
}

function validateInputsSection(inputs, errors) {
  if (inputs === undefined) return;
  if (!isPlainObject(inputs)) {
    pushError(errors, "inputs", "inputs debe ser un objeto");
    return;
  }
  for (const key of Object.keys(inputs)) {
    if (!INPUTS_ALLOWED_FIELDS.includes(key)) pushError(errors, `inputs.${key}`, "propiedad de inputs desconocida");
  }
  for (const listField of ["urls", "localFiles", "snapshots", "fixtures", "competitors"]) {
    if (inputs[listField] !== undefined && !isStringArray(inputs[listField])) pushError(errors, `inputs.${listField}`, `${listField} debe ser un array de strings (rutas o URLs)`);
  }
}

function validateLimits(limits, errors) {
  if (limits === undefined) return;
  if (!isPlainObject(limits)) {
    pushError(errors, "limits", "limits debe ser un objeto");
    return;
  }
  for (const key of Object.keys(limits)) {
    if (!LIMITS_ALLOWED_FIELDS.includes(key)) pushError(errors, `limits.${key}`, "propiedad de limits desconocida");
  }
  for (const [key, value] of Object.entries(limits)) {
    if (typeof value !== "number" || value <= 0) pushError(errors, `limits.${key}`, "debe ser un número positivo");
  }
}

/**
 * Valida un Research Request. Fail-closed: nunca lanza.
 * @param {unknown} request
 * @returns {{valid: boolean, errors: {path: string, message: string}[]}}
 */
export function validateResearchRequest(request) {
  const errors = [];
  if (!isPlainObject(request)) {
    return { valid: false, errors: [{ path: "$", message: "el Research Request debe ser un objeto" }] };
  }

  for (const key of Object.keys(request)) {
    if (!TOP_LEVEL_FIELDS.includes(key)) pushError(errors, key, "propiedad de nivel superior desconocida");
  }
  for (const field of REQUIRED_TOP_LEVEL_FIELDS) {
    if (request[field] === undefined || request[field] === null) pushError(errors, field, "campo obligatorio ausente");
  }

  if (request.schemaVersion !== undefined && request.schemaVersion !== RESEARCH_REQUEST_SCHEMA_VERSION) {
    pushError(errors, "schemaVersion", `versión de esquema no soportada (esperado ${RESEARCH_REQUEST_SCHEMA_VERSION}; usa migrateResearchRequest())`);
  }
  if (request.requestId !== undefined && !isNonEmptyString(request.requestId)) pushError(errors, "requestId", "requestId no puede estar vacío");
  if (request.mode !== undefined && !RESEARCH_MODES.includes(request.mode)) pushError(errors, "mode", `mode debe ser uno de: ${RESEARCH_MODES.join(", ")}`);
  if (request.language !== undefined && !isNonEmptyString(request.language)) pushError(errors, "language", "language no puede estar vacío");
  if (request.seed !== undefined && !isNonEmptyString(String(request.seed))) pushError(errors, "seed", "seed no puede estar vacío");

  if (request.business !== undefined) validateBusinessSection(request.business, errors);
  else pushError(errors, "business", "campo obligatorio ausente");

  validateInputsSection(request.inputs, errors);
  validateLimits(request.limits, errors);

  for (const listField of ["objectives", "requestedDimensions", "excludedDimensions", "expectedOutputs"]) {
    if (request[listField] !== undefined && !isStringArray(request[listField]) && request[listField] !== REQUESTED_DIMENSIONS_WILDCARD) {
      pushError(errors, listField, `${listField} debe ser un array de strings (o "${REQUESTED_DIMENSIONS_WILDCARD}" para requestedDimensions)`);
    }
  }

  for (const objectField of ["sourcePolicy", "crawlPolicy", "privacyPolicy", "metadata"]) {
    if (request[objectField] !== undefined && !isPlainObject(request[objectField])) pushError(errors, objectField, `${objectField} debe ser un objeto`);
  }

  const flat = JSON.stringify(request);
  if (SECRET_LOOKALIKE.test(flat)) {
    pushError(errors, "$", "el Research Request parece contener un secreto o credencial");
  }

  return { valid: errors.length === 0, errors };
}

export function assertValidResearchRequest(request) {
  const { valid, errors } = validateResearchRequest(request);
  if (!valid) throw new Error(`Research Request inválido:\n${errors.map((e) => `  - ${e.path}: ${e.message}`).join("\n")}`);
  return request;
}

/** requestId determinista: hash del contenido relevante (sin timestamps). */
export function computeRequestId({ business, inputs, seed }) {
  const canonical = JSON.stringify({ business, inputs, seed: seed ?? "default-seed" });
  return `req_${createHash("sha256").update(canonical, "utf8").digest("hex").slice(0, 16)}`;
}

/**
 * Construye un Research Request completo con defaults seguros
 * (mode=offline, límites conservadores, requestId determinista).
 */
export function buildResearchRequest(partial) {
  const seed = partial.seed ?? "default-seed";
  const business = partial.business ?? {};
  const inputs = partial.inputs ?? {};
  const requestId = partial.requestId ?? computeRequestId({ business, inputs, seed });
  return {
    schemaVersion: RESEARCH_REQUEST_SCHEMA_VERSION,
    requestId,
    mode: partial.mode ?? "offline",
    language: partial.language ?? "es",
    locale: partial.locale ?? "es-ES",
    country: partial.country ?? "ES",
    timezone: partial.timezone ?? "Europe/Madrid",
    seed,
    business,
    inputs,
    objectives: partial.objectives ?? [],
    requestedDimensions: partial.requestedDimensions ?? REQUESTED_DIMENSIONS_WILDCARD,
    excludedDimensions: partial.excludedDimensions ?? [],
    sourcePolicy: partial.sourcePolicy ?? {},
    crawlPolicy: partial.crawlPolicy ?? {},
    privacyPolicy: partial.privacyPolicy ?? {},
    limits: { ...DEFAULT_LIMITS, ...(partial.limits ?? {}) },
    expectedOutputs: partial.expectedOutputs ?? ["executive", "technical", "commercial"],
    metadata: partial.metadata ?? {},
  };
}

/** Migración de versión: legacy (sin schemaVersion) -> v1 actual, sin más cambios. */
export function migrateResearchRequest(raw) {
  if (!isPlainObject(raw)) throw new Error("migrateResearchRequest requiere un objeto");
  const notes = [];
  const working = { ...raw };
  if (working.schemaVersion === undefined) {
    working.schemaVersion = RESEARCH_REQUEST_SCHEMA_VERSION;
    notes.push("legacy→v1: schemaVersion asignado explícitamente");
  }
  if (working.schemaVersion !== RESEARCH_REQUEST_SCHEMA_VERSION) {
    throw new Error(`No hay ruta de migración conocida desde schemaVersion=${raw.schemaVersion} hasta ${RESEARCH_REQUEST_SCHEMA_VERSION}`);
  }
  return { request: working, migrated: notes.length > 0, notes };
}
