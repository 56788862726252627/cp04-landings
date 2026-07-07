// Club Pádel 04 · lógica pura de enriquecido/agregación/orden/filtro del
// Centro Técnico. Extraída de CentroTecnico.jsx para poder testear con
// node --test sin harness de render de React, igual que
// resolveMakeInventorySource / createSingleFlightGuard en makeLiveClient.js.

import { computeErrorRate, computeHealth, computeCriticality, getScenarioNote } from "../data/makeInventory.js";

// Orden de severidad de negocio, no alfabético: ALTA siempre antes que
// MEDIA, MEDIA siempre antes que BAJA. Un sort por localeCompare() alfabético
// produciría MEDIA, BAJA, ALTA — el orden equivocado para triage de SUPPORT.
export const CP04_CRITICALITY_RANK = Object.freeze({ ALTA: 3, MEDIA: 2, BAJA: 1 });

// Snapshot local (src/data/makeInventory.js): usa `usaAirtable` (booleano) y
// no tiene `fuente_de_verdad_dato` propio — se documenta como
// "confirmado_make_mcp" tal como indica MAKE_INVENTORY_META.
export function enrichSnapshotScenario(scenario) {
  return {
    ...scenario,
    tasaError: computeErrorRate(scenario),
    salud: computeHealth(scenario),
    criticidad: computeCriticality(scenario),
    nota: getScenarioNote(scenario),
    dependenciaPrincipal: scenario.usaAirtable ? "Airtable" : "N/D",
    fuenteDeVerdadDato: "confirmado_make_mcp",
  };
}

// Escenario EN VIVO (contrato sanitizado del Worker, ver
// worker-reservas/support/makeLiveInventory.js::sanitizeMakeScenario): los
// nombres de campo son distintos (snake_case, `_acumulados`) y ya incluye
// `dependencia_principal` / `fuente_de_verdad_dato` reales — nunca
// `usaAirtable` (ese campo no existe en la respuesta en vivo).
export function enrichLiveScenario(raw) {
  return {
    ...raw,
    ejecuciones: raw.ejecuciones_acumuladas ?? 0,
    operaciones: raw.operaciones_acumuladas ?? 0,
    errores: raw.errores_acumulados ?? 0,
    tasaError: raw.tasa_error ?? 0,
    salud: raw.salud || "OK",
    criticidad: raw.criticidad || "BAJA",
    ultimaModificacion: raw.ultima_modificacion,
    nota: raw.recomendaciones || null,
    dependenciaPrincipal: raw.dependencia_principal || "N/D",
    fuenteDeVerdadDato: raw.fuente_de_verdad_dato || "confirmado_make_api_live",
  };
}

export function computeTotales(enriched) {
  const total = enriched.length;
  const activos = enriched.filter((s) => s.activo).length;
  const inactivos = total - activos;
  const conErrores = enriched.filter((s) => s.errores > 0).length;
  const ejecuciones = enriched.reduce((a, s) => a + s.ejecuciones, 0);
  const operaciones = enriched.reduce((a, s) => a + s.operaciones, 0);
  const erroresTotales = enriched.reduce((a, s) => a + s.errores, 0);
  const tasaErrorGlobal = ejecuciones ? Math.round((erroresTotales / ejecuciones) * 1000) / 10 : 0;

  return { total, activos, inactivos, conErrores, ejecuciones, operaciones, erroresTotales, tasaErrorGlobal };
}

export function filterScenarios(enriched, { filtro, busqueda } = {}) {
  const q = String(busqueda || "").trim().toLowerCase();

  return enriched.filter((s) => {
    if (q && !String(s.nombre).toLowerCase().includes(q)) return false;
    if (!filtro || filtro === "todos") return true;
    if (filtro === "activos") return s.activo;
    if (filtro === "inactivos") return !s.activo;
    if (filtro === "con_errores") return s.errores > 0;
    if (filtro === "criticos") return s.salud === "CRITICO";
    return s.categoria === filtro;
  });
}

export function sortScenarios(list, orden) {
  const copy = [...list];

  copy.sort((a, b) => {
    if (orden === "errores") return b.errores - a.errores;
    if (orden === "ejecuciones") return b.ejecuciones - a.ejecuciones;
    if (orden === "operaciones") return b.operaciones - a.operaciones;
    if (orden === "tasaError") return b.tasaError - a.tasaError;
    if (orden === "ultimaModificacion") return new Date(b.ultimaModificacion) - new Date(a.ultimaModificacion);
    if (orden === "criticidad") return (CP04_CRITICALITY_RANK[b.criticidad] || 0) - (CP04_CRITICALITY_RANK[a.criticidad] || 0);
    if (orden === "nombre") return String(a.nombre).localeCompare(String(b.nombre), "es");
    if (orden === "estado") return Number(b.activo) - Number(a.activo);
    return 0;
  });

  return copy;
}
