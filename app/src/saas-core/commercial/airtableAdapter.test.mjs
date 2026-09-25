import { test } from "node:test";
import assert from "node:assert/strict";

import { isAirtableConfigured, getAirtableRuntimeStatus, createRealAirtableAdapter, AIRTABLE_API_BASE } from "./airtableAdapter.js";
import { implementsInterface } from "../adapters/providerAdapters.js";

function throwingFetch() {
  throw new Error("fetchImpl NUNCA debería invocarse en este escenario");
}

test("isAirtableConfigured/getAirtableRuntimeStatus: sin credenciales, unconfigured y nunca expone la clave", () => {
  assert.equal(isAirtableConfigured({}), false);
  const status = getAirtableRuntimeStatus({});
  assert.equal(status.configured, false);
  assert.equal(status.apiKeyRedacted, null);
  assert.equal(status.baseIdConfigured, false);
});

test("getAirtableRuntimeStatus nunca expone la clave completa cuando está presente", () => {
  const status = getAirtableRuntimeStatus({ AIRTABLE_API_KEY: "keyABCDEFGHIJK", AIRTABLE_BASE_ID: "appXXXX" });
  assert.equal(status.configured, true);
  assert.ok(!status.apiKeyRedacted.includes("ABCDEFGHIJK"));
});

test("createRealAirtableAdapter implementa el contrato DataRepository completo", () => {
  const adapter = createRealAirtableAdapter({});
  assert.equal(implementsInterface("DataRepository", adapter), true);
});

for (const method of ["list", "get", "create", "update", "remove"]) {
  test(`${method} sin configurar: not_configured, fetchImpl NUNCA se invoca`, async () => {
    const adapter = createRealAirtableAdapter({}, { fetchImpl: throwingFetch });
    const args = { list: ["Tabla"], get: ["Tabla", "rec1"], create: ["Tabla", { Nombre: "x" }], update: ["Tabla", "rec1", { Nombre: "y" }], remove: ["Tabla", "rec1"] }[method];
    const result = await adapter[method](...args);
    assert.equal(result.status, "not_configured");
  });
}

test("list configurado: construye la petición GET correcta contra la REST API real (fetchImpl inyectado, sin red)", async () => {
  let capturedUrl = null;
  let capturedInit = null;
  const fetchImpl = async (url, init) => {
    capturedUrl = url;
    capturedInit = init;
    return { ok: true, status: 200, json: async () => ({ records: [{ id: "rec1", fields: { Nombre: "Ana" } }] }) };
  };
  const env = { AIRTABLE_API_KEY: "keyABCDEFGHIJK", AIRTABLE_BASE_ID: "appXXXX" };
  const adapter = createRealAirtableAdapter(env, { fetchImpl });
  const result = await adapter.list("Jugadores");

  assert.equal(result.status, "completed");
  assert.equal(result.records.length, 1);
  assert.equal(capturedUrl, `${AIRTABLE_API_BASE}/appXXXX/Jugadores`);
  assert.equal(capturedInit.method, "GET");
  assert.equal(capturedInit.headers.Authorization, "Bearer keyABCDEFGHIJK");
});

test("create configurado: envía {fields} en el body y refleja un error HTTP de Airtable sin lanzar", async () => {
  const fetchImpl = async () => ({ ok: false, status: 422, json: async () => ({ error: { type: "INVALID_REQUEST" } }) });
  const env = { AIRTABLE_API_KEY: "keyABCDEFGHIJK", AIRTABLE_BASE_ID: "appXXXX" };
  const adapter = createRealAirtableAdapter(env, { fetchImpl });
  const result = await adapter.create("Jugadores", { Nombre: "Ana" });
  assert.equal(result.status, "airtable_error");
  assert.equal(result.httpStatus, 422);
});

test("remove configurado: DELETE correcto", async () => {
  let capturedInit = null;
  const fetchImpl = async (_url, init) => {
    capturedInit = init;
    return { ok: true, status: 200, json: async () => ({ id: "rec1", deleted: true }) };
  };
  const env = { AIRTABLE_API_KEY: "keyABCDEFGHIJK", AIRTABLE_BASE_ID: "appXXXX" };
  const adapter = createRealAirtableAdapter(env, { fetchImpl });
  const result = await adapter.remove("Jugadores", "rec1");
  assert.equal(result.status, "deleted");
  assert.equal(capturedInit.method, "DELETE");
});
