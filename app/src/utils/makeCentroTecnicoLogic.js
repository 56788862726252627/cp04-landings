// Club Pádel 04 · lógica pura de enriquecido/agregación/orden/filtro del
// Centro Técnico. Extraída de CentroTecnico.jsx para poder testear con
// node --test sin harness de render de React, igual que
// resolveMakeInventorySource / createSingleFlightGuard en makeLiveClient.js.

import { computeErrorRate, computeHealth, computeCriticality, getScenarioNote, MAKE_VERIFICATION_STATES } from "../data/makeInventory.js";

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
//
// IMPORTANTE: el endpoint real `/scenarios` de Make (confirmado con
// evidencia real, ver worker-reservas/support/makeLiveInventory.js) NO
// expone `executions` ni `errors` — el Worker ya propaga `null` para esos
// campos cuando Make no los trae, nunca un `0` inventado. Aquí NO se debe
// volver a convertir ese `null` honesto en `0` (ese era exactamente el bug):
// por eso no se usa `?? 0` para ejecuciones/errores/tasaError.
export function enrichLiveScenario(raw) {
  return {
    ...raw,
    ejecuciones: raw.ejecuciones_acumuladas ?? null,
    operaciones: raw.operaciones_acumuladas ?? null,
    errores: raw.errores_acumulados ?? null,
    tasaError: raw.tasa_error ?? null,
    salud: raw.salud || "OK",
    criticidad: raw.criticidad || "BAJA",
    ultimaModificacion: raw.ultima_modificacion,
    nota: raw.recomendaciones || null,
    dependenciaPrincipal: raw.dependencia_principal || "N/D",
    fuenteDeVerdadDato: raw.fuente_de_verdad_dato || "confirmado_make_api_live",
  };
}

// Formatea una métrica para la UI sin fingir nunca un 0: si el valor no es
// un número real y finito (dato no disponible en la fuente actual, o NaN),
// se dice explícitamente en vez de mostrar "0", "null%" o el literal "NaN".
export function formatMetric(value, suffix = "") {
  return typeof value === "number" && Number.isFinite(value) ? `${value.toLocaleString("es-ES")}${suffix}` : "No disponible";
}

// Suma solo sobre los escenarios que SÍ reportan el campo. Si la lista está
// vacía, la suma real es 0 (no hay nada que sumar, no es un dato ausente).
// Si la lista tiene escenarios pero NINGUNO reporta el campo, el agregado es
// `null` — no se puede afirmar "0 acumulado", solo "no disponible en la
// fuente actual".
function sumKnown(enriched, field) {
  const known = enriched.filter((s) => typeof s[field] === "number");
  if (enriched.length > 0 && known.length === 0) return null;
  return known.reduce((a, s) => a + s[field], 0);
}

// Resumen del PASO 01 (Make 50/50, 2026-07-17): cuenta cuántos de los
// escenarios traen cada `estadoVerificacion`. Es deliberadamente ciego a si
// la fuente es "live" o "snapshot" — la clasificación de verificación es una
// auditoría manual sobre los 50 escenarios conocidos, no una métrica
// operativa que cambie según de dónde vengan ejecuciones/errores.
//
// Un escenario en vivo (`enrichLiveScenario`) nunca trae `estadoVerificacion`
// (Make no devuelve ese campo): se cuenta en `sinClasificar`, nunca se
// inventa un estado para él. `verificados` es SOLO `confirmado` — nunca se
// sube el número contando "listo_sin_bloqueo" o "pendiente_make_real" como
// si ya estuvieran comprobados.
export function computeVerificacionResumen(enriched) {
  const conteo = {
    confirmado: 0,
    inferido: 0,
    listo_sin_bloqueo: 0,
    bloqueado_externo: 0,
    pendiente_make_real: 0,
  };
  let sinClasificar = 0;

  for (const s of enriched) {
    const estado = s.estadoVerificacion;
    if (estado && Object.prototype.hasOwnProperty.call(conteo, estado)) {
      conteo[estado] += 1;
    } else {
      sinClasificar += 1;
    }
  }

  return {
    total: enriched.length,
    verificados: conteo[MAKE_VERIFICATION_STATES.CONFIRMADO],
    inferidos: conteo[MAKE_VERIFICATION_STATES.INFERIDO],
    listosSinBloqueo: conteo[MAKE_VERIFICATION_STATES.LISTO_SIN_BLOQUEO],
    bloqueadosExterno: conteo[MAKE_VERIFICATION_STATES.BLOQUEADO_EXTERNO],
    pendientesMakeReal: conteo[MAKE_VERIFICATION_STATES.PENDIENTE_MAKE_REAL],
    sinClasificar,
  };
}

