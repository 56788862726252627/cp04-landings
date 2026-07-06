import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveMakeInventorySource, createSingleFlightGuard } from "./makeLiveClient.js";

test("resolveMakeInventorySource: live ok con datos -> fuente live", () => {
  const result = resolveMakeInventorySource({ liveOk: true, liveScenarios: [{ id: 1 }], snapshotScenarios: [{ id: 99 }] });
  assert.equal(result.source, "live");
  assert.deepEqual(result.scenarios, [{ id: 1 }]);
});

test("resolveMakeInventorySource: 12. badge correcto — live falso cae a snapshot, nunca se etiqueta como live", () => {
  const result = resolveMakeInventorySource({ liveOk: false, liveScenarios: null, snapshotScenarios: [{ id: 99 }] });
  assert.equal(result.source, "snapshot");
  assert.deepEqual(result.scenarios, [{ id: 99 }]);
});

test("resolveMakeInventorySource: 11. fallback snapshot funciona incluso si liveScenarios es un array vacío", () => {
  const result = resolveMakeInventorySource({ liveOk: true, liveScenarios: [], snapshotScenarios: [{ id: 99 }] });
  assert.equal(result.source, "snapshot");
});

test("resolveMakeInventorySource: 15. fallo remoto total (sin live, sin snapshot) no lanza — responde NO DISPONIBLE", () => {
  assert.doesNotThrow(() => {
    const result = resolveMakeInventorySource({ liveOk: false, liveScenarios: null, snapshotScenarios: [] });
    assert.equal(result.source, "unavailable");
    assert.deepEqual(result.scenarios, []);
  });
});

test("resolveMakeInventorySource: nunca prioriza snapshot sobre live válido (no oculta datos frescos)", () => {
  const result = resolveMakeInventorySource({ liveOk: true, liveScenarios: [{ id: 1 }, { id: 2 }], snapshotScenarios: [{ id: 99 }] });
  assert.equal(result.source, "live");
  assert.equal(result.scenarios.length, 2);
});

test("createSingleFlightGuard: 14. una segunda llamada concurrente no arranca mientras la primera sigue en curso", () => {
  const guard = createSingleFlightGuard();
  assert.equal(guard.tryStart(), true, "la primera llamada debe poder arrancar");
  assert.equal(guard.tryStart(), false, "una segunda llamada mientras la primera sigue activa debe rechazarse");
  assert.equal(guard.isInFlight, true);
});

test("createSingleFlightGuard: tras finish(), una nueva llamada sí puede arrancar", () => {
  const guard = createSingleFlightGuard();
  guard.tryStart();
  guard.finish();
  assert.equal(guard.isInFlight, false);
  assert.equal(guard.tryStart(), true);
});
