import { test } from "node:test";
import assert from "node:assert/strict";

import { PROVIDER } from "./publicWebsiteFetcherPlugin.js";

test("PROVIDER conforma la interfaz ResearchProvider unificada", () => {
  assert.equal(PROVIDER.id, "publicWebsiteFetcher");
  assert.equal(PROVIDER.status, "real");
  assert.equal(PROVIDER.priority, 10);
  assert.deepEqual([...PROVIDER.capabilities.dimensions], ["*"]);
});

test("collect() sin URLs devuelve status='skipped' sin intentar red", async () => {
  const result = await PROVIDER.collect({ urls: [] });
  assert.equal(result.status, "skipped");
});

test("collect() con una URL insegura (SSRF) devuelve status='failed' sin lanzar y sin conectar de verdad", async () => {
  const result = await PROVIDER.collect({ urls: ["http://127.0.0.1/"] });
  assert.equal(result.status, "failed");
  assert.equal(result.evidence.length, 1);
  assert.equal(result.evidence[0].classification, "unavailable");
});

test("healthCheck() delega en el proveedor real de Paso 13 y devuelve la forma ProviderHealth", async () => {
  const health = await PROVIDER.healthCheck();
  assert.equal(health.healthy, true);
  assert.equal(typeof health.message, "string");
});
