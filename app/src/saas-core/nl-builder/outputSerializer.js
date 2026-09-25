// Paso 11 · Fase "J" — Serializador de salida.
//
// Convierte un Business Intent (o un par de ellos, para diff) a las formas
// de salida que pide el CLI: JSON estable, Markdown legible, resumen corto,
// explicación ("por qué se eligió cada cosa") y una comparación estructural
// genérica reutilizable tanto para intents como para blueprints. Ninguna
// función aquí decide nada nuevo: solo lee justificaciones/campos que los
// motores anteriores ya calcularon.

import { confidenceLevel } from "./confidenceEngine.js";

export function serializeAsJson(value) {
  return JSON.stringify(value, null, 2);
}

export function serializeIntentAsSummary(intent) {
  const enabledCount = intent.modules.filter((m) => m.status === "enabled").length;
  const lines = [
    `${intent.business.proposedName} — sector: ${intent.business.sector}`,
    `Ubicación: ${intent.business.locations[0]?.city || "no detectada"} (${intent.country})`,
    `Confianza global: ${intent.confidence.overall} (${confidenceLevel(intent.confidence.overall)})`,
    `Módulos habilitados: ${enabledCount} · Ambigüedades: ${intent.ambiguities.length} (${intent.ambiguities.filter((a) => a.blocking).length} bloqueante(s)) · Preguntas recomendadas: ${intent.recommendedQuestions.length}`,
  ];
  return lines.join("\n");
}

function renderModuleTable(modules) {
  const header = "| módulo | fuente | estado | confianza | justificación |\n|---|---|---|---|---|";
  const rows = modules.map((m) => `| ${m.id} | ${m.source} | ${m.status} | ${m.confidence} | ${m.justification} |`);
  return [header, ...rows].join("\n");
}

function renderPermissionsMatrix(roles, permissions) {
  const allModuleIds = [...new Set(Object.values(permissions).flat())].sort();
  const header = `| módulo | ${roles.join(" | ")} |\n|---|${roles.map(() => "---").join("|")}|`;
  const rows = allModuleIds.map((moduleId) => `| ${moduleId} | ${roles.map((role) => (permissions[role]?.includes(moduleId) ? "✔" : "")).join(" | ")} |`);
  return [header, ...rows].join("\n");
}

export function serializeIntentAsMarkdown(intent) {
  const enabled = intent.modules.filter((m) => m.status === "enabled");
  const lines = [
    `# Business Intent — ${intent.business.proposedName}`,
    "",
    `**requestId:** \`${intent.requestId}\` · **schemaVersion:** ${intent.schemaVersion} · **idioma:** ${intent.language}`,
    "",
    `> ${intent.normalizedSummary}`,
    "",
    "## Negocio",
    `- Sector: ${intent.business.sector}`,
    `- País/moneda/zona horaria: ${intent.country} / ${intent.currency} / ${intent.timezone}`,
    `- Canales: ${intent.business.channels.join(", ")}`,
    "",
    "## Objetivos",
    ...intent.objectives.map((o) => `- ${o}`),
    "",
    "## Módulos",
    renderModuleTable(intent.modules),
    "",
    "## Roles y permisos",
    renderPermissionsMatrix(intent.roles, intent.permissions),
    "",
    "## Automatizaciones recomendadas",
    ...(intent.automations.length > 0 ? intent.automations.map((a) => `- ${a.id} (capacidad: ${a.capability}, disparador: ${a.trigger})`) : ["- (ninguna con los módulos habilitados actuales)"]),
    "",
    "## Supuestos",
    ...(intent.assumptions.length > 0 ? intent.assumptions.map((a) => `- **${a.field}** = "${a.assumedValue}" — ${a.reason}`) : ["- (ninguno)"]),
    "",
    "## Ambigüedades",
    ...(intent.ambiguities.length > 0 ? intent.ambiguities.map((a) => `- ${a.blocking ? "🔴 BLOQUEANTE" : "🟡 no bloqueante"} — **${a.field}**: ${a.reason}`) : ["- (ninguna)"]),
    "",
    "## Preguntas recomendadas",
    ...(intent.recommendedQuestions.length > 0 ? intent.recommendedQuestions.map((q) => `- ${q}`) : ["- (ninguna)"]),
    "",
    "## Confianza",
    `- Global: ${intent.confidence.overall} (${confidenceLevel(intent.confidence.overall)})`,
    ...Object.entries(intent.confidence.bySection).map(([section, score]) => `- ${section}: ${score}`),
    "",
    `_Módulos habilitados: ${enabled.length}. Ningún proveedor externo real fue contactado para generar este documento (modo determinista local)._`,
  ];
  return lines.join("\n") + "\n";
}

