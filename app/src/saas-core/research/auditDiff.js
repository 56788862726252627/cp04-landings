// Paso 12 · Fase 18/19 — Diff entre dos auditorías.
//
// Compara dos AuditResult (p.ej. una reauditoría tras aplicar
// recomendaciones) por score, recomendaciones y evidencia. Puro,
// determinista, no lee ni escribe nada.

function diffScores(before, after) {
  const categories = new Set([...Object.keys(before.categories), ...Object.keys(after.categories)]);
  const categoryDeltas = {};
  for (const category of categories) {
    const b = before.categories[category]?.score ?? null;
    const a = after.categories[category]?.score ?? null;
    categoryDeltas[category] = { before: b, after: a, delta: b !== null && a !== null ? a - b : null };
  }
  return {
    global: { before: before.global.score, after: after.global.score, delta: before.global.score !== null && after.global.score !== null ? after.global.score - before.global.score : null },
    categories: categoryDeltas,
  };
}

function diffRecommendations(before, after) {
  const beforeIds = new Set(before.map((r) => r.recommendationId));
  const afterIds = new Set(after.map((r) => r.recommendationId));
  return {
    added: after.filter((r) => !beforeIds.has(r.recommendationId)).map((r) => r.recommendationId),
    resolved: before.filter((r) => !afterIds.has(r.recommendationId)).map((r) => r.recommendationId),
    stillOpen: after.filter((r) => beforeIds.has(r.recommendationId)).map((r) => r.recommendationId),
  };
}

function diffEvidence(before, after) {
  const beforeIds = new Set(before.map((e) => e.evidenceId));
  const afterIds = new Set(after.map((e) => e.evidenceId));
  return {
    added: after.filter((e) => !beforeIds.has(e.evidenceId)).map((e) => e.evidenceId),
    removed: before.filter((e) => !afterIds.has(e.evidenceId)).map((e) => e.evidenceId),
  };
}

/**
 * Compara dos auditorías. Determinista: mismo input -> mismo diff.
 * @param {object} before - AuditResult anterior
 * @param {object} after - AuditResult posterior
 */
export function diffAudits(before, after) {
  return Object.freeze({
    requestIds: { before: before.requestId, after: after.requestId },
    scores: diffScores(before.scores, after.scores),
    recommendations: diffRecommendations(before.recommendations, after.recommendations),
    evidence: diffEvidence(before.evidence, after.evidence),
    summary:
      after.scores.global.score !== null && before.scores.global.score !== null
        ? `Score global: ${before.scores.global.score} → ${after.scores.global.score} (${after.scores.global.score >= before.scores.global.score ? "+" : ""}${after.scores.global.score - before.scores.global.score})`
        : "No se puede comparar el score global: falta en una de las dos auditorías.",
  });
}

export function renderAuditDiffMarkdown(diff) {
  const lines = ["# Diff entre auditorías", "", diff.summary, "", "## Cambios por categoría", "", "| Categoría | Antes | Después | Delta |", "|---|---|---|---|"];
  for (const [category, d] of Object.entries(diff.scores.categories)) {
    lines.push(`| ${category} | ${d.before ?? "—"} | ${d.after ?? "—"} | ${d.delta ?? "—"} |`);
  }
  lines.push("", "## Recomendaciones", `- Nuevas: ${diff.recommendations.added.join(", ") || "ninguna"}`, `- Resueltas: ${diff.recommendations.resolved.join(", ") || "ninguna"}`, `- Siguen abiertas: ${diff.recommendations.stillOpen.join(", ") || "ninguna"}`);
  return lines.join("\n") + "\n";
}
