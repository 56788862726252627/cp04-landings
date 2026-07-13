import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveTenantContext } from "./resolveTenantContext.js";
import { mergeConfigLayers } from "./mergeConfigLayers.js";
import { loadCoreConfig } from "./loadCoreConfig.js";
import { loadVerticalConfig } from "./loadVerticalConfig.js";
import { loadClientConfig } from "./loadClientConfig.js";
import { repoPath } from "./paths.js";

function resolveCp04() {
  return mergeConfigLayers({
    core: loadCoreConfig(),
    vertical: loadVerticalConfig(),
    client: loadClientConfig(repoPath("config", "client-config.example.valid.json")),
  });
}

test("resolveTenantContext: namespaces de cache/storage llevan el prefijo tenant:<tenantId>", () => {
  const context = resolveTenantContext(resolveCp04());
  assert.equal(context.cacheNamespace, "tenant:cp04");
  assert.equal(context.storageNamespace, "tenant:cp04");
});

test("resolveTenantContext: observability context lleva tenantId y correlationPrefix", () => {
  const context = resolveTenantContext(resolveCp04());
  assert.deepEqual(context.observability, { tenantId: "cp04", correlationPrefix: "cp04:" });
});

test("resolveTenantContext: backup context declara scope client-config", () => {
  const context = resolveTenantContext(resolveCp04());
  assert.deepEqual(context.backup, { tenantId: "cp04", scope: "client-config" });
});

test("resolveTenantContext: Stripe/WhatsApp quedan siempre enabled:false, sin conexión real", () => {
  const context = resolveTenantContext(resolveCp04());
  assert.equal(context.integrations.stripe.enabled, false);
  assert.equal(context.integrations.whatsapp.enabled, false);
  assert.equal(context.integrations.stripe.customerContextRef, null);
});

test("resolveTenantContext: propaga las referencias de Make/Airtable ya declaradas en integrations", () => {
  const context = resolveTenantContext(resolveCp04());
  assert.equal(context.integrations.make.scenarioSetRef, "MAKE_RESERVAS_WEBHOOK");
  assert.equal(context.integrations.airtable.baseContextRef, "AIRTABLE_BASE_ID");
});

test("resolveTenantContext: lanza sin tenantId — ningún tenant es implícito", () => {
  assert.throws(() => resolveTenantContext({}), /ningún tenant es implícito/);
});
