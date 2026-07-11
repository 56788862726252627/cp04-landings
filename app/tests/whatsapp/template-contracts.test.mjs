import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  resolveTemplate,
  resolveTemplateWithLocaleFallback,
  buildTemplateComponents,
} from "../../worker-reservas/messaging/whatsapp-adapter.mock.js";
import { WHATSAPP_TEMPLATES } from "../../worker-reservas/messaging/whatsapp-contract.js";
import { deriveWhatsappTenantContext } from "../../scripts/whatsapp/tenant-context.mjs";
import { mergeConfigLayers } from "../../src/config/mergeConfigLayers.js";
import { loadCoreConfig } from "../../src/config/loadCoreConfig.js";
import { loadVerticalConfig } from "../../src/config/loadVerticalConfig.js";
import { loadClientConfig } from "../../src/config/loadClientConfig.js";
import { repoPath } from "../../src/config/paths.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TEMPLATES_DIR = path.resolve(__dirname, "../../fixtures/whatsapp/templates");

function loadFixture(name) {
  const { _why, ...fixture } = JSON.parse(readFileSync(path.join(TEMPLATES_DIR, name), "utf8"));
  return fixture;
}

function resolveCp04() {
  return mergeConfigLayers({
    core: loadCoreConfig(),
    vertical: loadVerticalConfig(),
    client: loadClientConfig(repoPath("config", "client-config.example.valid.json")),
  });
}

const FIXTURE_FILES = readdirSync(TEMPLATES_DIR).filter((f) => f.endsWith(".json")).sort();

// --- required variables + length constraints, las 10 plantillas -----------

test(`las 10 plantillas registradas tienen exactamente un fixture (${FIXTURE_FILES.length} ficheros)`, () => {
  assert.equal(FIXTURE_FILES.length, 10);
  assert.equal(Object.keys(WHATSAPP_TEMPLATES).length, 10);
});

for (const file of FIXTURE_FILES) {
  test(`template contract [${file}]: variables del fixture construyen components válidos (required variables + length OK)`, () => {
    const fixture = loadFixture(file);
    const result = buildTemplateComponents(fixture.template_name, fixture.variables);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
  });

  test(`template contract [${file}]: resolveTemplate() encuentra la plantilla en el idioma del fixture`, () => {
    const fixture = loadFixture(file);
    const result = resolveTemplate(fixture.template_name, fixture.language);
    assert.equal(result.found, true);
    assert.equal(result.template.name, fixture.template_name);
  });
}

// --- length constraints: variable que excede maxLength ----------------------

test("template contract: variable que excede maxLength -> variable_too_long", () => {
  const result = buildTemplateComponents("booking_confirmed", {
    player_name: "x".repeat(61), // maxLength: 60
    court_name: "Pista 1",
    date_time: "2026-07-10 10:00",
    booking_reference: "BKG-0001",
  });
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ["variable_too_long:player_name"]);
});

// --- missing variable ---------------------------------------------------------

test("template contract: falta una variable obligatoria -> missing_variable con el nombre exacto", () => {
  const result = buildTemplateComponents("booking_cancelled", {
    player_name: "Luis",
    court_name: "Pista 2",
    date_time: "2026-07-10 18:00",
    // cancellation_reason ausente
  });
  assert.equal(result.valid, false);
  assert.deepEqual(result.errors, ["missing_variable:cancellation_reason"]);
});

test("template contract: opt_out_ack no tiene variables -> components:[] sin error", () => {
  const result = buildTemplateComponents("opt_out_ack", {});
  assert.equal(result.valid, true);
  assert.deepEqual(result.components, []);
});

// --- locale --------------------------------------------------------------------

test("template contract: idioma soportado pero no es SUPPORTED_LANGUAGES -> wrong_locale", () => {
  const result = resolveTemplate("booking_confirmed", "fr");
  assert.equal(result.found, false);
  assert.equal(result.reason, "wrong_locale");
});

test("template contract: sin idioma explícito, usa el defaultLanguage de la plantilla", () => {
  const result = resolveTemplate("booking_confirmed");
  assert.equal(result.found, true);
  assert.equal(result.template.language, "es");
});

// --- fallback --------------------------------------------------------------------

test("fallback: idioma no soportado cae al defaultLanguage de la plantilla, fallback_applied:true", () => {
  const result = resolveTemplateWithLocaleFallback("booking_confirmed", "fr");
  assert.equal(result.found, true);
  assert.equal(result.template.language, "es");
  assert.equal(result.fallback_applied, true);
  assert.equal(result.requested_language, "fr");
});

test("fallback: idioma soportado no necesita fallback, fallback_applied:false", () => {
  const result = resolveTemplateWithLocaleFallback("booking_confirmed", "en_US");
  assert.equal(result.found, true);
  assert.equal(result.fallback_applied, false);
});

test("fallback: plantilla inexistente no tiene a dónde caer -> found:false, fallback_applied:false", () => {
  const result = resolveTemplateWithLocaleFallback("plantilla_inexistente", "fr");
  assert.equal(result.found, false);
  assert.equal(result.reason, "unsupported_template");
  assert.equal(result.fallback_applied, false);
});

// --- tenant context aplicado a una plantilla concreta -----------------------

test("tenant context: locale derivado de deriveWhatsappTenantContext() resuelve la plantilla sin fallback", () => {
  const tenantContext = deriveWhatsappTenantContext(resolveCp04());
  const result = resolveTemplate("booking_confirmed", tenantContext.locale);
  assert.equal(result.found, true, `locale del tenant "${tenantContext.locale}" debería estar en SUPPORTED_LANGUAGES`);
});

test("tenant context: idempotency_key de los fixtures incluye tenant_id (namespacing correcto)", () => {
  for (const file of FIXTURE_FILES) {
    const fixture = loadFixture(file);
    assert.ok(fixture.idempotency_key.includes(fixture.tenant_id), `${file}: idempotency_key "${fixture.idempotency_key}" no incluye tenant_id "${fixture.tenant_id}"`);
  }
});
