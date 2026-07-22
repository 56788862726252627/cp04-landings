// Paso 15 · Fase 4 — EvidenceAggregator: fusiona los ProviderResult de una
// ejecución del pipeline multiproveedor en una única lista de Evidence
// deduplicada, con un índice de procedencia (evidenceId -> proveedor) y un
// resumen por proveedor (ProviderRunSummary.providers). Reutiliza
// `deduplicateEvidence` de Paso 12 (evidenceDeduper.js) tal cual — no
// reimplementa el hash ni el orden estable.
//
// Regla central (enunciado Paso 15, punto 3): un proveedor stub
// ("not_implemented") NUNCA aporta Evidence real — su resultado se
// refleja solo en el resumen (`providerSummaries`), nunca en `evidence`.
// Los conflictos de contenido entre evidencias YA los detecta
// dimensionRegistry.evaluateAllDimensions (Paso 12, agnóstico de
// proveedor); `buildEvidenceConflictReport` solo añade la atribución de
// qué proveedor aportó cada lado del conflicto, a partir del índice de
// procedencia.

import { deduplicateEvidence } from "../evidenceDeduper.js";

const SECRET_LOOKALIKE = /((sk_live|sk_test|whsec_)[A-Za-z0-9_-]*|AIza[A-Za-z0-9_-]+|xox[baprs]-[A-Za-z0-9-]+|Bearer\s+[A-Za-z0-9._-]{20,}|[A-Za-z0-9_-]{32,})/g;
const MAX_ERROR_MESSAGE_LENGTH = 300;

/** Redacta patrones con pinta de secreto/token y trunca — nunca expone stacks ni rutas internas largas. */
export function sanitizeErrorMessage(message) {
  const text = String(message ?? "").split("\n")[0];
  const redacted = text.replace(SECRET_LOOKALIKE, "[redactado]");
  return redacted.length > MAX_ERROR_MESSAGE_LENGTH ? `${redacted.slice(0, MAX_ERROR_MESSAGE_LENGTH)}…` : redacted;
}

/** Traduce el status interno de ProviderResult (providerPipeline.js) al vocabulario de orquestación del Paso 15. */
export function mapToOrchestratorStatus(providerResultStatus, { blocked = false } = {}) {
  if (blocked) return "blocked";
  switch (providerResultStatus) {
    case "success":
    case "partial":
      return "available";
    case "not_implemented":
      return "unavailable";
    case "failed":
      return "failed";
    case "skipped":
      return "skipped";
    case "timeout":
      return "timed_out";
    case "cancelled":
      return "cancelled";
    default:
      return "unavailable";
  }
}

/**
 * @param {{providerId:string, priority:number, result:object, blocked?:boolean}[]} providerRunEntries
 * @returns {{evidence: object[], provenanceIndex: object, providerSummaries: object[]}}
 */
export function aggregateProviderResults(providerRunEntries) {
  const rawEvidence = [];
  const provenanceIndex = {};
  const providerSummaries = [];

  for (const entry of providerRunEntries) {
    const { providerId, priority, result, blocked = false } = entry;
    const isRealContribution = result.status === "success" || result.status === "partial";

    if (isRealContribution) {
      for (const ev of result.evidence) {
        rawEvidence.push(ev);
        // primera procedencia gana en caso de duplicado exacto (mismo criterio que deduplicateEvidence).
        if (!provenanceIndex[ev.evidenceId]) provenanceIndex[ev.evidenceId] = { providerId, priority, sourceType: ev.sourceType };
      }
    }

    providerSummaries.push({
      providerId,
      priority,
      providerResultStatus: result.status,
      orchestratorStatus: mapToOrchestratorStatus(result.status, { blocked }),
      durationMs: result.durationMs ?? 0,
      evidenceContributed: isRealContribution ? result.evidence.length : 0,
      errors: (result.errors ?? []).map((e) => ({ message: sanitizeErrorMessage(e.message) })),
      limitations: result.metadata?.label ? [`"${result.metadata.label}"`] : [],
    });
  }

  return { evidence: deduplicateEvidence(rawEvidence), provenanceIndex, providerSummaries };
}

/**
 * Cruza los `contradictions` YA calculados por dimensionRegistry con el
 * índice de procedencia, para poder decir QUÉ proveedores aportaron cada
 * lado del conflicto — sin recalcular la detección de contradicciones.
 * @param {object} dimensionResults - salida de evaluateAllDimensions()
 * @param {object} provenanceIndex - de aggregateProviderResults()
 */
export function buildEvidenceConflictReport(dimensionResults, provenanceIndex) {
  const conflicts = [];
  for (const dim of Object.values(dimensionResults)) {
    if (dim.contradictions.length === 0) continue;
    const providersInvolved = [...new Set(dim.evidenceIds.map((id) => provenanceIndex[id]?.providerId).filter(Boolean))];
    conflicts.push({
      dimensionId: dim.dimensionId,
      label: dim.label,
      reason: dim.contradictions.map((c) => c.reason).join("; "),
      evidenceIds: [...dim.evidenceIds],
      providersInvolved,
      confidenceAfterPenalty: dim.confidence,
    });
  }
  return conflicts;
}

/** Fase 5 — "desglose por proveedor": qué dimensiones/cuánta evidencia aportó cada proveedor que sí contribuyó. */
export function buildProviderScoreBreakdown(dimensionResults, provenanceIndex) {
  const byProvider = new Map();
  for (const dim of Object.values(dimensionResults)) {
    for (const evidenceId of dim.evidenceIds) {
      const prov = provenanceIndex[evidenceId];
      if (!prov) continue;
      const bucket = byProvider.get(prov.providerId) ?? { providerId: prov.providerId, evidenceCount: 0, dimensionsContributed: new Set() };
      bucket.evidenceCount += 1;
      bucket.dimensionsContributed.add(dim.dimensionId);
      byProvider.set(prov.providerId, bucket);
    }
  }
  return [...byProvider.values()]
    .map((b) => ({ providerId: b.providerId, evidenceCount: b.evidenceCount, dimensionsContributed: [...b.dimensionsContributed].sort() }))
    .sort((a, b) => a.providerId.localeCompare(b.providerId));
}
