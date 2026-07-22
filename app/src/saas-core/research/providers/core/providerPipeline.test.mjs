import { test } from "node:test";
import assert from "node:assert/strict";

import { runProviderPipeline, EXECUTION_MODES } from "./providerPipeline.js";
import { defineProviderResult } from "./providerTypes.js";

function fakeProvider(id, { delayMs = 0, status = "success", throwError = false } = {}) {
  return {
    id,
    async collect() {
      if (delayMs > 0) await new Promise((r) => setTimeout(r, delayMs));
      if (throwError) throw new Error(`${id} falló a propósito`);
      return defineProviderResult({ providerId: id, status });
    },
  };
}

test("EXECUTION_MODES incluye sequential/parallel/fallback", () => {
  assert.deepEqual([...EXECUTION_MODES], ["sequential", "parallel", "fallback"]);
});

test("modo fallback se detiene en el primer proveedor exitoso y no llama a los siguientes", async () => {
  let calledC = false;
  const providers = [
    fakeProvider("a", { status: "failed" }),
    { id: "b", async collect() { return defineProviderResult({ providerId: "b", status: "success" }); } },
    { id: "c", async collect() { calledC = true; return defineProviderResult({ providerId: "c", status: "success" }); } },
  ];
  const outcome = await runProviderPipeline(providers, {}, { mode: "fallback" });
  assert.equal(outcome.usedProviderId, "b");
  assert.equal(outcome.results.length, 2);
  assert.equal(calledC, false);
});

test("modo fallback: si todos fallan, usedProviderId es null y se registran todos los resultados", async () => {
  const providers = [fakeProvider("a", { status: "failed" }), fakeProvider("b", { status: "failed" })];
  const outcome = await runProviderPipeline(providers, {}, { mode: "fallback" });
  assert.equal(outcome.usedProviderId, null);
  assert.equal(outcome.results.length, 2);
});

test("modo sequential ejecuta TODOS los proveedores en orden, sin detenerse en el primer éxito", async () => {
  const order = [];
  const providers = ["a", "b", "c"].map((id) => ({ id, async collect() { order.push(id); return defineProviderResult({ providerId: id, status: "success" }); } }));
  const outcome = await runProviderPipeline(providers, {}, { mode: "sequential" });
  assert.deepEqual(order, ["a", "b", "c"]);
  assert.equal(outcome.results.length, 3);
});

test("modo parallel ejecuta todos a la vez (más rápido que la suma de sus delays)", async () => {
  const providers = [fakeProvider("a", { delayMs: 60 }), fakeProvider("b", { delayMs: 60 })];
  const started = Date.now();
  const outcome = await runProviderPipeline(providers, {}, { mode: "parallel" });
  const elapsed = Date.now() - started;
  assert.equal(outcome.results.length, 2);
  assert.ok(elapsed < 110, `se esperaba ejecución paralela (~60ms), tardó ${elapsed}ms`);
});

test("individualTimeoutMs marca timeout a un proveedor lento sin bloquear el resto", async () => {
  const providers = [fakeProvider("lento", { delayMs: 300 }), fakeProvider("rapido", { delayMs: 5 })];
  const outcome = await runProviderPipeline(providers, {}, { mode: "sequential", individualTimeoutMs: 50 });
  assert.equal(outcome.results[0].status, "timeout");
  assert.equal(outcome.results[1].status, "success");
});

test("globalTimeoutMs cancela proveedores restantes tras superarse", async () => {
  const providers = [fakeProvider("a", { delayMs: 30 }), fakeProvider("b", { delayMs: 30 }), fakeProvider("c", { delayMs: 30 })];
  const outcome = await runProviderPipeline(providers, {}, { mode: "sequential", globalTimeoutMs: 40 });
  const cancelledCount = outcome.results.filter((r) => r.status === "cancelled").length;
  assert.ok(cancelledCount >= 1, "se esperaba al menos un proveedor cancelado tras el timeout global");
});

test("un AbortSignal externo cancela el pipeline de forma segura", async () => {
  const controller = new AbortController();
  const providers = [fakeProvider("a", { delayMs: 20 }), fakeProvider("b", { delayMs: 20 })];
  setTimeout(() => controller.abort(), 10);
  const outcome = await runProviderPipeline(providers, {}, { mode: "sequential", externalSignal: controller.signal });
  assert.ok(outcome.results.some((r) => r.status === "cancelled" || r.status === "timeout"));
});

test("un proveedor que lanza produce status='failed' con el mensaje capturado, sin romper el pipeline", async () => {
  const providers = [fakeProvider("malo", { throwError: true }), fakeProvider("bueno")];
  const outcome = await runProviderPipeline(providers, {}, { mode: "sequential" });
  assert.equal(outcome.results[0].status, "failed");
  assert.match(outcome.results[0].errors[0].message, /falló a propósito/);
  assert.equal(outcome.results[1].status, "success");
});

test("runProviderPipeline rechaza un mode desconocido", async () => {
  await assert.rejects(() => runProviderPipeline([], {}, { mode: "no-existe" }));
});
