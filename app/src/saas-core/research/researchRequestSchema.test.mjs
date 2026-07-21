import { test } from "node:test";
import assert from "node:assert/strict";

import { buildResearchRequest, validateResearchRequest, assertValidResearchRequest, computeRequestId, migrateResearchRequest, RESEARCH_REQUEST_SCHEMA_VERSION } from "./researchRequestSchema.js";

test("buildResearchRequest produce un Research Request válido con defaults seguros (offline)", () => {
  const request = buildResearchRequest({ business: { name: "Club Pádel Demo", sector: "padel-sports" } });
  const { valid, errors } = validateResearchRequest(request);
  assert.equal(valid, true, JSON.stringify(errors));
  assert.equal(request.mode, "offline");
  assert.equal(request.schemaVersion, RESEARCH_REQUEST_SCHEMA_VERSION);
});

test("computeRequestId es determinista para el mismo business+inputs+seed", () => {
  const a = computeRequestId({ business: { name: "X", sector: "dental" }, inputs: {}, seed: "s1" });
  const b = computeRequestId({ business: { name: "X", sector: "dental" }, inputs: {}, seed: "s1" });
  const c = computeRequestId({ business: { name: "X", sector: "dental" }, inputs: {}, seed: "s2" });
  assert.equal(a, b);
  assert.notEqual(a, c);
});

test("validateResearchRequest rechaza campos obligatorios ausentes", () => {
  const { valid, errors } = validateResearchRequest({});
  assert.equal(valid, false);
  assert.ok(errors.some((e) => e.path === "business"));
});

test("validateResearchRequest rechaza un mode desconocido", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, mode: "hackeado" });
  assert.equal(validateResearchRequest(request).valid, false);
});

test("validateResearchRequest rechaza propiedades de nivel superior desconocidas", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" } });
  request.campoInventado = true;
  assert.equal(validateResearchRequest(request).valid, false);
});

test("validateResearchRequest detecta un secreto embebido en cualquier parte del request", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, metadata: { token: "sk_live_abc123456789" } });
  assert.equal(validateResearchRequest(request).valid, false);
});

test("validateResearchRequest rechaza limits con valores no numéricos o no positivos", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, limits: { maxSources: -5 } });
  assert.equal(validateResearchRequest(request).valid, false);
});

test("assertValidResearchRequest lanza con mensaje útil para un request inválido", () => {
  assert.throws(() => assertValidResearchRequest({}), /Research Request inválido/);
});

test("assertValidResearchRequest devuelve el mismo request si es válido", () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" } });
  assert.equal(assertValidResearchRequest(request), request);
});

test("migrateResearchRequest asigna schemaVersion a un request legacy sin mutar el original", () => {
  const legacy = { business: { name: "X", sector: "dental" } };
  const { request, migrated, notes } = migrateResearchRequest(legacy);
  assert.equal(migrated, true);
  assert.equal(request.schemaVersion, RESEARCH_REQUEST_SCHEMA_VERSION);
  assert.equal(legacy.schemaVersion, undefined);
  assert.ok(notes.length > 0);
});

test("migrateResearchRequest lanza para una versión futura desconocida", () => {
  assert.throws(() => migrateResearchRequest({ schemaVersion: 99 }));
});
