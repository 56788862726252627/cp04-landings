// Tests "property-based": en vez de escribir a mano un caso inválido por
// escenario (ya cubierto puntualmente en payload-validator.test.mjs), esto
// recorre TODOS los payload schemas del manifest y genera automáticamente:
//  - 1 caso "falta campo obligatorio" por cada campo required (incl. anidados)
//  - 1 caso "enum inválido" por cada campo con enum
//  - 3 casos "payload malformado" (string / array / null en la raíz)
// Así cualquier payload schema nuevo que se añada en el futuro queda
// cubierto automáticamente sin tener que acordarse de escribir sus
// negativos a mano.

import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { validateAgainstSchema } from "../../scripts/make-qa/schema-validator.mjs";
import { loadScenarios, resolveAppPath } from "../../scripts/make-qa/manifest-loader.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const APP_ROOT = path.resolve(__dirname, "../..");

function getAtPath(obj, dottedPath) {
  return dottedPath.split(".").reduce((o, k) => (o === undefined || o === null ? undefined : o[k]), obj);
}

function withDeletedPath(obj, dottedPath) {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = dottedPath.split(".");
  const parent = keys.slice(0, -1).reduce((o, k) => o[k], clone);
  delete parent[keys[keys.length - 1]];
  return clone;
}

function withSetPath(obj, dottedPath, value) {
  const clone = JSON.parse(JSON.stringify(obj));
  const keys = dottedPath.split(".");
  const parent = keys.slice(0, -1).reduce((o, k) => o[k], clone);
  parent[keys[keys.length - 1]] = value;
  return clone;
}

function collectRequiredPaths(schema, prefix = "") {
  let out = [];
  for (const req of schema.required || []) {
    const fullPath = prefix + req;
    out.push(fullPath);
    const propSchema = schema.properties?.[req];
    if (propSchema?.type === "object" && propSchema.properties) {
      out = out.concat(collectRequiredPaths(propSchema, fullPath + "."));
    }
  }
  return out;
}

function collectEnumPaths(schema, prefix = "") {
  let out = [];
  for (const [key, propSchema] of Object.entries(schema.properties || {})) {
    const fullPath = prefix + key;
    if (propSchema.enum) out.push({ path: fullPath, enumValues: propSchema.enum });
    if (propSchema.type === "object" && propSchema.properties) out = out.concat(collectEnumPaths(propSchema, fullPath + "."));
  }
  return out;
}

// Escenarios con payload_schema definido -> {test_id, schema, validFixturePayload}
const cases = loadScenarios()
  .filter((s) => s.payload_schema && s.fixture)
  .map((s) => {
    const schema = JSON.parse(readFileSync(resolveAppPath(s.payload_schema), "utf8"));
    const rawFixture = JSON.parse(readFileSync(resolveAppPath(s.fixture), "utf8"));
    return { testId: s.test_id, scenarioName: s.scenario_name, schema, validPayload: rawFixture.payload };
  });

test("precondición: hay al menos 10 escenarios con payload_schema para generar los negativos", () => {
  assert.ok(cases.length >= 10, `solo ${cases.length} casos encontrados`);
});

test("precondición: todo fixture válido referenciado por el manifest pasa su propio schema (si esto falla, los negativos de abajo no son fiables)", () => {
  for (const c of cases) {
    const result = validateAgainstSchema(c.schema, c.validPayload);
    assert.equal(result.valid, true, `${c.testId}: ${JSON.stringify(result.errors)}`);
  }
});

for (const c of cases) {
  const requiredPaths = collectRequiredPaths(c.schema);
  for (const reqPath of requiredPaths) {
    test(`[missing required] ${c.testId} (${c.scenarioName}): eliminar "${reqPath}" invalida el payload`, () => {
      if (getAtPath(c.validPayload, reqPath) === undefined) return; // campo opcional en el fixture concreto, no aplica
      const broken = withDeletedPath(c.validPayload, reqPath);
      const result = validateAgainstSchema(c.schema, broken);
      assert.equal(result.valid, false, `se esperaba inválido al eliminar ${reqPath}`);
    });
  }

  const enumPaths = collectEnumPaths(c.schema);
  for (const { path: enumPath, enumValues } of enumPaths) {
    test(`[invalid enum] ${c.testId} (${c.scenarioName}): valor fuera de enum en "${enumPath}" invalida el payload`, () => {
      const invalidValue = typeof enumValues[0] === "number" ? -999999 : "VALOR_FUERA_DE_ENUM_QA_CP04";
      const broken = withSetPath(c.validPayload, enumPath, invalidValue);
      const result = validateAgainstSchema(c.schema, broken);
      assert.equal(result.valid, false, `se esperaba inválido con "${enumPath}"="${invalidValue}"`);
    });
  }

  test(`[malformed] ${c.testId} (${c.scenarioName}): un string en la raíz nunca es un payload válido`, () => {
    assert.equal(validateAgainstSchema(c.schema, "esto-no-es-un-objeto").valid, false);
  });
  test(`[malformed] ${c.testId} (${c.scenarioName}): un array en la raíz nunca es un payload válido`, () => {
    assert.equal(validateAgainstSchema(c.schema, ["a", "b"]).valid, false);
  });
  test(`[malformed] ${c.testId} (${c.scenarioName}): null en la raíz nunca es un payload válido`, () => {
    assert.equal(validateAgainstSchema(c.schema, null).valid, false);
  });
}
