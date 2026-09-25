// Paso 11 · Fase 7 — Motor de módulos y dependencias.
//
// Determinista: mismo texto normalizado + mismo preset sectorial ⇒ mismo
// conjunto de módulos, en el mismo orden (orden de declaración en
// MODULE_CATALOG, no orden de detección). Reglas explícitas del Paso 11
// que este motor aplica literalmente:
//  - reservas/citas requiere recursos O profesionales;
//  - pagos requiere catálogo de servicios;
//  - expedientes exige permisos reforzados;
//  - inventario NUNCA se activa salvo mención explícita;
//  - facturación nunca implica conectar Stripe (eso es integración, no módulo);
//  - un módulo fuera de lo recomendado para el sector, si no fue pedido
//    explícitamente, se marca "rejected" en vez de activarse en silencio.

import { MODULE_CATALOG, BASE_MODULE_IDS, getModuleDefinition } from "./moduleCatalog.js";

const RESOURCE_OR_STAFF_SENTINEL = "__resource_or_staff__";
const UPSELL_MODULE_IDS = Object.freeze(["informes", "dashboard", "crm", "leads", "notificaciones", "membresias", "consentimientos", "backups", "auditoria", "contenidos"]);

function detectExplicitModuleIds(lowerText) {
  const found = new Set();
  for (const mod of MODULE_CATALOG) {
    if (mod.keywords.some((kw) => lowerText.includes(kw))) found.add(mod.id);
  }
  return found;
}

/**
 * @param {string} lowerText texto normalizado en minúsculas
 * @param {object} sectorPreset preset de sectorLexicon.js
 * @returns {{modules: object[], hasReinforcedPermissionModules: boolean}}
 */
export function resolveModules(lowerText, sectorPreset) {
  const explicitIds = detectExplicitModuleIds(lowerText);
  const byId = new Map();

  const setEntry = (id, entry) => {
    const existing = byId.get(id);
    if (!existing || (existing.source !== "explicit" && entry.source === "explicit")) {
      byId.set(id, entry);
    }
  };

  for (const id of explicitIds) {
    setEntry(id, { id, source: "explicit", status: "enabled", confidence: 0.9, priority: "alta", justification: `mencionado explícitamente en la petición`, dependsOn: [] });
  }

  for (const id of BASE_MODULE_IDS) {
    if (!byId.has(id)) {
      setEntry(id, { id, source: "recommended", status: "enabled", confidence: 0.6, priority: "media", justification: "módulo base recomendado para cualquier negocio con clientes", dependsOn: [] });
    }
  }

  for (const id of sectorPreset.recommendedModules) {
    if (!byId.has(id)) {
      setEntry(id, { id, source: "recommended", status: "enabled", confidence: 0.55, priority: "media", justification: `recomendado por el preset sectorial "${sectorPreset.label}"`, dependsOn: [] });
    }
  }

  for (const id of UPSELL_MODULE_IDS) {
    if (!byId.has(id) && !sectorPreset.doNotAutoAdd.includes(id)) {
      setEntry(id, { id, source: "recommended", status: "suggested", confidence: 0.3, priority: "baja", justification: "posible mejora futura, no activada por defecto", dependsOn: [] });
    }
  }

  // Resolución de dependencias (2 pasadas: cubre cadenas como ranking→torneos→(nada)).
  for (let pass = 0; pass < 2; pass++) {
    for (const [id, entry] of [...byId.entries()]) {
      if (entry.status !== "enabled") continue;
      const def = getModuleDefinition(id);
      if (!def) continue;
      for (const dep of def.dependsOn) {
        if (dep === RESOURCE_OR_STAFF_SENTINEL) {
          const hasResourceOrStaff = ["recursos", "profesionales"].some((cand) => byId.get(cand)?.status === "enabled");
          if (!hasResourceOrStaff) {
            const preferred = sectorPreset.recommendedModules.includes("recursos") ? "recursos" : "profesionales";
            setEntry(preferred, { id: preferred, source: "inferred", status: "enabled", confidence: 0.7, priority: "alta", justification: `"${id}" requiere recursos o profesionales asociados`, dependsOn: [] });
          }
          continue;
        }
        if (byId.get(dep)?.status !== "enabled") {
          setEntry(dep, { id: dep, source: "inferred", status: "enabled", confidence: 0.7, priority: "media", justification: `"${id}" requiere el módulo "${dep}"`, dependsOn: [id] });
        }
      }
    }
  }

  // Salvaguardas: inventario nunca se activa salvo mención explícita.
  for (const [id, entry] of [...byId.entries()]) {
    const def = getModuleDefinition(id);
    if (def?.requiresExplicitMention && entry.source !== "explicit" && entry.status !== "rejected") {
      byId.set(id, { ...entry, status: "rejected", confidence: 0, justification: `"${id}" requiere mención explícita en la petición; no se activa automáticamente` });
    }
  }

  // Salvaguarda: módulo no recomendado para el sector y no pedido explícitamente -> rejected, no activado en silencio.
  for (const [id, entry] of [...byId.entries()]) {
    if (sectorPreset.doNotAutoAdd.includes(id) && entry.source !== "explicit" && entry.status === "enabled") {
      byId.set(id, { ...entry, status: "rejected", justification: `"${id}" no forma parte de lo recomendado para "${sectorPreset.label}"; no se activa automáticamente` });
    } else if (sectorPreset.doNotAutoAdd.includes(id) && entry.source === "explicit") {
      byId.set(id, { ...entry, confidence: Math.min(entry.confidence, 0.5), justification: `${entry.justification} (fuera de lo habitual para "${sectorPreset.label}"; se respeta por ser una petición explícita, revisar antes de producción)` });
    }
  }

  const orderedIds = MODULE_CATALOG.map((m) => m.id).filter((id) => byId.has(id));
  const modules = orderedIds.map((id) => byId.get(id));
  const hasReinforcedPermissionModules = modules.some((m) => m.status === "enabled" && getModuleDefinition(m.id)?.requiresReinforcedPermissions);

  return { modules, hasReinforcedPermissionModules };
}

export { UPSELL_MODULE_IDS };
