import { test } from "node:test";
import assert from "node:assert/strict";

import { defineProviderExecutionPolicy, applyExecutionPolicyToRegistry, PIPELINE_MODES } from "./providerExecutionPolicy.js";
import { createProviderRegistry } from "./core/providerRegistry.js";
import { defineResearchProvider, defineProviderCapabilities } from "./core/providerTypes.js";

function fakeProvider(id, { priority = 50, status = "stub" } = {}) {
  return defineResearchProvider({ id, status, priority, capabilities: defineProviderCapabilities({ dimensions: ["*"] }), async collect() { return null; } });
}

test("PIPELINE_MODES incluye legacy y multiprovider", () => {
  assert.deepEqual([...PIPELINE_MODES], ["legacy", "multiprovider"]);
});

test("defineProviderExecutionPolicy aplica valores por defecto seguros (legacy, sin red, sin límite)", () => {
  const policy = defineProviderExecutionPolicy();
  assert.equal(policy.pipeline, "legacy");
  assert.equal(policy.execution, "fallback");
  assert.equal(policy.allowNetwork, false);
  assert.equal(policy.includeProviders, null);
  assert.deepEqual([...policy.excludeProviders], []);
  assert.equal(policy.maxConcurrency, null);
});

test("defineProviderExecutionPolicy rechaza pipeline/execution/maxConcurrency inválidos", () => {
  assert.throws(() => defineProviderExecutionPolicy({ pipeline: "no-existe" }));
  assert.throws(() => defineProviderExecutionPolicy({ execution: "no-existe" }));
  assert.throws(() => defineProviderExecutionPolicy({ maxConcurrency: 0 }));
  assert.throws(() => defineProviderExecutionPolicy({ maxConcurrency: -2 }));
  assert.throws(() => defineProviderExecutionPolicy({ includeProviders: "no-es-array" }));
});

test("defineProviderExecutionPolicy congela el resultado (no se puede mutar después)", () => {
  const policy = defineProviderExecutionPolicy({ excludeProviders: ["x"] });
  assert.throws(() => { policy.pipeline = "multiprovider"; });
});

test("applyExecutionPolicyToRegistry: includeProviders actúa como allowlist estricta", () => {
  const registry = createProviderRegistry();
  registry.register(fakeProvider("a"));
  registry.register(fakeProvider("b"));
  const policy = defineProviderExecutionPolicy({ includeProviders: ["a"] });
  applyExecutionPolicyToRegistry(registry, policy);
  assert.equal(registry.isEnabled("a"), true);
  assert.equal(registry.isEnabled("b"), false);
});

test("applyExecutionPolicyToRegistry: excludeProviders desactiva aunque esté en la allowlist", () => {
  const registry = createProviderRegistry();
  registry.register(fakeProvider("a"));
  const policy = defineProviderExecutionPolicy({ includeProviders: ["a"], excludeProviders: ["a"] });
  applyExecutionPolicyToRegistry(registry, policy);
  assert.equal(registry.isEnabled("a"), false);
});

test("applyExecutionPolicyToRegistry: nunca reactiva un proveedor con status='disabled'", () => {
  const registry = createProviderRegistry();
  registry.register(fakeProvider("d", { status: "disabled" }));
  const policy = defineProviderExecutionPolicy({ includeProviders: ["d"] });
  applyExecutionPolicyToRegistry(registry, policy);
  assert.equal(registry.isEnabled("d"), false);
});

test("applyExecutionPolicyToRegistry: providerPriorityOverrides cambia el orden de resolveFallbackChain", () => {
  const registry = createProviderRegistry();
  registry.register(fakeProvider("a", { priority: 50 }));
  registry.register(fakeProvider("b", { priority: 60 }));
  const policy = defineProviderExecutionPolicy({ providerPriorityOverrides: { b: 5 } });
  applyExecutionPolicyToRegistry(registry, policy);
  const chain = registry.resolveFallbackChain("*").map((p) => p.id);
  assert.deepEqual(chain, ["b", "a"]);
});