/** Explica DECISIONES ya tomadas (nunca inventa datos nuevos): reexpone justification/reason de cada motor. */
export function renderExplanation(intent) {
  const lines = [`# Por qué se eligió cada cosa — ${intent.business.proposedName}`, ""];

  lines.push("## Módulos");
  for (const m of intent.modules) {
    lines.push(`- **${m.id}** (${m.status}, fuente: ${m.source}): ${m.justification}`);
  }

  lines.push("", "## Automatizaciones");
  if (intent.automations.length === 0) lines.push("- (ninguna recomendada con los módulos habilitados actuales)");
  for (const a of intent.automations) {
    lines.push(`- **${a.id}**: recomendada porque el sector sugiere la capacidad "${a.capability}" y su disparador ("${a.trigger}") corresponde a un módulo ya habilitado`);
  }

  lines.push("", "## Supuestos aplicados");
  for (const a of intent.assumptions) lines.push(`- ${a.field}: ${a.reason}`);

  lines.push("", "## Ambigüedades detectadas");
  for (const a of intent.ambiguities) lines.push(`- ${a.field} (${a.blocking ? "bloqueante" : "no bloqueante"}): ${a.reason}`);

  return lines.join("\n") + "\n";
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

/**
 * Diff estructural genérico y determinista entre dos valores JSON-serializables
 * (intents, blueprints, o cualquier objeto plano). Recorre claves en orden
 * alfabético para que la salida sea estable entre ejecuciones.
 * @returns {{added: {path:string, value: unknown}[], removed: {path:string, value: unknown}[], changed: {path:string, before: unknown, after: unknown}[]}}
 */
export function structuralDiff(before, after, basePath = "$") {
  const added = [];
  const removed = [];
  const changed = [];

  if (Array.isArray(before) && Array.isArray(after)) {
    const maxLen = Math.max(before.length, after.length);
    for (let i = 0; i < maxLen; i++) {
      const path = `${basePath}[${i}]`;
      if (i >= before.length) added.push({ path, value: after[i] });
      else if (i >= after.length) removed.push({ path, value: before[i] });
      else if (isPlainObject(before[i]) || isPlainObject(after[i]) || (Array.isArray(before[i]) && Array.isArray(after[i]))) {
        const nested = structuralDiff(before[i], after[i], path);
        added.push(...nested.added);
        removed.push(...nested.removed);
        changed.push(...nested.changed);
      } else if (JSON.stringify(before[i]) !== JSON.stringify(after[i])) {
        changed.push({ path, before: before[i], after: after[i] });
      }
    }
    return { added, removed, changed };
  }

  if (isPlainObject(before) && isPlainObject(after)) {
    const keys = [...new Set([...Object.keys(before), ...Object.keys(after)])].sort();
    for (const key of keys) {
      const path = `${basePath}.${key}`;
      const hasBefore = Object.prototype.hasOwnProperty.call(before, key);
      const hasAfter = Object.prototype.hasOwnProperty.call(after, key);
      if (!hasBefore) {
        added.push({ path, value: after[key] });
      } else if (!hasAfter) {
        removed.push({ path, value: before[key] });
      } else if (isPlainObject(before[key]) || isPlainObject(after[key]) || Array.isArray(before[key]) || Array.isArray(after[key])) {
        const nested = structuralDiff(before[key], after[key], path);
        added.push(...nested.added);
        removed.push(...nested.removed);
        changed.push(...nested.changed);
      } else if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
        changed.push({ path, before: before[key], after: after[key] });
      }
    }
    return { added, removed, changed };
  }

  if (JSON.stringify(before) !== JSON.stringify(after)) {
    changed.push({ path: basePath, before, after });
  }
  return { added, removed, changed };
}

export function serializeDiffAsMarkdown(diff, { titleA = "antes", titleB = "después" } = {}) {
  const lines = [`# Diferencias (${titleA} → ${titleB})`, ""];
  lines.push(`## Añadido (${diff.added.length})`);
  for (const entry of diff.added) lines.push(`- ${entry.path} = ${JSON.stringify(entry.value)}`);
  lines.push("", `## Eliminado (${diff.removed.length})`);
  for (const entry of diff.removed) lines.push(`- ${entry.path} (era: ${JSON.stringify(entry.value)})`);
  lines.push("", `## Cambiado (${diff.changed.length})`);
  for (const entry of diff.changed) lines.push(`- ${entry.path}: ${JSON.stringify(entry.before)} → ${JSON.stringify(entry.after)}`);
  return lines.join("\n") + "\n";
}
