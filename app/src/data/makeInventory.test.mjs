import { test } from "node:test";
import assert from "node:assert/strict";
import {
  MAKE_INVENTORY,
  MAKE_INVENTORY_META,
  MAKE_VERIFICATION_STATES,
  MAKE_VERIFICATION_META,
  MAKE_VERIFICATION_STEP2_META,
  MAKE_VERIFICATION_STEP3B_META,
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

test("activos + inactivos coincide con el total real (36/14 tras el Paso 03B: 2 desactivados por decisión de seguridad)", () => {
  const activos = MAKE_INVENTORY.filter((s) => s.activo).length;
  const inactivos = MAKE_INVENTORY.filter((s) => !s.activo).length;
  assert.equal(activos, 36);
  assert.equal(inactivos, 14);
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

// --- PASO 01 Make 50/50 (2026-07-17): estadoVerificacion ---

test("los 50 escenarios traen estadoVerificacion, y es siempre uno de los 5 valores válidos", () => {
  const validos = new Set(Object.values(MAKE_VERIFICATION_STATES));
  for (const s of MAKE_INVENTORY) {
    assert.equal(typeof s.estadoVerificacion, "string", `${s.nombre} sin estadoVerificacion`);
    assert.ok(validos.has(s.estadoVerificacion), `${s.nombre} tiene un estado inválido: ${s.estadoVerificacion}`);
  }
});

test("MAKE_VERIFICATION_STATES expone exactamente los 5 estados pedidos por el roadmap", () => {
  assert.deepEqual(
    Object.values(MAKE_VERIFICATION_STATES).sort(),
    ["bloqueado_externo", "confirmado", "inferido", "listo_sin_bloqueo", "pendiente_make_real"].sort()
  );
});

test("reparto real de estadoVerificacion no inventa un 50/50 operativo (7/50 confirmados tras el Paso 03B, 0 inferidos)", () => {
  const conteo = { confirmado: 0, inferido: 0, listo_sin_bloqueo: 0, bloqueado_externo: 0, pendiente_make_real: 0 };
  for (const s of MAKE_INVENTORY) conteo[s.estadoVerificacion] += 1;

  assert.equal(conteo.confirmado, 7, "confirmados debe ser 7/50 tras el Paso 03B, no más — no se puede inflar sin evidencia real");
  assert.equal(conteo.inferido, 0);
  assert.equal(conteo.listo_sin_bloqueo, 16);
  assert.equal(conteo.bloqueado_externo, 18);
  assert.equal(conteo.pendiente_make_real, 9);
  const total = Object.values(conteo).reduce((a, b) => a + b, 0);
  assert.equal(total, MAKE_INVENTORY.length);
});

test("MAKE_VERIFICATION_META deja explícito que la clasificación no requiere conexión a Make", () => {
  assert.equal(MAKE_VERIFICATION_META.requiereConexionMake, false);
  assert.equal(typeof MAKE_VERIFICATION_META.clasificadoEn, "string");
});

// --- PASO 02 Make 50/50 (2026-07-17): reconciliación de los 4 "inferido" ---

test("MAKE_VERIFICATION_STEP2_META documenta los 4 escenarios revisados y el resultado (2 cambian, 2 siguen inferido)", () => {
  assert.deepEqual(MAKE_VERIFICATION_STEP2_META.escenariosRevisados.sort(), [5791133, 5799061, 6299114, 6323445].sort());
  assert.equal(MAKE_VERIFICATION_STEP2_META.cambiosDeEstado, 2);
  assert.equal(MAKE_VERIFICATION_STEP2_META.siguenInferidos, 2);
});

test("Cierre Temporal de Pistas (5791133) pasa a confirmado con evidencia real de Make (ejecuciones>0, 0 errores)", () => {
  const s = MAKE_INVENTORY.find((x) => x.id === 5791133);
  assert.ok(s);
  assert.equal(s.estadoVerificacion, "confirmado");
  assert.match(s.nota, /PASO 02/);
});

test("Alerta Crítica Fallos Make (6299114) pasa a pendiente_make_real — pausado por credencial, no roto", () => {
  const s = MAKE_INVENTORY.find((x) => x.id === 6299114);
  assert.ok(s);
  assert.equal(s.estadoVerificacion, "pendiente_make_real");
  assert.match(s.nota, /PASO 02/);
});

// Nota histórica: en el Paso 02 (2026-07-17), Email Recuperación de
// Contraseña SaaS y Chatbot Web Reservas seguían "inferido" a propósito.
// El Paso 03B (misma fecha) cierra ambos tras confirmarse su desactivación
// manual en Make — ver los tests de esa sección más abajo.

// --- PASO 03B Make 50/50 (2026-07-17): cierre de los 2 "inferido" restantes ---

test("MAKE_VERIFICATION_STEP3B_META documenta el cierre de los 2 escenarios y que no quedan inferidos", () => {
  assert.deepEqual(MAKE_VERIFICATION_STEP3B_META.escenariosDesactivados.sort(), [5799061, 6323445].sort());
  assert.equal(MAKE_VERIFICATION_STEP3B_META.inferidosRestantes, 0);
});

test("Email Recuperación de Contraseña SaaS (6323445): desactivado y cerrado, no queda inferido", () => {
  const s = MAKE_INVENTORY.find((x) => x.id === 6323445);
  assert.ok(s);
  assert.equal(s.estadoVerificacion, "confirmado");
  assert.equal(s.activo, false, "debe reflejar la desactivación real confirmada en Make");
  assert.match(s.nota, /PASO 03B/);
});

test("Chatbot Web Reservas (5799061): desactivado y cerrado, no queda inferido", () => {
  const s = MAKE_INVENTORY.find((x) => x.id === 5799061);
  assert.ok(s);
  assert.equal(s.estadoVerificacion, "confirmado");
  assert.equal(s.activo, false, "debe reflejar la desactivación real confirmada en Make");
  assert.match(s.nota, /PASO 03B/);
});

test("tras el Paso 03B ya no queda ningún escenario en estado 'inferido'", () => {
  const inferidos = MAKE_INVENTORY.filter((s) => s.estadoVerificacion === "inferido");
  assert.equal(inferidos.length, 0);
});
