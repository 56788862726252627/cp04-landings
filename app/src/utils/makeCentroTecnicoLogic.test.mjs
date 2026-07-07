import test from "node:test";
import assert from "node:assert/strict";

import { MAKE_INVENTORY } from "../data/makeInventory.js";
import {
  CP04_CRITICALITY_RANK,
  enrichSnapshotScenario,
  enrichLiveScenario,
  computeTotales,
  filterScenarios,
  sortScenarios,
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

test("CP04_CRITICALITY_RANK: ALTA > MEDIA > BAJA", () => {
  assert.ok(CP04_CRITICALITY_RANK.ALTA > CP04_CRITICALITY_RANK.MEDIA);
  assert.ok(CP04_CRITICALITY_RANK.MEDIA > CP04_CRITICALITY_RANK.BAJA);
});
