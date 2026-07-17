import test from "node:test";
import assert from "node:assert/strict";

import { MAKE_INVENTORY } from "../data/makeInventory.js";
import {
  CP04_CRITICALITY_RANK,
  enrichSnapshotScenario,
  enrichLiveScenario,
  computeTotales,
  computeVerificacionResumen,
  filterScenarios,
  sortScenarios,
  formatMetric,
  pickMayorVolumen,
  describeCentroTecnicoHeader,
  CP04_SECURITY_DATA_NOTE,
} from "./makeCentroTecnicoLogic.js";

const enrichedSnapshot = MAKE_INVENTORY.map(enrichSnapshotScenario);

test("computeTotales: 50 escenarios reales, 38 activos, 12 inactivos (snapshot confirmado)", () => {
  const totales = computeTotales(enrichedSnapshot);
  assert.equal(totales.total, 50);
  assert.equal(totales.activos, 38);
  assert.equal(totales.inactivos, 12);
  assert.equal(totales.activos + totales.inactivos, totales.total);
});

test("computeTotales: no pierde ni duplica escenarios frente a la fuente cruda", () => {
  const totales = computeTotales(enrichedSnapshot);
  assert.equal(totales.total, MAKE_INVENTORY.length);
  const ids = new Set(enrichedSnapshot.map((s) => s.id));
  assert.equal(ids.size, enrichedSnapshot.length, "no debe haber IDs duplicados tras enriquecer");
});

test("computeTotales: tasaErrorGlobal se deriva de errores/ejecuciones reales, no de un valor fijo", () => {
  const totales = computeTotales(enrichedSnapshot);
  const esperada = Math.round((totales.erroresTotales / totales.ejecuciones) * 1000) / 10;
  assert.equal(totales.tasaErrorGlobal, esperada);
  assert.ok(totales.ejecuciones > 0);
});

test("computeTotales: sin ejecuciones no divide por cero", () => {
  const totales = computeTotales([]);
  assert.equal(totales.tasaErrorGlobal, 0);
  assert.equal(totales.total, 0);
});

test("enrichLiveScenario: usa dependencia_principal real, nunca el campo usaAirtable inexistente en vivo", () => {
  const live = enrichLiveScenario({
    id: 1, nombre: "X", categoria: "SCHEDULED", activo: true,
    dependencia_principal: "Airtable", fuente_de_verdad_dato: "confirmado_make_api_live",
    ejecuciones_acumuladas: 10, operaciones_acumuladas: 20, errores_acumulados: 1, tasa_error: 10,
  });
  assert.equal(live.dependenciaPrincipal, "Airtable");
  assert.equal(live.fuenteDeVerdadDato, "confirmado_make_api_live");
  assert.equal(live.usaAirtable, undefined, "el campo live no debe inventar usaAirtable");
});

test("enrichSnapshotScenario: deriva dependenciaPrincipal desde usaAirtable y etiqueta la fuente como MCP", () => {
  const s = enrichSnapshotScenario({ id: 1, nombre: "X", categoria: "SCHEDULED", activo: true, ejecuciones: 10, errores: 1, usaAirtable: true });
  assert.equal(s.dependenciaPrincipal, "Airtable");
  assert.equal(s.fuenteDeVerdadDato, "confirmado_make_mcp");

  const sinAirtable = enrichSnapshotScenario({ id: 2, nombre: "Y", categoria: "SCHEDULED", activo: true, ejecuciones: 0, errores: 0, usaAirtable: false });
  assert.equal(sinAirtable.dependenciaPrincipal, "N/D");
});

test("filterScenarios: cada filtro devuelve exactamente el subconjunto esperado (sin fugas cruzadas)", () => {
  const activos = filterScenarios(enrichedSnapshot, { filtro: "activos" });
  const inactivos = filterScenarios(enrichedSnapshot, { filtro: "inactivos" });
  assert.equal(activos.length, 38);
  assert.equal(inactivos.length, 12);
  assert.ok(activos.every((s) => s.activo === true));
  assert.ok(inactivos.every((s) => s.activo === false));

  const conErrores = filterScenarios(enrichedSnapshot, { filtro: "con_errores" });
  assert.ok(conErrores.every((s) => s.errores > 0));

  const criticos = filterScenarios(enrichedSnapshot, { filtro: "criticos" });
  assert.ok(criticos.every((s) => s.salud === "CRITICO"));
});