export function computeTotales(enriched) {
  const total = enriched.length;
  const activos = enriched.filter((s) => s.activo).length;
  const inactivos = total - activos;

  const ejecuciones = sumKnown(enriched, "ejecuciones");
  const operaciones = sumKnown(enriched, "operaciones");
  const erroresTotales = sumKnown(enriched, "errores");

  // "Con errores": cuenta escenarios con errores confirmados > 0. Si NINGÚN
  // escenario reporta el campo, no se puede afirmar "0 escenarios con
  // errores" (sería inventar una confirmación que no existe): se expone
  // como `null` igual que el agregado.
  const conocidosErrores = enriched.filter((s) => typeof s.errores === "number");
  const conErrores = enriched.length > 0 && conocidosErrores.length === 0
    ? null
    : conocidosErrores.filter((s) => s.errores > 0).length;

  const tasaErrorGlobal = (ejecuciones !== null && erroresTotales !== null)
    ? (ejecuciones ? Math.round((erroresTotales / ejecuciones) * 1000) / 10 : 0)
    : null;

  return { total, activos, inactivos, conErrores, ejecuciones, operaciones, erroresTotales, tasaErrorGlobal };
}

// "Mayor volumen" se mide por operaciones acumuladas, nunca por ejecuciones:
// es la única métrica de volumen que el endpoint real /scenarios de Make
// expone de forma fiable hoy (ver enrichLiveScenario). Un escenario sin
// dato de operaciones nunca puede "ganar" el máximo.
export function pickMayorVolumen(enriched) {
  return enriched.reduce((max, s) => {
    if (typeof s.operaciones !== "number") return max;
    if (!max || s.operaciones > max.operaciones) return s;
    return max;
  }, null);
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

// Trata un valor no numérico (null = dato no disponible) como el mínimo
// posible: al ordenar descendente, los escenarios sin dato quedan al final,
// nunca intercalados al azar ni produciendo NaN en la comparación.
function numOrMin(value) {
  return typeof value === "number" ? value : -Infinity;
}

// Texto de cabecera dinámico según la fuente real de los datos (live/
// snapshot/unavailable). Antes era un texto fijo que afirmaba "Snapshot...
// No es una conexión en vivo" incluso cuando source === "live" — falso.
// Deliberadamente NO repite el detalle exacto de frescura (timestamp) que
// ya muestra el badge EN VIVO/SNAPSHOT justo debajo, para no duplicar
// información.
export function describeCentroTecnicoHeader(source, total) {
  if (source === "live") {
    return `Consola de observabilidad de los ${total} escenarios de Make de Club Pádel 04, con datos actuales obtenidos en vivo del backend.`;
  }
  if (source === "snapshot") {
    return `Consola de observabilidad de los ${total} escenarios de Make de Club Pádel 04. Mostrando la última instantánea conocida: no hay conexión en vivo disponible ahora mismo.`;
  }
  return "Consola de observabilidad de las automatizaciones Make de Club Pádel 04. No hay datos disponibles en este momento: ni conexión en vivo ni instantánea previa.";
}

// Texto de seguridad del panel G: debe ser válido tanto si la fuente actual
// es live como snapshot/fallback — nunca afirma "es un snapshot" de forma
// absoluta (eso era incorrecto en vivo).
export const CP04_SECURITY_DATA_NOTE =
  "Los datos llegan al frontend a través de un backend protegido de solo lectura, en vivo o como última instantánea conocida según disponibilidad — el frontend nunca posee ni transmite claves de Make.";

export function sortScenarios(list, orden) {
  const copy = [...list];

  copy.sort((a, b) => {
    if (orden === "errores") return numOrMin(b.errores) - numOrMin(a.errores);
    if (orden === "ejecuciones") return numOrMin(b.ejecuciones) - numOrMin(a.ejecuciones);
    if (orden === "operaciones") return numOrMin(b.operaciones) - numOrMin(a.operaciones);
    if (orden === "tasaError") return numOrMin(b.tasaError) - numOrMin(a.tasaError);
    if (orden === "ultimaModificacion") return new Date(b.ultimaModificacion) - new Date(a.ultimaModificacion);
    if (orden === "criticidad") return (CP04_CRITICALITY_RANK[b.criticidad] || 0) - (CP04_CRITICALITY_RANK[a.criticidad] || 0);
    if (orden === "nombre") return String(a.nombre).localeCompare(String(b.nombre), "es");
    if (orden === "estado") return Number(b.activo) - Number(a.activo);
    return 0;
  });

  return copy;
}
