import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import { validateAgainstSchema } from "./schemaValidator.js";

const APP_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
function loadJson(relPath) {
  return JSON.parse(readFileSync(path.join(APP_ROOT, relPath), "utf8"));
}

test("client-config.example.valid.json → 0 errores contra client-config.schema.json", () => {
  const schema = loadJson("config/client-config.schema.json");
  const doc = loadJson("config/client-config.example.valid.json");
  const result = validateAgainstSchema(schema, doc);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test("client-config.example.invalid.json → 10 errores contra client-config.schema.json (una por regla documentada en CLIENT_CONFIG_SCHEMA_GUIDE.md)", () => {
  const schema = loadJson("config/client-config.schema.json");
  const doc = loadJson("config/client-config.example.invalid.json");
  const result = validateAgainstSchema(schema, doc);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 10, JSON.stringify(result.errors, null, 2));
});

test("deployment-profile.example.valid.json → 0 errores contra deployment-profile.schema.json", () => {
  const schema = loadJson("config/deployment-profile.schema.json");
  const doc = loadJson("config/deployment-profile.example.valid.json");
  const result = validateAgainstSchema(schema, doc);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test("deployment-profile.example.invalid.json → 14 errores contra deployment-profile.schema.json", () => {
  const schema = loadJson("config/deployment-profile.schema.json");
  const doc = loadJson("config/deployment-profile.example.invalid.json");
  const result = validateAgainstSchema(schema, doc);
  assert.equal(result.valid, false);
  assert.equal(result.errors.length, 14, JSON.stringify(result.errors, null, 2));
});

test("core-config.default.json → 0 errores contra core-config.schema.json", () => {
  const schema = loadJson("config/core-config.schema.json");
  const doc = loadJson("config/core-config.default.json");
  const result = validateAgainstSchema(schema, doc);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test("vertical-config.padel.json → 0 errores contra vertical-config.schema.json", () => {
  const schema = loadJson("config/vertical-config.schema.json");
  const doc = loadJson("config/vertical-config.padel.json");
  const result = validateAgainstSchema(schema, doc);
  assert.deepEqual(result.errors, []);
  assert.equal(result.valid, true);
});

test("additionalProperties:false detecta una key desconocida", () => {
  const result = validateAgainstSchema(
    { type: "object", additionalProperties: false, properties: { a: { type: "string" } } },
    { a: "x", b: "sobra" }
  );
  assert.equal(result.valid, false);
  assert.equal(result.errors[0].path, "$.b");
});

test("const soporta arrays (deep equal), no solo primitivos", () => {
  const schema = { type: "array", items: { type: "string" }, const: ["reservas"] };
  assert.equal(validateAgainstSchema(schema, ["reservas"]).valid, true);
  assert.equal(validateAgainstSchema(schema, ["otra"]).valid, false);
});

test("if/then/else aplica la rama correcta", () => {
  const schema = {
    type: "object",
    if: { properties: { env: { const: "production" } }, required: ["env"] },
    then: { properties: { qa: { const: "PASS" } }, required: ["qa"] },
  };
  assert.equal(validateAgainstSchema(schema, { env: "production", qa: "PASS" }).valid, true);
  assert.equal(validateAgainstSchema(schema, { env: "production", qa: "PENDING" }).valid, false);
  assert.equal(validateAgainstSchema(schema, { env: "staging", qa: "PENDING" }).valid, true);
});

test("$ref/$defs local se resuelve", () => {
  const schema = {
    type: "object",
    properties: { g: { $ref: "#/$defs/gate" } },
    $defs: { gate: { type: "string", enum: ["PASS", "FAIL"] } },
  };
  assert.equal(validateAgainstSchema(schema, { g: "PASS" }).valid, true);
  assert.equal(validateAgainstSchema(schema, { g: "OTRO" }).valid, false);
});

test("format email/uri/hostname rechaza valores inválidos", () => {
  assert.equal(validateAgainstSchema({ type: "string", format: "email" }, "no-es-email").valid, false);
  assert.equal(validateAgainstSchema({ type: "string", format: "email" }, "a@b.com").valid, true);
  assert.equal(validateAgainstSchema({ type: "string", format: "hostname" }, "club-padel-04.pages.dev").valid, true);
  assert.equal(validateAgainstSchema({ type: "string", format: "hostname" }, "no es host*name").valid, false);
});