test("filterScenarios: búsqueda parcial y sin resultados", () => {
  const parcial = filterScenarios(enrichedSnapshot, { filtro: "todos", busqueda: "reserva" });
  assert.ok(parcial.length > 0);
  assert.ok(parcial.every((s) => s.nombre.toLowerCase().includes("reserva")));

  const sinResultados = filterScenarios(enrichedSnapshot, { filtro: "todos", busqueda: "xyz-no-existe-nunca" });
  assert.equal(sinResultados.length, 0);
});

test("sortScenarios: por criticidad respeta severidad de negocio (ALTA, luego MEDIA, luego BAJA) — no orden alfabético", () => {
  const muestra = [{ criticidad: "MEDIA" }, { criticidad: "ALTA" }, { criticidad: "BAJA" }];
  const ordenado = sortScenarios(muestra, "criticidad");
  assert.deepEqual(ordenado.map((s) => s.criticidad), ["ALTA", "MEDIA", "BAJA"]);
  // Regresión explícita del bug: localeCompare alfabético daría ["MEDIA","BAJA","ALTA"].
  assert.notDeepEqual(ordenado.map((s) => s.criticidad), ["MEDIA", "BAJA", "ALTA"]);
});

test("sortScenarios: por nombre ordena alfabéticamente", () => {
  const muestra = [{ nombre: "Zeta" }, { nombre: "Alfa" }, { nombre: "Mu" }];
  const ordenado = sortScenarios(muestra, "nombre");
  assert.deepEqual(ordenado.map((s) => s.nombre), ["Alfa", "Mu", "Zeta"]);
});

test("sortScenarios: por estado pone activos antes que inactivos", () => {
  const muestra = [{ activo: false, nombre: "a" }, { activo: true, nombre: "b" }, { activo: false, nombre: "c" }];
  const ordenado = sortScenarios(muestra, "estado");
  assert.deepEqual(ordenado.map((s) => s.activo), [true, false, false]);
});

test("sortScenarios: por errores, ejecuciones, operaciones y tasaError ordena descendente", () => {
  const muestra = [{ errores: 1, ejecuciones: 5, operaciones: 9, tasaError: 1 }, { errores: 9, ejecuciones: 1, operaciones: 1, tasaError: 9 }];
  assert.deepEqual(sortScenarios(muestra, "errores").map((s) => s.errores), [9, 1]);
  assert.deepEqual(sortScenarios(muestra, "ejecuciones").map((s) => s.ejecuciones), [5, 1]);
  assert.deepEqual(sortScenarios(muestra, "operaciones").map((s) => s.operaciones), [9, 1]);
  assert.deepEqual(sortScenarios(muestra, "tasaError").map((s) => s.tasaError), [9, 1]);
});

test("sortScenarios: no muta la lista original (copia defensiva)", () => {
  const original = [{ errores: 1 }, { errores: 9 }];
  const copia = [...original];
  sortScenarios(original, "errores");
  assert.deepEqual(original, copia);
});

// --- PASO 01 Make 50/50 (2026-07-17): computeVerificacionResumen ---

test("computeVerificacionResumen: sobre el snapshot real tras el Paso 02, 5 confirmados y 43 sin confirmar (16+18+9), 2 inferidos", () => {
  const resumen = computeVerificacionResumen(enrichedSnapshot);
  assert.equal(resumen.total, 50);
  assert.equal(resumen.verificados, 5);
  assert.equal(resumen.inferidos, 2);
  assert.equal(resumen.listosSinBloqueo, 16);
  assert.equal(resumen.bloqueadosExterno, 18);
  assert.equal(resumen.pendientesMakeReal, 9);
  assert.equal(resumen.sinClasificar, 0);
  assert.equal(
    resumen.verificados + resumen.inferidos + resumen.listosSinBloqueo + resumen.bloqueadosExterno + resumen.pendientesMakeReal,
    resumen.total
  );
});

