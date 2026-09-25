import { test } from "node:test";
import assert from "node:assert/strict";

import { createProviderCircuitBreaker } from "./providerCircuitBreaker.js";

test("un único fallo NUNCA bloquea el proveedor (degradación controlada)", () => {
  const breaker = createProviderCircuitBreaker({ failureThreshold: 3 });
  breaker.recordResult("p", "failed");
  assert.equal(breaker.isBlocked("p"), false);
  assert.equal(breaker.getState("p").consecutiveFailures, 1);
});

test("tras alcanzar failureThreshold fallos consecutivos, el proveedor queda blocked", () => {
  const breaker = createProviderCircuitBreaker({ failureThreshold: 3 });
  breaker.recordResult("p", "failed");
  breaker.recordResult("p", "timeout");
  assert.equal(breaker.isBlocked("p"), false);
  breaker.recordResult("p", "failed");
  assert.equal(breaker.isBlocked("p"), true);
});

test("un éxito tras fallos reinicia el contador y desbloquea", () => {
  const breaker = createProviderCircuitBreaker({ failureThreshold: 2 });
  breaker.recordResult("p", "failed");
  breaker.recordResult("p", "failed");
  assert.equal(breaker.isBlocked("p"), true);
  breaker.recordResult("p", "success");
  assert.equal(breaker.isBlocked("p"), false);
  assert.equal(breaker.getState("p").consecutiveFailures, 0);
});

test("skipped/cancelled/not_implemented no cuentan como fallo real", () => {
  const breaker = createProviderCircuitBreaker({ failureThreshold: 1 });
  breaker.recordResult("p", "skipped");
  breaker.recordResult("p", "cancelled");
  breaker.recordResult("p", "not_implemented");
  assert.equal(breaker.isBlocked("p"), false);
  assert.equal(breaker.getState("p").consecutiveFailures, 0);
});

test("los proveedores son independientes entre sí", () => {
  const breaker = createProviderCircuitBreaker({ failureThreshold: 1 });
  breaker.recordResult("a", "failed");
  assert.equal(breaker.isBlocked("a"), true);
  assert.equal(breaker.isBlocked("b"), false);
});

test("reset() olvida el estado de un proveedor concreto", () => {
  const breaker = createProviderCircuitBreaker({ failureThreshold: 1 });
  breaker.recordResult("a", "failed");
  breaker.reset("a");
  assert.equal(breaker.isBlocked("a"), false);
  assert.equal(breaker.getState("a").consecutiveFailures, 0);
});

test("snapshot() refleja el estado de todos los proveedores registrados hasta ahora", () => {
  const breaker = createProviderCircuitBreaker({ failureThreshold: 1 });
  breaker.recordResult("a", "failed");
  breaker.recordResult("b", "success");
  const snap = breaker.snapshot();
  assert.equal(snap.a.blocked, true);
  assert.equal(snap.b.blocked, false);
});

test("createProviderCircuitBreaker rechaza failureThreshold inválido", () => {
  assert.throws(() => createProviderCircuitBreaker({ failureThreshold: 0 }));
  assert.throws(() => createProviderCircuitBreaker({ failureThreshold: -1 }));
  assert.throws(() => createProviderCircuitBreaker({ failureThreshold: 1.5 }));
});
