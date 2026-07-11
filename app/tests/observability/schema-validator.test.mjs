import test from "node:test";
import assert from "node:assert/strict";
import { validateAgainstSchema } from "../../scripts/observability/schema-validator.mjs";

const SIMPLE_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["name", "count", "status"],
  properties: {
    name: { type: "string", minLength: 1, maxLength: 10 },
    count: { type: "integer", minimum: 0, maximum: 100 },
    status: { type: "string", enum: ["ok", "degraded"] },
    note: { type: ["string", "null"] },
  },
};

test("acepta un objeto que cumple el esquema", () => {
  const result = validateAgainstSchema(SIMPLE_SCHEMA, { name: "x", count: 5, status: "ok" });
  assert.equal(result.valid, true);
  assert.deepEqual(result.errors, []);
});

test("rechaza cuando falta un campo required", () => {
  const result = validateAgainstSchema(SIMPLE_SCHEMA, { name: "x", count: 5 });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.status" && e.message.includes("obligatorio")));
});

test("additionalProperties:false rechaza un campo no declarado", () => {
  const result = validateAgainstSchema(SIMPLE_SCHEMA, { name: "x", count: 5, status: "ok", extra: 1 });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.extra"));
});

test("enum rechaza un valor fuera de la lista permitida", () => {
  const result = validateAgainstSchema(SIMPLE_SCHEMA, { name: "x", count: 5, status: "SOMETHING_ELSE" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.status" && e.message.includes("enum")));
});

test("tipo incorrecto se detecta (string en vez de integer)", () => {
  const result = validateAgainstSchema(SIMPLE_SCHEMA, { name: "x", count: "5", status: "ok" });
  assert.equal(result.valid, false);
  assert.ok(result.errors.some((e) => e.path === "$.count" && e.message.includes("tipo inválido")));
});

test("minimum/maximum se aplican a números", () => {
  const tooLow = validateAgainstSchema(SIMPLE_SCHEMA, { name: "x", count: -1, status: "ok" });
  const tooHigh = validateAgainstSchema(SIMPLE_SCHEMA, { name: "x", count: 999, status: "ok" });
  assert.equal(tooLow.valid, false);
  assert.equal(tooHigh.valid, false);
});

test("minLength/maxLength se aplican a strings", () => {
  const empty = validateAgainstSchema(SIMPLE_SCHEMA, { name: "", count: 1, status: "ok" });
  const tooLong = validateAgainstSchema(SIMPLE_SCHEMA, { name: "01234567890", count: 1, status: "ok" });
  assert.equal(empty.valid, false);
  assert.equal(tooLong.valid, false);
});

test("campo tipo [string, null] acepta null explícito", () => {
  const result = validateAgainstSchema(SIMPLE_SCHEMA, { name: "x", count: 1, status: "ok", note: null });
  assert.equal(result.valid, true);
});

test("format:date-time exige ISO 8601 UTC con milisegundos", () => {
  const schema = { type: "object", additionalProperties: false, required: ["ts"], properties: { ts: { type: "string", format: "date-time" } } };
  assert.equal(validateAgainstSchema(schema, { ts: "2026-07-08T10:15:32.402Z" }).valid, true);
  assert.equal(validateAgainstSchema(schema, { ts: "2026-07-08 10:15:32" }).valid, false);
  assert.equal(validateAgainstSchema(schema, { ts: "2026-07-08T10:15:32Z" }).valid, false, "sin milisegundos debe fallar");
});

test("pattern se aplica a strings", () => {
  const schema = { type: "object", additionalProperties: false, required: ["id"], properties: { id: { type: "string", pattern: "^req_[a-z0-9]+$" } } };
  assert.equal(validateAgainstSchema(schema, { id: "req_abc123" }).valid, true);
  assert.equal(validateAgainstSchema(schema, { id: "not-a-request-id" }).valid, false);
});