test("computeVerificacionResumen: nunca cuenta listo_sin_bloqueo ni pendiente_make_real como verificado", () => {
  const resumen = computeVerificacionResumen(enrichedSnapshot);
  assert.ok(resumen.verificados < resumen.total, "no puede afirmar que todos están confirmados");
  assert.equal(resumen.verificados, 5, "verificados es estrictamente el conteo de 'confirmado', nada más");
});

test("computeVerificacionResumen: un escenario EN VIVO sin estadoVerificacion se cuenta como sinClasificar, nunca se inventa un estado", () => {
  const liveSinClasificar = enrichLiveScenario({
    id: 1, nombre: "X", categoria: "SCHEDULED", activo: true,
    dependencia_principal: "Airtable", fuente_de_verdad_dato: "confirmado_make_api_live",
    ejecuciones_acumuladas: 10, operaciones_acumuladas: 20, errores_acumulados: 1, tasa_error: 10,
  });
  const resumen = computeVerificacionResumen([liveSinClasificar]);
  assert.equal(resumen.sinClasificar, 1);
  assert.equal(resumen.verificados, 0);
  assert.equal(resumen.total, 1);
});

test("computeVerificacionResumen: lista vacía no rompe y no inventa un total", () => {
  const resumen = computeVerificacionResumen([]);
  assert.equal(resumen.total, 0);
  assert.equal(resumen.verificados, 0);
  assert.equal(resumen.sinClasificar, 0);
});

test("CP04_CRITICALITY_RANK: ALTA > MEDIA > BAJA", () => {
  assert.ok(CP04_CRITICALITY_RANK.ALTA > CP04_CRITICALITY_RANK.MEDIA);
  assert.ok(CP04_CRITICALITY_RANK.MEDIA > CP04_CRITICALITY_RANK.BAJA);
});

// --- Regresión: corrección de mapeo de métricas EN VIVO ---
//
// Fixture con la forma REAL confirmada del endpoint sanitizado del Worker
// para el caso actual (Make no expone executions/errors en /scenarios):
// operaciones_acumuladas viene siempre, ejecuciones/errores/tasa vienen null.
function liveRawSinDatos(overrides = {}) {
  return {
    id: 1, nombre: "Sincronización Multi-Calendario", categoria: "INTERNAL_OPERATION", activo: true,
    scheduling: "cada 1800s (30 min)", ultima_modificacion: "2026-07-06T14:32:29.507Z",
    ejecuciones_acumuladas: null, operaciones_acumuladas: 1546, errores_acumulados: null,
    tasa_error: null, criticidad: "MEDIA", salud: "SIN_DATOS",
    dependencia_principal: "Airtable", funcion_afectada: null, recomendaciones: null,
    fuente_de_verdad_dato: "confirmado_make_api_live",
    ...overrides,
  };
}

test("4. enrichLiveScenario: campo ausente (null) del Worker nunca se convierte en 0 en el frontend", () => {
  const live = enrichLiveScenario(liveRawSinDatos());
  assert.equal(live.ejecuciones, null);
  assert.equal(live.errores, null);
  assert.equal(live.tasaError, null);
  assert.equal(live.operaciones, 1546, "operaciones sí viene real y no debe perderse");
});

test("1/2/13. computeTotales: 50 escenarios EN VIVO reales (sin executions/errors) — total/activos/inactivos/operaciones correctos, ejecuciones/errores/tasa honestamente null", () => {
  const activos38 = Array.from({ length: 38 }, (_, i) => enrichLiveScenario(liveRawSinDatos({ id: i, activo: true, operaciones_acumuladas: 100 })));
  const inactivos12 = Array.from({ length: 12 }, (_, i) => enrichLiveScenario(liveRawSinDatos({ id: 100 + i, activo: false, salud: "ATENCION", operaciones_acumuladas: 50 })));
  const enriched = [...activos38, ...inactivos12];

  const totales = computeTotales(enriched);
  assert.equal(totales.total, 50);
  assert.equal(totales.activos, 38);
  assert.equal(totales.inactivos, 12);
  assert.equal(totales.operaciones, 38 * 100 + 12 * 50, "operaciones sí se agregan (siempre reales)");
  assert.equal(totales.ejecuciones, null, "ningún escenario reporta ejecuciones -> agregado null, no 0");
  assert.equal(totales.erroresTotales, null, "ningún escenario reporta errores -> agregado null, no 0");
  assert.equal(totales.conErrores, null, "no se puede afirmar '0 con errores' si no hay dato de ninguno");
  assert.equal(totales.tasaErrorGlobal, null, "sin ejecuciones/errores reales no hay tasa 0% que mostrar");
});

