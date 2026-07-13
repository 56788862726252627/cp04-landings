import test from "node:test";
import assert from "node:assert/strict";
import { validateAgainstSchema } from "../../scripts/make-qa/schema-validator.mjs";

test("valida un objeto simple correcto", () => {
  const schema = { type: "object", additionalProperties: false, required: ["a"], properties: { a: { type: "string" } } };
  const result = validateAgainstSchema(schema, { a: "x" });
  assert.equal(result.valid, true);
});

test("rechaza campo obligatorio ausente", () => {
  const schema = { type: "object", required: ["a"], properties: { a: { type: "string" } } };
  const result = validateAgainstSchema(schema, {});
  assert.equal(result.valid, false);
  assert.match(result.errors[0].message, /obligatorio ausente/);
});

test("rechaza additionalProperties no permitido", () => {
  const schema = { type: "object", additionalProperties: false, properties: { a: { type: "string" } } };
  const result = validateAgainstSchema(schema, { a: "x", b: "y" });
  assert.equal(result.valid, false);
  assert.match(result.errors[0].message, /no permitido/);
});

test("valida pattern", () => {
  const schema = { type: "string", pattern: "^QA_" };
  assert.equal(validateAgainstSchema(schema, "QA_TEST").valid, true);
  assert.equal(validateAgainstSchema(schema, "REAL_TEST").valid, false);
});

test("valida enum numérico (precio_total: 0)", () => {
  const schema = { type: "number", enum: [0] };
  assert.equal(validateAgainstSchema(schema, 0).valid, true);
  assert.equal(validateAgainstSchema(schema, 25).valid, false);
});

test("valida objetos anidados (jugador.email)", () => {
  const schema = {
    type: "object",
    required: ["jugador"],
    properties: { jugador: { type: "object", required: ["email"], properties: { email: { type: "string", pattern: "^[^@]+@[^@]+$" } } } },
  };
  assert.equal(validateAgainstSchema(schema, { jugador: { email: "a@b.com" } }).valid, true);
  assert.equal(validateAgainstSchema(schema, { jugador: { email: "no-arroba" } }).valid, false);
});

test("nullable: type array con 'null'", () => {
  const schema = { type: ["string", "null"] };
  assert.equal(validateAgainstSchema(schema, null).valid, true);
  assert.equal(validateAgainstSchema(schema, "x").valid, true);
  assert.equal(validateAgainstSchema(schema, 5).valid, false);
});

test("arrays: minItems/maxItems e items", () => {
  const schema = { type: "array", minItems: 1, maxItems: 2, items: { type: "string" } };
  assert.equal(validateAgainstSchema(schema, []).valid, false);
  assert.equal(validateAgainstSchema(schema, ["a"]).valid, true);
  assert.equal(validateAgainstSchema(schema, ["a", "b", "c"]).valid, false);
  assert.equal(validateAgainstSchema(schema, [1]).valid, false);
});
