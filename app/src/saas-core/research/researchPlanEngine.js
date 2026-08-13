// Paso 12 · Fase 5 — Research Plan Engine.
//
// Construye un plan EXPLICABLE a partir de un Research Request + preset
// sectorial: qué se va a intentar averiguar, con qué fuentes/adaptadores,
// en qué orden, con qué límites y con qué criterio de parada. El plan NO
// ejecuta nada (ver auditOrchestrator.js): es la fase "→ Build Research
// Plan →" del pipeline del enunciado.

import { DIMENSION_IDS } from "./dimensionRegistry.js";
import { getSectorAuditPreset, GENERIC_AUDIT_PRESET } from "./sectorAuditPresets.js";
import { evaluatePolicy } from "./researchPolicy.js";

export const PIPELINE_STAGES = Object.freeze([
  "normalize_request",
  "validate_policy",
  "build_plan",
  "select_adapters",
  "collect_evidence",
  "sanitize",
  "deduplicate",
  "normalize_evidence",
  "analyze_dimensions",
  "detect_contradictions",
  "calculate_scores",
  "generate_findings",
  "generate_recommendations",
  "map_automations",
  "optional_intent_enrichment",
  "optional_blueprint_enrichment",
  "generate_reports",
  "compare",
  "validate",
  "persist_controlled_artifacts",
]);

function classifyLocalFileAdapter(filePath) {
  const lower = filePath.toLowerCase();
  if (lower.endsWith(".json")) return "local_json";
  if (lower.endsWith(".md") || lower.endsWith(".markdown")) return "local_markdown";
  return "local_html";
}

function resolveDimensions(request) {
  const requested = request.requestedDimensions === "*" || request.requestedDimensions === undefined ? DIMENSION_IDS : request.requestedDimensions;
  const excluded = new Set(request.excludedDimensions ?? []);
  return requested.filter((id) => DIMENSION_IDS.includes(id) && !excluded.has(id));
}

/**
 * Construye el Research Plan. Determinista: mismo request+preset -> mismo
 * plan (sin timestamps ni aleatoriedad).
 * @param {object} request - Research Request validado
 * @returns {object} plan
 */
export function buildResearchPlan(request) {
  const preset = getSectorAuditPreset(request.business?.sector) ?? GENERIC_AUDIT_PRESET;
  const policy = evaluatePolicy(request);
  const dimensions = resolveDimensions(request);

  const selectedAdapters = new Set();
  if ((request.inputs?.urls?.length ?? 0) > 0) selectedAdapters.add(request.mode === "offline" ? "fixture_website" : "local_html");
  for (const filePath of request.inputs?.localFiles ?? []) selectedAdapters.add(classifyLocalFileAdapter(filePath));
  if ((request.inputs?.fixtures?.length ?? 0) > 0) {
    for (const id of ["fixture_website", "mock_directory", "mock_maps_listing", "mock_social_presence", "mock_review_summary", "mock_performance", "mock_accessibility", "mock_seo", "mock_technology_detector"]) {
      selectedAdapters.add(id);
    }
  }
  if ((request.inputs?.competitors?.length ?? 0) > 0) selectedAdapters.add("mock_competitor");

  const hasAnyInput = (request.inputs?.urls?.length ?? 0) + (request.inputs?.localFiles?.length ?? 0) + (request.inputs?.fixtures?.length ?? 0) > 0;

  const objectives = [...(request.objectives ?? []), `Evaluar la madurez digital de "${request.business?.name}" (sector: ${request.business?.sector}) a partir de fuentes públicas o locales autorizadas.`];

  const questions = [
    "¿Qué propuesta de valor comunica el negocio y a quién se dirige?",
    "¿Existe capacidad de reserva/cita online observable?",
    "¿Qué madurez digital, SEO, accesibilidad y rendimiento son observables?",
    "¿Qué reputación pública y prueba social existen?",
    ...preset.priorityDimensions.map((id) => `¿Cómo se encuentra la dimensión prioritaria "${id}" para este sector?`),
  ];

  const hypotheses = hasAnyInput
    ? ["El negocio tiene al menos una presencia digital evaluable a partir de las fuentes proporcionadas."]
    : ["Sin fuentes proporcionadas, la mayoría de dimensiones quedarán como 'unknown' por falta de datos (esperado, no un error)."];

  return Object.freeze({
    requestId: request.requestId,
    sectorPresetId: preset.presetId,
    objectives: Object.freeze(objectives),
    questions: Object.freeze(questions),
    hypotheses: Object.freeze(hypotheses),
    possibleSources: Object.freeze({
      urls: Object.freeze([...(request.inputs?.urls ?? [])]),
      localFiles: Object.freeze([...(request.inputs?.localFiles ?? [])]),
      fixtures: Object.freeze([...(request.inputs?.fixtures ?? [])]),
      competitors: Object.freeze([...(request.inputs?.competitors ?? [])]),
    }),
    selectedAdapters: Object.freeze([...selectedAdapters].sort()),
    dimensions: Object.freeze(dimensions),
    priorityDimensions: Object.freeze(preset.priorityDimensions),
    order: PIPELINE_STAGES,
    limits: Object.freeze({ ...policy.limits }),
    risks: Object.freeze([...preset.risksToWatch, ...(hasAnyInput ? [] : ["Sin fuentes de entrada: la auditoría producirá mayormente 'unknown', no conclusiones falsas."])]),
    expectedCoverage: hasAnyInput ? "parcial-a-alta según número de fuentes" : "mínima (sin fuentes)",
    sufficiencyCriteria: "Al menos 1 evidencia por dimensión prioritaria del sector para considerar la auditoría 'suficiente'; el resto puede quedar 'unknown'.",
    stopCriteria: `Se detiene tras procesar todas las fuentes declaradas en el Research Request (máx. ${policy.limits.maxSources}); nunca sigue enlaces ni amplía el alcance por sí sola.`,
    fallback: "Ante un adaptador fallido o fuente inaccesible: se registra la limitación y se continúa con el resto (ver auditOrchestrator.js); nunca se detiene toda la auditoría por un solo fallo.",
    constraints: Object.freeze(["offline-first", "sin credenciales", "sin scraping agresivo", "solo fixtures/locales en este paso"]),
    mustNotAutoInfer: Object.freeze(preset.mustNotAutoInfer),
    prudentNote: preset.prudentNote,
    policySnapshot: Object.freeze({ mode: policy.mode, allowed: policy.allowed, violations: policy.violations }),
  });
}