test("15. computeTotales: mezcla de escenarios con y sin dato — solo suma los conocidos, sin contar doble ni inventar", () => {
  const conDatos = enrichLiveScenario(liveRawSinDatos({ id: 1, ejecuciones_acumuladas: 100, errores_acumulados: 10, tasa_error: 10, salud: "ATENCION" }));
  const sinDatos = enrichLiveScenario(liveRawSinDatos({ id: 2 }));
  const totales = computeTotales([conDatos, sinDatos]);

  assert.equal(totales.ejecuciones, 100, "solo se suma el escenario que sí reporta, no se inventa el que falta como 0");
  assert.equal(totales.erroresTotales, 10);
  assert.equal(totales.conErrores, 1, "cuenta exactamente 1, no 2 (el escenario sin dato no se cuenta como 'sin errores' ni como 'con errores')");
});

test("12. computeTotales: una actualización posterior con métricas reales reemplaza el estado anterior (sin quedarse stale)", () => {
  const antes = computeTotales([enrichLiveScenario(liveRawSinDatos({ id: 1 }))]);
  assert.equal(antes.ejecuciones, null);

  const despues = computeTotales([enrichLiveScenario(liveRawSinDatos({ id: 1, ejecuciones_acumuladas: 500, errores_acumulados: 5, tasa_error: 1 }))]);
  assert.equal(despues.ejecuciones, 500);
  assert.equal(despues.erroresTotales, 5);
});

test("14. enrichLiveScenario: enriquecer 50 escenarios en vivo no genera IDs duplicados", () => {
  const raws = Array.from({ length: 50 }, (_, i) => liveRawSinDatos({ id: i + 1 }));
  const enriched = raws.map(enrichLiveScenario);
  const ids = new Set(enriched.map((s) => s.id));
  assert.equal(ids.size, 50);
});

test("6. pickMayorVolumen: selecciona el escenario con más operaciones, ignorando los que no reportan el dato", () => {
  const lista = [
    enrichLiveScenario(liveRawSinDatos({ id: 1, operaciones_acumuladas: 200 })),
    enrichLiveScenario(liveRawSinDatos({ id: 2, operaciones_acumuladas: 1546 })),
    enrichLiveScenario(liveRawSinDatos({ id: 3, operaciones_acumuladas: null })),
  ];
  const mayor = pickMayorVolumen(lista);
  assert.equal(mayor.id, 2);
});

test("pickMayorVolumen: si ningún escenario reporta operaciones, no inventa un ganador (null, no el primero de la lista)", () => {
  const lista = [
    enrichLiveScenario(liveRawSinDatos({ id: 1, operaciones_acumuladas: null })),
    enrichLiveScenario(liveRawSinDatos({ id: 2, operaciones_acumuladas: null })),
  ];
  assert.equal(pickMayorVolumen(lista), null);
});

test("formatMetric: número real se formatea con separador es-ES; dato ausente dice 'No disponible', nunca '0' ni 'null'", () => {
  assert.equal(formatMetric(14394), "14.394");
  assert.equal(formatMetric(30, "%"), "30%");
  assert.equal(formatMetric(null), "No disponible");
  assert.equal(formatMetric(undefined), "No disponible");
  assert.equal(formatMetric(0), "0", "0 real confirmado sí debe mostrarse como 0, no como 'No disponible'");
});

test("sortScenarios: los escenarios sin dato numérico quedan al final al ordenar descendente, sin lanzar NaN", () => {
  const muestra = [
    enrichLiveScenario(liveRawSinDatos({ id: 1, ejecuciones_acumuladas: null })),
    enrichLiveScenario(liveRawSinDatos({ id: 2, ejecuciones_acumuladas: 50 })),
    enrichLiveScenario(liveRawSinDatos({ id: 3, ejecuciones_acumuladas: null })),
  ];
  const ordenado = sortScenarios(muestra, "ejecuciones");
  assert.equal(ordenado[0].id, 2, "el único con dato real debe ir primero");
  assert.ok(ordenado.slice(1).every((s) => s.ejecuciones === null));
});

