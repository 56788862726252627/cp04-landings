// Paso 12 · Fase 7 — Deduplicación y orden estable de evidencia.

import { evidenceDedupeKey, sortEvidenceStable } from "./evidenceSchema.js";

/**
 * Elimina evidencias duplicadas (mismo sourceId+contentHash) preservando
 * la primera aparición, y devuelve el resultado en orden estable.
 * Determinista: no depende del orden de entrada para el resultado final.
 */
export function deduplicateEvidence(evidenceList) {
  const seen = new Map();
  for (const evidence of evidenceList) {
    const key = evidenceDedupeKey(evidence);
    if (!seen.has(key)) seen.set(key, evidence);
  }
  return sortEvidenceStable([...seen.values()]);
}
