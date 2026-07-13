import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
  validateResolvedConfig,
  checkTenantRegistryDuplicates,
  checkTenantActiveForPromotion,
} from "./validateResolvedConfig.js";
import { mergeConfigLayers } from "./mergeConfigLayers.js";
import { loadCoreConfig } from "./loadCoreConfig.js";
import { loadVerticalConfig } from "./loadVerticalConfig.js";
import { loadClientConfig } from "./loadClientConfig.js";
import { loadTenantRegistry } from "./loadTenantRegistry.js";
import { repoPath } from "./paths.js";

function loadLayers() {
  return { core: loadCoreConfig(), vertical: loadVerticalConfig() };
}

function resolveClient(relPath) {
  const { core, vertical } = loadLayers();
  const client = loadClientConfig(repoPath(...relPath));
  return { core, resolved: mergeConfigLayers({ core, vertical, client }) };
}

test("validateResolvedConfig: Club Pádel 04 resuelto no tiene ninguna violación", () => {
  const { core, resolved } = resolveClient(["config", "client-config.example.valid.json"]);
  const result = validateResolvedConfig(resolved, { core });
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test("validateResolvedConfig: SECRET_LITERAL — webhookRef con forma de secreto real, no de referencia", () => {
  const { core, resolved } = resolveClient(["fixtures", "tenant-config", "invalid-secret-literal.client-config.json"]);
  const result = validateResolvedConfig(resolved, { core });
  assert.ok(result.errors.some((e) => e.code === "SECRET_LITERAL"));
});

test("validateResolvedConfig: CROSS_TENANT_REFERENCE — webhookRef apunta a otro tenant del registro", () => {
  const { core, resolved } = resolveClient(["fixtures", "tenant-config", "invalid-cross-tenant-reference.client-config.json"]);
  const registry = loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
  const result = validateResolvedConfig(resolved, { core, registry });
  assert.ok(result.errors.some((e) => e.code === "CROSS_TENANT_REFERENCE" && e.message.includes("fixture-club-02")));
});

test("validateResolvedConfig: sin registry, no reporta CROSS_TENANT_REFERENCE (check opcional)", () => {
  const { core, resolved } = resolveClient(["fixtures", "tenant-config", "invalid-cross-tenant-reference.client-config.json"]);
  const result = validateResolvedConfig(resolved, { core });
  assert.ok(!result.errors.some((e) => e.code === "CROSS_TENANT_REFERENCE"));
});

test("validateResolvedConfig: MISSING_LOCALE + INVALID_TIMEZONE se detectan si se manipula el resuelto directamente", () => {
  const { core, resolved } = resolveClient(["config", "client-config.example.valid.json"]);
  const tampered = { ...resolved, locale: {}, timezone: "NotATimezone" };
  const result = validateResolvedConfig(tampered, { core });
  assert.ok(result.errors.some((e) => e.code === "MISSING_LOCALE"));
  assert.ok(result.errors.some((e) => e.code === "INVALID_TIMEZONE"));
});

test("validateResolvedConfig: INVALID_BUSINESS_HOURS si reservas está ON sin bookingHours", () => {
  const { core, resolved } = resolveClient(["config", "client-config.example.valid.json"]);
  const tampered = { ...resolved, bookingHours: [] };
  const result = validateResolvedConfig(tampered, { core });
  assert.ok(result.errors.some((e) => e.code === "INVALID_BUSINESS_HOURS"));
});

test("validateResolvedConfig: INCOMPATIBLE_INTEGRATION si integrations.payments.enabled queda en true por manipulación", () => {
  const { core, resolved } = resolveClient(["config", "client-config.example.valid.json"]);
  const tampered = { ...resolved, integrations: { ...resolved.integrations, payments: { provider: "stripe", enabled: true } } };
  const result = validateResolvedConfig(tampered, { core });
  assert.ok(result.errors.some((e) => e.code === "INCOMPATIBLE_INTEGRATION"));
});

test("validateResolvedConfig: FORBIDDEN_OVERRIDE si features.pagos queda true tras manipular el resuelto", () => {
  const { core, resolved } = resolveClient(["config", "client-config.example.valid.json"]);
  const tampered = { ...resolved, features: { ...resolved.features, pagos: true } };
  const result = validateResolvedConfig(tampered, { core });
  assert.ok(result.errors.some((e) => e.code === "FORBIDDEN_OVERRIDE"));
});

// --- checkTenantRegistryDuplicates (Fase 4 + fixture 8) ---

test("checkTenantRegistryDuplicates: config/tenant-registry.example.valid.json no tiene duplicados", () => {
  const registry = loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
  const result = checkTenantRegistryDuplicates(registry);
  assert.equal(result.valid, true);
});

test("checkTenantRegistryDuplicates: DUPLICATE_TENANT_ID + DUPLICATE_DOMAIN en config/tenant-registry.example.invalid.json", () => {
  const registry = loadTenantRegistry(repoPath("config", "tenant-registry.example.invalid.json"));
  const result = checkTenantRegistryDuplicates(registry);
  assert.equal(result.valid, false);
  const codes = result.errors.map((e) => e.code);
  assert.ok(codes.includes("DUPLICATE_TENANT_ID"));
  assert.ok(codes.includes("DUPLICATE_DOMAIN"));
});

test("checkTenantRegistryDuplicates: DUPLICATE_DOMAIN aislado (fixture 8, tenantIds distintos)", () => {
  const registry = loadTenantRegistry(repoPath("fixtures", "tenant-config", "invalid-duplicate-domain.registry.json"));
  const result = checkTenantRegistryDuplicates(registry);
  assert.equal(result.valid, false);
  const codes = result.errors.map((e) => e.code);
  assert.deepEqual(codes, ["DUPLICATE_DOMAIN"]);
});

// --- checkTenantActiveForPromotion (Fase 9 + fixture 10) ---

test("checkTenantActiveForPromotion: bloquea production para un tenant disabled (fixture 10)", () => {
  const registry = loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
  const raw = JSON.parse(
    readFileSync(
      repoPath("fixtures", "tenant-config", "invalid-disabled-tenant-deployment.deployment-profile.json"),
      "utf8"
    )
  );
  const result = checkTenantActiveForPromotion(raw, registry);
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].code, "DISABLED_TENANT_DEPLOYMENT");
});

test("checkTenantActiveForPromotion: permite production para un tenant active", () => {
  const registry = loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
  const result = checkTenantActiveForPromotion({ clientSlug: "club-padel-04", environment: "production" }, registry);
  assert.equal(result.valid, true);
});

test("checkTenantActiveForPromotion: no bloquea development/staging aunque el tenant no esté active", () => {
  const registry = loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
  const result = checkTenantActiveForPromotion({ clientSlug: "club-deportivo-fixture-tres", environment: "staging" }, registry);
  assert.equal(result.valid, true);
});

test("checkTenantActiveForPromotion: UNKNOWN_TENANT si clientSlug no existe en el registry (referencia inexistente) — ni siquiera para development/staging", () => {
  const registry = loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
  const result = checkTenantActiveForPromotion({ clientSlug: "cliente-que-no-existe", environment: "development" }, registry);
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].code, "UNKNOWN_TENANT");
});
