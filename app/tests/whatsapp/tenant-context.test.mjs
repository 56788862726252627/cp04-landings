import test from "node:test";
import assert from "node:assert/strict";
import { deriveWhatsappTenantContext, toMetaLocale } from "../../scripts/whatsapp/tenant-context.mjs";
import { mergeConfigLayers } from "../../src/config/mergeConfigLayers.js";
import { loadCoreConfig } from "../../src/config/loadCoreConfig.js";
import { loadVerticalConfig } from "../../src/config/loadVerticalConfig.js";
import { loadClientConfig } from "../../src/config/loadClientConfig.js";
import { repoPath } from "../../src/config/paths.js";

function resolveCp04() {
  return mergeConfigLayers({
    core: loadCoreConfig(),
    vertical: loadVerticalConfig(),
    client: loadClientConfig(repoPath("config", "client-config.example.valid.json")),
  });
}

test("toMetaLocale: convierte guion a guion bajo", () => {
  assert.equal(toMetaLocale("es-ES"), "es_ES");
  assert.equal(toMetaLocale("en-US"), "en_US");
});

test("toMetaLocale: idioma sin región se devuelve sin cambios", () => {
  assert.equal(toMetaLocale("es"), "es");
});

test("toMetaLocale: null/undefined devuelve null, nunca lanza", () => {
  assert.equal(toMetaLocale(null), null);
  assert.equal(toMetaLocale(undefined), null);
});

test("deriveWhatsappTenantContext: expone los 7 campos exigidos por la misión", () => {
  const context = deriveWhatsappTenantContext(resolveCp04());
  assert.deepEqual(Object.keys(context).sort(), [
    "client_id",
    "locale",
    "phone_number_id_reference",
    "sender_profile",
    "template_namespace",
    "tenant_id",
    "timezone",
  ]);
});

test("deriveWhatsappTenantContext: tenant_id coincide con resolveTenantContext()", () => {
  const context = deriveWhatsappTenantContext(resolveCp04());
  assert.equal(context.tenant_id, "cp04");
});

test("deriveWhatsappTenantContext: locale ya viene convertido a formato Meta (guion bajo)", () => {
  const context = deriveWhatsappTenantContext(resolveCp04());
  assert.equal(context.locale, "es_ES");
});

test("deriveWhatsappTenantContext: template_namespace deriva de tenant_id", () => {
  const context = deriveWhatsappTenantContext(resolveCp04());
  assert.equal(context.template_namespace, `wa_${context.tenant_id}`);
});

test("deriveWhatsappTenantContext: sender_profile.display_name viene de brand.name", () => {
  const context = deriveWhatsappTenantContext(resolveCp04());
  assert.equal(context.sender_profile.display_name, "Club Pádel 04");
});

test("deriveWhatsappTenantContext: phone_number_id_reference es null hoy (sin campo dedicado en client-config)", () => {
  const context = deriveWhatsappTenantContext(resolveCp04());
  assert.equal(context.phone_number_id_reference, null);
});

test("deriveWhatsappTenantContext: sin tenantId en resolvedConfig, lanza (ningún tenant es implícito)", () => {
  assert.throws(() => deriveWhatsappTenantContext({}));
});

test("deriveWhatsappTenantContext: timezone se propaga sin transformar", () => {
  const context = deriveWhatsappTenantContext(resolveCp04());
  assert.equal(context.timezone, "Europe/Madrid");
});
