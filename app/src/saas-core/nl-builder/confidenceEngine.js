// Paso 11 · Fase "F" — Motor de confianza.
//
// Puntúa, de 0 a 1, cuánto se apoya cada sección del Business Intent en
// señales reales del texto de entrada frente a defaults/heurísticas. Nunca
// es una probabilidad calibrada: es una heurística determinista y
// explicable (misma entrada ⇒ misma puntuación, siempre con una razón
// legible). Los redondeos son fijos a 2 decimales para que la salida sea
// estable entre ejecuciones (nunca ruido de punto flotante).

export const CONFIDENCE_THRESHOLDS = Object.freeze({
  low: 0.4,
  medium: 0.7,
});

function clamp01(n) {
  return Math.max(0, Math.min(1, n));
}

function round2(n) {
  return Math.round(clamp01(n) * 100) / 100;
}

function sectorConfidence(sectorMatch) {
  if (sectorMatch.matchedKeywords <= 0) return { score: 0.25, reason: "no se detectó ninguna palabra clave de sector; se usó el sector genérico" };
  const score = round2(0.55 + 0.13 * Math.min(sectorMatch.matchedKeywords, 3));
  return { score, reason: `${sectorMatch.matchedKeywords} coincidencia(s) de palabra clave para "${sectorMatch.preset.label}"` };
}

function modulesConfidence(resolvedModules) {
  const enabled = resolvedModules.filter((m) => m.status === "enabled");
  if (enabled.length === 0) return { score: 0.3, reason: "ningún módulo habilitado" };
  const avg = enabled.reduce((acc, m) => acc + m.confidence, 0) / enabled.length;
  return { score: round2(avg), reason: `promedio de confianza de ${enabled.length} módulo(s) habilitado(s)` };
}

function brandingConfidence(lowerText) {
  const hasHint = /premium|marca|branding|paleta|colores|tono/.test(lowerText);
  return hasHint
    ? { score: 0.65, reason: "el texto menciona explícitamente marca/branding/tono" }
    : { score: 0.4, reason: "branding no mencionado explícitamente; se usan valores por defecto seguros" };
}

/**
 * @param {{sectorMatch: object, resolvedModules: object[], ambiguities: {blocking: boolean}[], lowerText: string}} input
 * @returns {{overall: number, bySection: Record<string, number>, explanations: Record<string, string>}}
 */
export function computeConfidence({ sectorMatch, resolvedModules, ambiguities, lowerText }) {
  const sector = sectorConfidence(sectorMatch);
  const modules = modulesConfidence(resolvedModules);
  const branding = brandingConfidence(lowerText);

  const blockingCount = (ambiguities || []).filter((a) => a.blocking).length;
  const ambiguityPenalty = Math.min(0.05 * blockingCount, 0.3);

  const weighted = sector.score * 0.35 + modules.score * 0.4 + branding.score * 0.25;
  const overall = round2(weighted - ambiguityPenalty);

  return {
    overall,
    bySection: {
      sector: sector.score,
      modules: modules.score,
      branding: branding.score,
    },
    explanations: {
      sector: sector.reason,
      modules: modules.reason,
      branding: branding.reason,
      overall: blockingCount > 0
        ? `media ponderada de secciones, penalizada por ${blockingCount} ambigüedad(es) bloqueante(s)`
        : "media ponderada de secciones (sector 35% · módulos 40% · branding 25%)",
    },
  };
}

export function confidenceLevel(overall) {
  if (overall < CONFIDENCE_THRESHOLDS.low) return "baja";
  if (overall < CONFIDENCE_THRESHOLDS.medium) return "media";
  return "alta";
}
