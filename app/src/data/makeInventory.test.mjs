import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAKE_INVENTORY,
  MAKE_INVENTORY_META,
  computeErrorRate,
  computeHealth,
  computeCriticality,
} from "./makeInventory.js";

test("el snapshot tiene exactamente los 50 escenarios reales confirmados por MCP", () => {
  assert.equal(MAKE_INVENTORY.length, 50);
  assert.equal(MAKE_INVENTORY_META.totalReal, 50);
  assert.equal(MAKE_INVENTORY_META.source, "confirmado_make_mcp");
});

test("todos los IDs son numéricos y únicos (sin duplicados fantasma)", () => {
  const ids = MAKE_INVENTORY.map((s) => s.id);
  assert.equal(new Set(ids).size, ids.length);
  for (const id of ids) assert.equal(typeof id, "number");
});

test("activos + inactivos coincide con el total real (38/12 confirmado en la auditoría)", () => {
  const activos = MAKE_INVENTORY.filter((s) => s.activo).length;
  const inactivos = MAKE_INVENTORY.filter((s) => !s.activo).length;
  assert.equal(activos, 38);
  assert.equal(inactivos, 12);
  assert.equal(activos + inactivos, MAKE_INVENTORY.length);
});

test("computeErrorRate: 0 ejecuciones no divide por cero", () => {
  assert.equal(computeErrorRate({ ejecuciones: 0, errores: 0 }), 0);
});

test("computeErrorRate: cálculo porcentual correcto con un decimal", () => {
  assert.equal(computeErrorRate({ ejecuciones: 487, errores: 92 }), 18.9);
  assert.equal(computeErrorRate({ ejecuciones: 148, errores: 55 }), 37.2);
});

test("computeHealth: tasa de error alta con volumen suficiente es CRITICO", () => {
  assert.equal(computeHealth({ ejecuciones: 100, errores: 30, activo: true, categoria: "EVENT_TRIGGERED" }), "CRITICO");
});

test("computeHealth: tasa de error moderada es ATENCION", () => {
  assert.equal(computeHealth({ ejecuciones: 100, errores: 10, activo: true, categoria: "EVENT_TRIGGERED" }), "ATENCION");
});

test("computeHealth: sin errores y activo es OK", () => {
  assert.equal(computeHealth({ ejecuciones: 100, errores: 0, activo: true, categoria: "EVENT_TRIGGERED" }), "OK");
});

test("computeHealth: pocas ejecuciones con errores no dispara falso CRITICO (evita alarmismo con muestra pequeña)", () => {
  // 1 ejecución, 1 error = 100% de tasa, pero con muestra insuficiente
  // (<10 ejecuciones) no debe marcarse como CRITICO sin más contexto.
  assert.notEqual(computeHealth({ ejecuciones: 1, errores: 1, activo: true, categoria: "EVENT_TRIGGERED" }), "CRITICO");
});

test("computeCriticality: APP_TRIGGERED siempre es ALTA", () => {
  assert.equal(computeCriticality({ categoria: "APP_TRIGGERED" }), "ALTA");
});

test("computeCriticality: categorías internas/programadas son MEDIA", () => {
  assert.equal(computeCriticality({ categoria: "INTERNAL_OPERATION" }), "MEDIA");
  assert.equal(computeCriticality({ categoria: "SCHEDULED" }), "MEDIA");
});

test("ningún escenario expone tokens, hookId, URLs de webhook, HTML ni datos personales", () => {
  const serialized = JSON.stringify(MAKE_INVENTORY).toLowerCase();
  const forbidden = ["__imtconn__", "hookid", "token", "apikey", "api_key", "secret", "<html", "<div", "webhook_app_", "@gmail.com", "bearer "];
  for (const term of forbidden) {
    assert.equal(serialized.includes(term), false, `el snapshot no debería contener "${term}"`);
  }
});

test("cada escenario trae los campos operacionales mínimos confirmados por MCP", () => {
  for (const s of MAKE_INVENTORY) {
    assert.equal(typeof s.id, "number");
    assert.equal(typeof s.nombre, "string");
    assert.equal(typeof s.activo, "boolean");
    assert.equal(typeof s.scheduling, "string");
    assert.equal(typeof s.ejecuciones, "number");
    assert.equal(typeof s.operaciones, "number");
    assert.equal(typeof s.errores, "number");
    assert.equal(typeof s.ultimaModificacion, "string");
  }
});

test("el escenario 08 (Sincronización Multi-Calendario) refleja la optimización ya aplicada (30 min)", () => {
  const s08 = MAKE_INVENTORY.find((s) => s.id === 5735907);
  assert.ok(s08);
  assert.match(s08.scheduling, /1800/);
});

test("el escenario 15 (Recordatorio 24h Antes) figura inactivo, consistente con la validación pendiente", () => {
  const s15 = MAKE_INVENTORY.find((s) => s.id === 4942506);
  assert.ok(s15);
  assert.equal(s15.activo, false);
});
