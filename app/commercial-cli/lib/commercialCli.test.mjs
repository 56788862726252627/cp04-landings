import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, writeFile, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { resolveFormat, resolveDeviceFilter, resolveViewFilter, resolveScenarioFilter, resolveProfileId, resolveCommercialInputFromArgs, resolveMockIntegrationsEnv, CommercialCliError } from "./commercialCli.mjs";

test("resolveFormat: por defecto markdown; acepta json/html; rechaza desconocido", () => {
  assert.equal(resolveFormat({}), "markdown");
  assert.equal(resolveFormat({ format: "json" }), "json");
  assert.equal(resolveFormat({ format: "html" }), "html");
  assert.throws(() => resolveFormat({ format: "pdf" }), CommercialCliError);
});

test("resolveDeviceFilter: 'all' por defecto expande a los 3 dispositivos; uno concreto se mantiene; rechaza desconocido", () => {
  assert.deepEqual(resolveDeviceFilter({}), ["mobile", "tablet", "desktop"]);
  assert.deepEqual(resolveDeviceFilter({ device: "mobile" }), ["mobile"]);
  assert.throws(() => resolveDeviceFilter({ device: "smartwatch" }), CommercialCliError);
});

test("resolveViewFilter: 'all' expande a las 7 vistas; rechaza desconocida", () => {
  assert.equal(resolveViewFilter({}).length, 7);
  assert.deepEqual(resolveViewFilter({ view: "roi" }), ["roi"]);
  assert.throws(() => resolveViewFilter({ view: "otra" }), CommercialCliError);
});

test("resolveScenarioFilter: 'all' por defecto; acepta conservative/central/optimistic; rechaza desconocido", () => {
  assert.equal(resolveScenarioFilter({}), "all");
  assert.equal(resolveScenarioFilter({ scenario: "central" }), "central");
  assert.throws(() => resolveScenarioFilter({ scenario: "raro" }), CommercialCliError);
});

test("resolveProfileId: sin --profile devuelve null; acepta un id válido; rechaza uno desconocido", () => {
  assert.equal(resolveProfileId({}), null);
  assert.equal(resolveProfileId({ profile: "restaurante" }), "restaurante");
  assert.equal(resolveProfileId({ profile: "generic" }), "generic");
  assert.throws(() => resolveProfileId({ profile: "sector-raro" }), CommercialCliError);
});

test("resolveCommercialInputFromArgs sin --input ni flags: input vacío, nunca inventa datos", async () => {
  const input = await resolveCommercialInputFromArgs({});
  assert.equal(input.profileId, null);
  assert.deepEqual(input.business, {});
  assert.deepEqual(input.auditScores, {});
});

test("resolveCommercialInputFromArgs con --business-name/--sector/--profile construye el input mínimo", async () => {
  const input = await resolveCommercialInputFromArgs({ "business-name": "Club X", sector: "padel-sports", profile: "club-deportivo" });
  assert.equal(input.business.name, "Club X");
  assert.equal(input.business.sector, "padel-sports");
  assert.equal(input.profileId, "club-deportivo");
});

test("resolveCommercialInputFromArgs con --input=<ruta.json> carga y fusiona el archivo", async () => {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-commercial-cli-"));
  try {
    const file = path.join(dir, "input.json");
    await writeFile(file, JSON.stringify({ profileId: "hotel", business: { name: "Hotel Demo" }, roiInputs: { averageTicket: 100 } }), "utf8");
    const input = await resolveCommercialInputFromArgs({ input: file });
    assert.equal(input.profileId, "hotel");
    assert.equal(input.business.name, "Hotel Demo");
    assert.equal(input.roiInputs.averageTicket, 100);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("resolveCommercialInputFromArgs con --input inexistente o JSON inválido lanza CommercialCliError, nunca un error crudo", async () => {
  await assert.rejects(() => resolveCommercialInputFromArgs({ input: "/no/existe/x.json" }), CommercialCliError);
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-commercial-cli-bad-"));
  try {
    const file = path.join(dir, "bad.json");
    await writeFile(file, "{ esto no es json", "utf8");
    await assert.rejects(() => resolveCommercialInputFromArgs({ input: file }), CommercialCliError);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test("resolveMockIntegrationsEnv sin --mock-integrations devuelve {} (nunca activa credenciales por defecto)", () => {
  assert.deepEqual(resolveMockIntegrationsEnv({}), {});
});

test("resolveMockIntegrationsEnv con --mock-integrations devuelve credenciales de TEST claramente marcadas como mock, nunca reales", () => {
  const env = resolveMockIntegrationsEnv({ "mock-integrations": true });
  assert.match(env.STRIPE_SECRET_KEY, /^sk_test_mock/);
  assert.match(env.WHATSAPP_ACCESS_TOKEN, /^mock_/);
});
