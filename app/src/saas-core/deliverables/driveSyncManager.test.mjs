import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04ComputeBackoffDelayMs, cp04CreateDriveSyncManager } from "./driveSyncManager.js";

test("cp04ComputeBackoffDelayMs duplica el retraso en cada intento (backoff exponencial puro)", () => {
  assert.equal(cp04ComputeBackoffDelayMs(1, 500), 500);
  assert.equal(cp04ComputeBackoffDelayMs(2, 500), 1000);
  assert.equal(cp04ComputeBackoffDelayMs(3, 500), 2000);
});

test("cp04ComputeBackoffDelayMs trata intentos <=0 o no numéricos como el intento 1", () => {
  assert.equal(cp04ComputeBackoffDelayMs(0, 500), 500);
  assert.equal(cp04ComputeBackoffDelayMs(undefined, 500), 500);
});

test("enqueue exige folderPath y fileName", () => {
  const manager = cp04CreateDriveSyncManager({ env: {} });
  assert.throws(() => manager.enqueue({}), TypeError);
  assert.throws(() => manager.enqueue({ folderPath: "X" }), TypeError);
});

test("enqueue acepta un item válido y lo refleja en size()", () => {
  const manager = cp04CreateDriveSyncManager({ env: {} });
  manager.enqueue({ folderPath: "Agencia IA/Clientes/X/Logos", fileName: "logo.svg", content: "<svg/>" });
  assert.equal(manager.size(), 1);
});

test("con la sincronización desactivada (por defecto), processQueue marca todo skipped_disabled sin llamar al adaptador", async () => {
  let adapterCalled = false;
  const fakeAdapter = { uploadFile: async () => { adapterCalled = true; return { status: "completed" }; } };
  const manager = cp04CreateDriveSyncManager({ env: {}, adapter: fakeAdapter });
  manager.enqueue({ folderPath: "X", fileName: "a.svg", content: "1" });
  manager.enqueue({ folderPath: "X", fileName: "b.svg", content: "2" });

  const results = await manager.processQueue();

  assert.equal(results.length, 2);
  assert.ok(results.every((r) => r.status === "skipped_disabled"));
  assert.equal(adapterCalled, false, "el adaptador nunca debe invocarse mientras la sincronización esté desactivada");
  assert.equal(manager.size(), 0, "la cola queda vacía tras procesar");
});

test("con la sincronización activada y el adaptador not_configured, no reintenta (no serviría de nada) y marca failed", async () => {
  const notConfiguredAdapter = { uploadFile: async () => ({ status: "not_configured", reason: "sin credenciales" }) };
  const manager = cp04CreateDriveSyncManager({ env: { CP04_DRIVE_SYNC_ENABLED: "true" }, adapter: notConfiguredAdapter, maxAttempts: 3 });
  manager.enqueue({ folderPath: "X", fileName: "a.svg", content: "1" });

  const [result] = await manager.processQueue();
  assert.equal(result.status, "failed");
  assert.equal(result.attempts, 1, "not_configured corta el reintento en el primer intento");
  assert.ok(result.error);
});

test("con la sincronización activada y el adaptador fallando de forma transitoria, reintenta hasta maxAttempts y calcula el siguiente backoff", async () => {
  let calls = 0;
  const flakyAdapter = { uploadFile: async () => { calls += 1; return { status: "failed", reason: "error transitorio" }; } };
  const manager = cp04CreateDriveSyncManager({ env: { CP04_DRIVE_SYNC_ENABLED: "true" }, adapter: flakyAdapter, maxAttempts: 3, baseDelayMs: 100 });
  manager.enqueue({ folderPath: "X", fileName: "a.svg", content: "1" });

  const [result] = await manager.processQueue();
  assert.equal(calls, 3);
  assert.equal(result.status, "failed");
  assert.equal(result.attempts, 3);
  assert.equal(result.nextRetryDelayMs, 400); // 100 * 2^(3-1)
});

test("con la sincronización activada y el adaptador respondiendo completed, marca synced sin más reintentos", async () => {
  let calls = 0;
  const workingAdapter = { uploadFile: async () => { calls += 1; return { status: "completed" }; } };
  const manager = cp04CreateDriveSyncManager({ env: { CP04_DRIVE_SYNC_ENABLED: "true" }, adapter: workingAdapter });
  manager.enqueue({ folderPath: "X", fileName: "a.svg", content: "1" });

  const [result] = await manager.processQueue();
  assert.equal(calls, 1);
  assert.equal(result.status, "synced");
  assert.equal(result.error, null);
});

test("getHistory acumula el resultado de todas las ejecuciones de processQueue", async () => {
  const manager = cp04CreateDriveSyncManager({ env: {} });
  manager.enqueue({ folderPath: "X", fileName: "a.svg", content: "1" });
  await manager.processQueue();
  manager.enqueue({ folderPath: "X", fileName: "b.svg", content: "2" });
  await manager.processQueue();
  assert.equal(manager.getHistory().length, 2);
});
