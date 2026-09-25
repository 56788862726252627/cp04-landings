// Paso 11 · Fase "G" — Motor de ambigüedades.
//
// Detecta información faltante o contradictoria. Distingue ambigüedad
// BLOQUEANTE (algo que un humano debería resolver antes de confiar en el
// resultado: p.ej. una contradicción explícita) de NO BLOQUEANTE (el
// sistema puede seguir con un supuesto seguro y seguir siendo útil). Nunca
// detiene la generación por sí solo: eso lo decide el CLI en --strict.

const CONTRADICTION_RULES = Object.freeze([
  { restriction: "no_pagos_online", moduleId: "pagos", label: "pagos online" },
  { restriction: "no_stripe", moduleId: "pagos", label: "pagos con Stripe" },
  { restriction: "no_publicidad", moduleId: "campanas", label: "campañas de marketing" },
]);

/**
 * @param {{normalized: object, sectorMatch: object, resolvedModules: object[]}} input
 * @returns {{ambiguities: object[], assumptions: object[], recommendedQuestions: string[]}}
 */
export function detectAmbiguities({ normalized, sectorMatch, resolvedModules }) {
  const ambiguities = [];
  const assumptions = [];
  const recommendedQuestions = [];

  if (normalized.isEmpty) {
    ambiguities.push({
      field: "sourceText",
      reason: "la descripción está vacía; no hay información suficiente para interpretar el negocio",
      blocking: true,
    });
    recommendedQuestions.push("¿Puedes describir el negocio que quieres construir (sector, ciudad, funcionalidades clave)?");
  }

  if (sectorMatch.matchedKeywords <= 0 && !normalized.isEmpty) {
    ambiguities.push({
      field: "business.sector",
      reason: "no se detectó un sector conocido en el texto; se usó el sector genérico como fallback seguro",
      blocking: false,
    });
    assumptions.push({
      field: "business.sector",
      assumedValue: sectorMatch.blueprintSector,
      reason: "ningún preset sectorial coincidió; se aplicó el preset genérico de negocio local",
    });
    recommendedQuestions.push("¿A qué sector pertenece exactamente el negocio (clínica, despacho, club, restaurante, etc.)?");
  }

  if (!normalized.detectedCity && !normalized.isEmpty) {
    ambiguities.push({
      field: "business.locations",
      reason: "no se detectó ciudad ni ubicación en el texto",
      blocking: false,
    });
    assumptions.push({
      field: "country/timezone",
      assumedValue: `${normalized.country}/${normalized.timezone}`,
      reason: "valor por defecto seguro (España/Europe-Madrid) al no detectarse ciudad en el texto",
    });
    recommendedQuestions.push("¿En qué ciudad y país operará el negocio?");
  }

  for (const rule of CONTRADICTION_RULES) {
    if (!normalized.restrictions.includes(rule.restriction)) continue;
    const mod = resolvedModules.find((m) => m.id === rule.moduleId);
    if (mod && mod.source === "explicit" && mod.status === "enabled") {
      ambiguities.push({
        field: `modules.${rule.moduleId}`,
        reason: `se pidió el módulo "${rule.moduleId}" explícitamente pero también se indicó una restricción sobre ${rule.label}; contradicción a resolver por un humano antes de generar el negocio`,
        blocking: true,
      });
      recommendedQuestions.push(`Has pedido "${rule.moduleId}" y también una restricción sobre ${rule.label}: ¿cuál de las dos peticiones prevalece?`);
    }
  }

  for (const mod of resolvedModules) {
    if (mod.status === "enabled" && mod.source === "explicit" && mod.confidence <= 0.5) {
      ambiguities.push({
        field: `modules.${mod.id}`,
        reason: `"${mod.id}" no es habitual para el sector "${sectorMatch.preset.label}"; se mantiene por ser una petición explícita, pero conviene confirmarlo antes de producción`,
        blocking: false,
      });
    }
  }

  if (!/\b(\d+|un|una|dos|tres|cuatro|cinco|seis|siete|ocho)\s+(profesionales?|dentistas?|odont[oó]logos?|fisioterapeutas?|abogados?|veterinarios?|peluqueros?|estilistas?|mec[aá]nicos?|agentes?|profesores?|especialistas?)\b/i.test(normalized.cleanedText) && !normalized.isEmpty) {
    recommendedQuestions.push("¿Cuántos profesionales o miembros del equipo trabajarán en el negocio?");
  }

  return { ambiguities, assumptions, recommendedQuestions };
}

/** Aplica respuestas no interactivas (--answers) a un análisis ya calculado: retira ambigüedades resueltas y añade el supuesto correspondiente (ahora con evidencia real: la respuesta del usuario). */
export function applyAnswers({ ambiguities, assumptions, recommendedQuestions }, answers = {}) {
  const answeredFields = new Set(Object.keys(answers));
  const remainingAmbiguities = ambiguities.filter((a) => !answeredFields.has(a.field));
  const newAssumptions = [...assumptions];
  for (const [field, value] of Object.entries(answers)) {
    if (ambiguities.some((a) => a.field === field)) {
      newAssumptions.push({ field, assumedValue: value, reason: "respuesta proporcionada explícitamente por el usuario (--answers)" });
    }
  }
  return {
    ambiguities: remainingAmbiguities,
    assumptions: newAssumptions,
    recommendedQuestions: remainingAmbiguities.length === 0 ? [] : recommendedQuestions,
  };
}
