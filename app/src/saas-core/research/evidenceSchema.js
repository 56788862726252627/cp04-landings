// Paso 12 · Fase 7 — Modelo de Evidencia.
//
// Una Evidence es la unidad atómica que produce cada adaptador de fuente
// (ver sourceAdapters.js). Todo hallazgo, contradicción, score o
// recomendación debe poder enlazar a uno o más evidenceId, o quedar
// marcado explícitamente como inferencia/recomendación/dato desconocido
// (ver dimensionRegistry.js). `capturedAt` (no determinista) se mantiene
// SEPARADO de `contentHash` para que dos ejecuciones con el mismo input
// produzcan hashes idénticos (ver ADR en docs/paso-12.../02-evidence-model.md).

import { createHash } from "node:crypto";

export const EVIDENCE_SCHEMA_VERSION = 1;

export const SOURCE_TYPES = Object.freeze([
  "local_html",
  "local_json",
  "local_markdown",
  "fixture_website",
  "mock_directory",
  "mock_maps_listing",
  "mock_social_presence",
  "mock_review_summary",
  "mock_performance",
  "mock_accessibility",
  "mock_seo",
  "mock_technology_detector",
  "mock_competitor",
  "business_intent",
  "business_blueprint",
  "public_website_real", // Paso 13 — proveedor real publicWebsiteFetcher (requiere allowNetwork:true explícito)
]);

/** Nunca "confirmed" salvo que la evidencia venga de una fuente directamente observada. */
export const CLASSIFICATIONS = Object.freeze(["confirmed", "inferred", "recommended", "unknown", "contradictory", "unavailable"]);

export const POLARITIES = Object.freeze(["positive", "negative", "neutral"]);

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

/** sha256 estable sobre el contenido normalizado (nunca sobre timestamps). */
export function hashEvidenceContent(normalizedContent) {
  return createHash("sha256").update(String(normalizedContent ?? ""), "utf8").digest("hex");
}

/**
 * Crea una Evidence determinista (sin `capturedAt`, que se añade aparte
 * como metadata no determinista si el llamador lo necesita).
 * @param {object} input
 * @returns {object} Evidence
 */
export function createEvidence({
  sourceId,
  sourceType,
  sourceRef = null,
  title,
  excerpt,
  normalizedContent,
  language = "es",
  classification = "inferred",
  relatedDimension,
  signal = { strength: 0.5, polarity: "neutral" },
  confidence = 0.5,
  freshness = "unknown",
  provenance,
  limitations = [],
  privacyFlags = [],
  metadata = {},
}) {
  const contentHash = hashEvidenceContent(normalizedContent ?? excerpt ?? title ?? "");
  const evidenceId = `ev_${hashEvidenceContent(`${sourceId}|${relatedDimension}|${contentHash}`).slice(0, 16)}`;
  return Object.freeze({
    schemaVersion: EVIDENCE_SCHEMA_VERSION,
    evidenceId,
    sourceId,
    sourceType,
    sourceRef,
    title,
    contentHash,
    excerpt: String(excerpt ?? "").slice(0, 500),
    normalizedContent: normalizedContent ?? excerpt ?? "",
    language,
    classification,
    relatedDimension,
    signal: Object.freeze({ strength: signal.strength, polarity: signal.polarity }),
    confidence,
    freshness,
    provenance,
    limitations: Object.freeze([...limitations]),
    privacyFlags: Object.freeze([...privacyFlags]),
    contradictionGroup: null,
    metadata: Object.freeze({ ...metadata }),
  });
}

function pushError(errors, path, message) {
  errors.push({ path, message });
}

/**
 * Valida una Evidence. Fail-closed: nunca lanza, siempre {valid, errors}.
 * @param {unknown} evidence
 */
export function validateEvidence(evidence) {
  const errors = [];
  if (!isPlainObject(evidence)) {
    return { valid: false, errors: [{ path: "$", message: "la evidencia debe ser un objeto" }] };
  }
  if (!isNonEmptyString(evidence.evidenceId)) pushError(errors, "evidenceId", "campo obligatorio ausente o vacío");
  if (!isNonEmptyString(evidence.sourceId)) pushError(errors, "sourceId", "campo obligatorio ausente o vacío");
  if (!SOURCE_TYPES.includes(evidence.sourceType)) pushError(errors, "sourceType", `debe ser uno de: ${SOURCE_TYPES.join(", ")}`);
  if (!isNonEmptyString(evidence.contentHash)) pushError(errors, "contentHash", "campo obligatorio ausente o vacío");
  if (!CLASSIFICATIONS.includes(evidence.classification)) pushError(errors, "classification", `debe ser uno de: ${CLASSIFICATIONS.join(", ")}`);
  if (!isNonEmptyString(evidence.relatedDimension)) pushError(errors, "relatedDimension", "campo obligatorio ausente o vacío");
  if (!isPlainObject(evidence.signal) || typeof evidence.signal.strength !== "number" || evidence.signal.strength < 0 || evidence.signal.strength > 1) {
    pushError(errors, "signal.strength", "debe ser un número entre 0 y 1");
  }
  if (!isPlainObject(evidence.signal) || !POLARITIES.includes(evidence.signal.polarity)) {
    pushError(errors, "signal.polarity", `debe ser uno de: ${POLARITIES.join(", ")}`);
  }
  if (typeof evidence.confidence !== "number" || evidence.confidence < 0 || evidence.confidence > 1) {
    pushError(errors, "confidence", "debe ser un número entre 0 y 1");
  }
  return { valid: errors.length === 0, errors };
}

/** Clave de deduplicación estable: mismo sourceId + mismo contentHash = misma evidencia. */
export function evidenceDedupeKey(evidence) {
  return `${evidence.sourceId}::${evidence.contentHash}`;
}

/** Orden estable y determinista para serialización (por dedupeKey, no por timestamp). */
export function sortEvidenceStable(evidenceList) {
  return [...evidenceList].sort((a, b) => evidenceDedupeKey(a).localeCompare(evidenceDedupeKey(b)));
}
