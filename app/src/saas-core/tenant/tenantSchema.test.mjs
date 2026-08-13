import { test } from "node:test";
import assert from "node:assert/strict";
import { validateTenantConfig, assertValidTenantConfig, TENANT_SCHEMA_VERSION } from "./tenantSchema.js";
import { CLUB_PADEL_04_TENANT } from "./defaultTenant.js";

test("el tenant por defecto Club Pádel 04 valida contra el esquema central", () => {
  const { valid, errors } = validateTenantConfig(CLUB_PADEL_04_TENANT);
  assert.deepEqual(errors, []);
  assert.equal(valid, true);
});

test("rechaza configuración que no es un objeto", () => {
  assert.equal(validateTenantConfig(null).valid, false);
  assert.equal(validateTenantConfig("club-padel-04").valid, false);
  assert.equal(validateTenantConfig(42).valid, false);
  assert.equal(validateTenantConfig([]).valid, false);
});

test("rechaza propiedades de nivel superior desconocidas de forma segura (no lanza)", () => {
  const { valid, errors } = validateTenantConfig({ ...CLUB_PADEL_04_TENANT, unknownField: "x" });
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "unknownField"));
});

test("detecta campos obligatorios ausentes", () => {
  const { valid, errors } = validateTenantConfig({});
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "tenantId"));
  assert.ok(errors.some((e) => e.path === "slug"));
  assert.ok(errors.some((e) => e.path === "businessType"));
});

test("slug debe ser kebab-case en minúsculas", () => {
  const invalid = { ...CLUB_PADEL_04_TENANT, slug: "Club Padel 04!" };
  assert.equal(validateTenantConfig(invalid).valid, false);
});

test("businessType y sector deben pertenecer a las listas conocidas", () => {
  const badType = { ...CLUB_PADEL_04_TENANT, businessType: "spaceship-rental" };
  assert.equal(validateTenantConfig(badType).valid, false);
  const badSector = { ...CLUB_PADEL_04_TENANT, sector: "astrology" };
  assert.equal(validateTenantConfig(badSector).valid, false);
});

test("schemaVersion incorrecta se marca como error explícito", () => {
  const bad = { ...CLUB_PADEL_04_TENANT, schemaVersion: 99 };
  const { valid, errors } = validateTenantConfig(bad);
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "schemaVersion"));
  assert.equal(TENANT_SCHEMA_VERSION, 1);
});

test("integrations.envVars nunca debe contener valores tipo secreto", () => {
  const bad = {
    ...CLUB_PADEL_04_TENANT,
    integrations: { payments: { status: "connected", envVars: ["STRIPE_SECRET_KEY=sk_live_abc123"] } },
  };
  assert.equal(validateTenantConfig(bad).valid, false);
});

test("detecta un secreto embebido directamente en la configuración", () => {
  const bad = { ...CLUB_PADEL_04_TENANT, meta: { note: "sk_live_51ABCDEF" } };
  assert.equal(validateTenantConfig(bad).valid, false);
});

test("branding.colors debe ser hexadecimal", () => {
  const bad = { ...CLUB_PADEL_04_TENANT, branding: { colors: { accent: "not-a-color" } } };
  assert.equal(validateTenantConfig(bad).valid, false);
});

test("assertValidTenantConfig lanza con el detalle de errores para config inválida", () => {
  assert.throws(() => assertValidTenantConfig({}), /Configuración de tenant inválida/);
});

test("assertValidTenantConfig devuelve la config cuando es válida", () => {
  assert.equal(assertValidTenantConfig(CLUB_PADEL_04_TENANT), CLUB_PADEL_04_TENANT);
});

test("modulesEnabled y roles deben ser arrays de strings", () => {
  assert.equal(validateTenantConfig({ ...CLUB_PADEL_04_TENANT, roles: [] }).valid, false);
  assert.equal(validateTenantConfig({ ...CLUB_PADEL_04_TENANT, roles: [1, 2] }).valid, false);
  assert.equal(validateTenantConfig({ ...CLUB_PADEL_04_TENANT, modulesEnabled: "inicio" }).valid, false);
});
