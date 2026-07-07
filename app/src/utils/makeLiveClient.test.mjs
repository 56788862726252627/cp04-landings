import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveMakeInventorySource, createSingleFlightGuard, describeLiveIssue } from "./makeLiveClient.js";

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

test("resolveMakeInventorySource: una solicitud fallida seguida de una correcta SÍ puede pasar de snapshot a live (sin estado stale)", () => {
  const fallo = resolveMakeInventorySource({ liveOk: false, liveScenarios: null, snapshotScenarios: [{ id: 99 }] });
  assert.equal(fallo.source, "snapshot");

  const exito = resolveMakeInventorySource({ liveOk: true, liveScenarios: Array.from({ length: 50 }, (_, i) => ({ id: i })), snapshotScenarios: [{ id: 99 }] });
  assert.equal(exito.source, "live");
  assert.equal(exito.scenarios.length, 50);
});

test("describeLiveIssue: sin access token real y MISSING_TOKEN -> mensaje explica que falta sesión real (no un error de backend genérico)", () => {
  const msg = describeLiveIssue("MISSING_TOKEN", false);
  assert.ok(msg && msg.toLowerCase().includes("sesión real"));
});

test("describeLiveIssue: con access token real, MISSING_TOKEN no se reescribe (sería engañoso: si hay token y aun así falta, no es el caso demo)", () => {
  assert.equal(describeLiveIssue("MISSING_TOKEN", true), null);
});

test("describeLiveIssue: 403 con sesión real (rol insuficiente) no se confunde con falta de sesión", () => {
  assert.equal(describeLiveIssue("INSUFFICIENT_ROLE", true), null);
});

test("describeLiveIssue: 503/servicio no disponible nunca se sustituye por el mensaje de sesión — el reason real llega intacto a la UI", () => {
  assert.equal(describeLiveIssue("MAKE_UNAVAILABLE", false), null);
  assert.equal(describeLiveIssue("MAKE_UNAVAILABLE", true), null);
});

test("describeLiveIssue: sin reason no produce mensaje (no inventa una causa)", () => {
  assert.equal(describeLiveIssue(null, false), null);
  assert.equal(describeLiveIssue(undefined, true), null);
});
