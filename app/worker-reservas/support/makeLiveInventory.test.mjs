import test from "node:test";
import assert from "node:assert/strict";
import {
  isMakeLiveConfigured,
  sanitizeMakeScenario,
  fetchLiveMakeInventory,
  checkMakeRateLimit,
  __resetMakeLiveStateForTests,
  CP04_MAKE_SAFE_FIELDS,
} from "./makeLiveInventory.js";

test("isMakeLiveConfigured: false si falta cualquiera de los 3 valores requeridos", () => {
  assert.equal(isMakeLiveConfigured({}), false);
  assert.equal(isMakeLiveConfigured({ MAKE_API_TOKEN: "x" }), false);
  assert.equal(isMakeLiveConfigured({ MAKE_API_TOKEN: "x", MAKE_API_BASE_URL: "y" }), false);
});

test("isMakeLiveConfigured: true solo con los 3 presentes (estado real de producción hoy: false)", () => {
  assert.equal(
    isMakeLiveConfigured({ MAKE_API_TOKEN: "x", MAKE_API_BASE_URL: "y", MAKE_TEAM_ID: "z" }),
    true
  );
});

test("8/9/10. sanitizeMakeScenario nunca incluye tokens, hookId, webhooks, HTML ni PII", () => {
  const raw = {
    id: 123,
    name: "Escenario de prueba",
    isActive: true,
    scheduling: { type: "indefinitely", interval: 900 },
    lastEdit: "2026-07-06T00:00:00.000Z",
    executions: 10,
    operations: 20,
    errors: 1,
    hookId: 999999,
    __IMTCONN__: 6754776,
    webhookUrl: "https://hook.eu2.make.com/secretoprivado",
    blueprint: { flow: [{ mapper: { html: "<div>hola</div>" } }] },
  };
  const sanitized = sanitizeMakeScenario(raw, "EVENT_TRIGGERED");
  const serialized = JSON.stringify(sanitized).toLowerCase();

  assert.equal(Object.keys(sanitized).sort().join(","), [...CP04_MAKE_SAFE_FIELDS].sort().join(","));
  for (const forbidden of ["hookid", "__imtconn__", "webhookurl", "hook.eu2.make.com", "<div", "token"]) {
    assert.equal(serialized.includes(forbidden), false, `no debería contener "${forbidden}"`);
  }
});

test("sanitizeMakeScenario: deriva tasa de error, salud y criticidad correctamente", () => {
  const sanitized = sanitizeMakeScenario(
    { id: 1, name: "X", isActive: true, executions: 100, operations: 200, errors: 30, scheduling: { type: "indefinitely", interval: 3600 } },
    "APP_TRIGGERED"
  );
  assert.equal(sanitized.tasa_error, 30);
  assert.equal(sanitized.salud, "CRITICO");
  assert.equal(sanitized.criticidad, "ALTA");
  assert.equal(sanitized.fuente_de_verdad_dato, "confirmado_make_api_live");
});

// --- Regresión: corrección de mapeo de métricas EN VIVO ---
//
// Evidencia real confirmada con GET /scenarios de Make (diagnóstico
// temporal, sesión de corrección de métricas): el endpoint real NO expone
// `executions` ni `errors`, solo `operations` (además de dlqCount,
// centicredits, transfer, usedModules... ninguno usado aquí). Estos
// fixtures reproducen exactamente esa forma real, sin inventar campos que
// Make no envía.
const RAW_MAKE_SHAPE_REAL = {
  id: 5735907, name: "🗓️ Sincronización Multi-Calendario", teamId: 1099976,
  isActive: true, scheduling: { type: "interval", interval: 1800 },
  dlqCount: 0, allDlqCount: 0, operations: 1546, centicredits: 0,
  usedModules: 3, usedPackages: ["util"], lastEdit: "2026-07-06T14:32:29.507Z",
  folderId: null,
  // Nótese: sin `executions` ni `errors` — así responde Make hoy de verdad.
};

test("4. sanitizeMakeScenario: campo ausente en la API real (executions/errors) nunca se convierte en 0 — se propaga null", () => {
  const sanitized = sanitizeMakeScenario(RAW_MAKE_SHAPE_REAL, "INTERNAL_OPERATION");
  assert.equal(sanitized.ejecuciones_acumuladas, null, "ejecuciones ausente en Make debe ser null, nunca 0");
  assert.equal(sanitized.errores_acumulados, null, "errores ausente en Make debe ser null, nunca 0");
  assert.equal(sanitized.tasa_error, null, "sin ejecuciones/errores reales no se puede afirmar una tasa 0%");
});

test("5. sanitizeMakeScenario: operations SÍ viene en la API real y se agrega correctamente (no se pierde)", () => {
  const sanitized = sanitizeMakeScenario(RAW_MAKE_SHAPE_REAL, "INTERNAL_OPERATION");
  assert.equal(sanitized.operaciones_acumuladas, 1546);
});

test("7. sanitizeMakeScenario: salud SIN_DATOS cuando faltan ejecuciones/errores en un escenario activo y relevante", () => {
  const sanitized = sanitizeMakeScenario(RAW_MAKE_SHAPE_REAL, "INTERNAL_OPERATION");
  assert.equal(sanitized.salud, "SIN_DATOS");
  assert.notEqual(sanitized.salud, "OK", "SIN_DATOS no debe confundirse con OK (OK afirmaría 0 errores confirmados)");
});