// --- Regresión: QA visual/semántico post-EN VIVO ---

test("describeCentroTecnicoHeader: live nunca afirma 'no es una conexión en vivo' (bug anterior)", () => {
  const texto = describeCentroTecnicoHeader("live", 50);
  assert.ok(texto.includes("50"));
  assert.ok(texto.toLowerCase().includes("vivo"));
  assert.ok(!texto.toLowerCase().includes("no es una conexión en vivo"));
  assert.ok(!texto.toLowerCase().includes("snapshot"), "en live no debe mencionar snapshot");
});

test("describeCentroTecnicoHeader: snapshot es honesto sobre la ausencia de conexión en vivo", () => {
  const texto = describeCentroTecnicoHeader("snapshot", 50);
  assert.ok(texto.toLowerCase().includes("instantánea"));
  assert.ok(texto.toLowerCase().includes("no hay conexión en vivo"));
});

test("describeCentroTecnicoHeader: unavailable no inventa datos ni cifras", () => {
  const texto = describeCentroTecnicoHeader("unavailable", 0);
  assert.ok(texto.toLowerCase().includes("no hay datos disponibles"));
  assert.ok(!texto.includes("50"), "no debe inventar un total cuando no hay datos");
});

test("describeCentroTecnicoHeader: los tres textos son distintos entre sí (no es una constante fija reciclada)", () => {
  const live = describeCentroTecnicoHeader("live", 50);
  const snapshot = describeCentroTecnicoHeader("snapshot", 50);
  const unavailable = describeCentroTecnicoHeader("unavailable", 50);
  assert.notEqual(live, snapshot);
  assert.notEqual(snapshot, unavailable);
  assert.notEqual(live, unavailable);
});

test("CP04_SECURITY_DATA_NOTE: es neutral respecto a la fuente — no afirma de forma absoluta que los datos 'son un snapshot'", () => {
  const texto = CP04_SECURITY_DATA_NOTE.toLowerCase();
  assert.ok(!texto.includes("los datos son un snapshot"), "no debe afirmar snapshot de forma incondicional (falso en vivo)");
  assert.ok(texto.includes("en vivo") && texto.includes("instantánea"), "debe cubrir ambos casos de fuente");
  assert.ok(texto.includes("nunca posee ni transmite claves"), "debe mantener la garantía de seguridad de siempre");
});

test("formatMetric: nunca produce el texto literal 'null' ni 'undefined' visible para el usuario", () => {
  for (const v of [null, undefined, NaN, "no-es-un-numero", {}]) {
    const out = formatMetric(v);
    assert.ok(!out.includes("null"));
    assert.ok(!out.includes("undefined"));
    assert.equal(out, "No disponible");
  }
});

test("Escenario real EN VIVO completo (50, sin executions/errors): los valores de KPI renderizados son honestos, no ceros ni nulls visibles", () => {
  const enriched = Array.from({ length: 50 }, (_, i) => enrichLiveScenario(liveRawSinDatos({ id: i, operaciones_acumuladas: 1000 })));
  const totales = computeTotales(enriched);

  const kpiEjecuciones = formatMetric(totales.ejecuciones);
  const kpiErrores = totales.conErrores === null ? "No disponible" : String(totales.conErrores);
  const kpiTasa = totales.tasaErrorGlobal === null ? "No disponible" : `${totales.tasaErrorGlobal}%`;
  const kpiOperaciones = formatMetric(totales.operaciones);

  assert.equal(kpiEjecuciones, "No disponible");
  assert.equal(kpiErrores, "No disponible");
  assert.equal(kpiTasa, "No disponible");
  assert.equal(kpiOperaciones, "50.000", "operaciones sí es un valor real (50 x 1000), no un placeholder");
  for (const texto of [kpiEjecuciones, kpiErrores, kpiTasa, kpiOperaciones]) {
    assert.ok(!texto.includes("null") && !texto.includes("undefined"));
  }
});