test("7. sanitizeMakeScenario: salud ATENCION para un escenario inactivo y relevante, incluso sin datos de ejecuciones/errores", () => {
  const sanitized = sanitizeMakeScenario({ ...RAW_MAKE_SHAPE_REAL, isActive: false }, "INTERNAL_OPERATION");
  assert.equal(sanitized.salud, "ATENCION");
});

test("1/3. sanitizeMakeScenario: con ejecuciones y errores reales presentes, la tasa se calcula igual que siempre (regresión no rota)", () => {
  const sanitized = sanitizeMakeScenario({ ...RAW_MAKE_SHAPE_REAL, executions: 100, errors: 25 }, "INTERNAL_OPERATION");
  assert.equal(sanitized.ejecuciones_acumuladas, 100);
  assert.equal(sanitized.errores_acumulados, 25);
  assert.equal(sanitized.tasa_error, 25);
  assert.equal(sanitized.salud, "CRITICO");
});

test("8. sanitizeMakeScenario: criticidad depende solo de la categoría, nunca de la tasa de error/salud", () => {
  const sinDatos = sanitizeMakeScenario(RAW_MAKE_SHAPE_REAL, "APP_TRIGGERED");
  const conErrorCritico = sanitizeMakeScenario({ ...RAW_MAKE_SHAPE_REAL, executions: 100, errors: 90 }, "APP_TRIGGERED");
  assert.equal(sinDatos.criticidad, "ALTA");
  assert.equal(conErrorCritico.criticidad, "ALTA");
  assert.notEqual(sinDatos.salud, conErrorCritico.salud, "la salud sí difiere (SIN_DATOS vs CRITICO) pero la criticidad no debe verse afectada");
});

test("7. fetchLiveMakeInventory: MAKE_NOT_CONFIGURED cuando faltan secrets (estado real hoy)", async () => {
  __resetMakeLiveStateForTests();
  const result = await fetchLiveMakeInventory({});
  assert.equal(result.ok, false);
  assert.equal(result.reason, "MAKE_NOT_CONFIGURED");
});

test("7. fetchLiveMakeInventory: fail-safe si Make responde con error HTTP", async () => {
  __resetMakeLiveStateForTests();
  const env = { MAKE_API_TOKEN: "t", MAKE_API_BASE_URL: "https://fake.make.test/api/v2", MAKE_TEAM_ID: "1" };
  const fakeFetch = async () => ({ ok: false, status: 500, json: async () => ({}) });
  const result = await fetchLiveMakeInventory(env, fakeFetch);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "MAKE_UPSTREAM_ERROR");
});

test("7. fetchLiveMakeInventory: fail-safe si Make responde con una forma inesperada (no usa datos corruptos)", async () => {
  __resetMakeLiveStateForTests();
  const env = { MAKE_API_TOKEN: "t", MAKE_API_BASE_URL: "https://fake.make.test/api/v2", MAKE_TEAM_ID: "1" };
  const fakeFetch = async () => ({ ok: true, status: 200, json: async () => ({ noEsLoEsperado: true }) });
  const result = await fetchLiveMakeInventory(env, fakeFetch);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "MAKE_INVALID_RESPONSE");
});

test("7. fetchLiveMakeInventory: fail-safe si la red falla o hace throw", async () => {
  __resetMakeLiveStateForTests();
  const env = { MAKE_API_TOKEN: "t", MAKE_API_BASE_URL: "https://fake.make.test/api/v2", MAKE_TEAM_ID: "1" };
  const fakeFetch = async () => { throw new Error("network down"); };
  const result = await fetchLiveMakeInventory(env, fakeFetch);
  assert.equal(result.ok, false);
  assert.equal(result.reason, "MAKE_UPSTREAM_ERROR");
});

test("fetchLiveMakeInventory: éxito real sanitiza cada escenario devuelto", async () => {
  __resetMakeLiveStateForTests();
  const env = { MAKE_API_TOKEN: "t", MAKE_API_BASE_URL: "https://fake.make.test/api/v2", MAKE_TEAM_ID: "1" };
  const fakeFetch = async () => ({
    ok: true,
    status: 200,
    json: async () => ({ scenarios: [{ id: 1, name: "A", isActive: true, executions: 5, operations: 5, errors: 0, hookId: 42 }] }),
  });
  const result = await fetchLiveMakeInventory(env, fakeFetch);
  assert.equal(result.ok, true);
  assert.equal(result.scenarios.length, 1);
  assert.equal(result.scenarios[0].hookId, undefined);
});

test("fetchLiveMakeInventory: caché TTL corta evita una segunda llamada real dentro de la ventana", async () => {
  __resetMakeLiveStateForTests();
  const env = { MAKE_API_TOKEN: "t", MAKE_API_BASE_URL: "https://fake.make.test/api/v2", MAKE_TEAM_ID: "1" };
  let calls = 0;
  const fakeFetch = async () => {
    calls += 1;
    return { ok: true, status: 200, json: async () => ({ scenarios: [{ id: 1, name: "A", isActive: true, executions: 1, operations: 1, errors: 0 }] }) };
  };
  const now = Date.now();
  await fetchLiveMakeInventory(env, fakeFetch, now);
  await fetchLiveMakeInventory(env, fakeFetch, now + 1000);
  assert.equal(calls, 1, "la segunda llamada dentro del TTL debe servirse desde caché");
});

test("checkMakeRateLimit: permite hasta el máximo configurado y luego bloquea", () => {
  __resetMakeLiveStateForTests();
  const now = Date.now();
  let allowed = 0;
  for (let i = 0; i < 15; i += 1) {
    if (checkMakeRateLimit(now)) allowed += 1;
  }
  assert.equal(allowed, 10, "el límite documentado es 10 peticiones por ventana");
});
