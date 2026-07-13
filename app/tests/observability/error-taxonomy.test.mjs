import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const TAXONOMY = JSON.parse(readFileSync(path.join(__dirname, "../../schemas/observability/error-taxonomy.json"), "utf8"));
const SCHEMA = JSON.parse(readFileSync(path.join(__dirname, "../../schemas/observability/log-event.schema.json"), "utf8"));

const EXPECTED_CATEGORIES = [
  "AUTH", "AUTHZ", "VALIDATION", "AIRTABLE_RATE_LIMIT", "AIRTABLE_MONTHLY_QUOTA",
  "MAKE_EXECUTION", "MAKE_CONFIGURATION", "EXTERNAL_PROVIDER", "EMAIL", "WHATSAPP",
  "STRIPE", "WORKER_4XX", "WORKER_5XX", "TIMEOUT", "NETWORK", "DATA_INTEGRITY", "UNKNOWN",
];

const CODE_PATTERN = new RegExp(SCHEMA.properties.error_code.pattern);
const REQUIRED_CODE_KEYS = ["code", "severity", "retryable", "alert_level", "http_status", "runbook_ref", "description"];

test("existen las 17 categorías mínimas pedidas por la misión", () => {
  for (const cat of EXPECTED_CATEGORIES) {
    assert.ok(TAXONOMY.categories[cat], `falta la categoría ${cat}`);
  }
  assert.equal(Object.keys(TAXONOMY.categories).length, EXPECTED_CATEGORIES.length);
});

test("WHATSAPP y STRIPE están reservadas sin códigos reales (sin integración hoy)", () => {
  assert.deepEqual(TAXONOMY.categories.WHATSAPP.codes, []);
  assert.deepEqual(TAXONOMY.categories.STRIPE.codes, []);
});

test("cada código cumple el patrón CATEGORIA.CODIGO usado por el JSON Schema del evento", () => {
  for (const [catName, cat] of Object.entries(TAXONOMY.categories)) {
    for (const entry of cat.codes) {
      assert.match(entry.code, CODE_PATTERN, `${entry.code} (en ${catName}) no cumple el patrón del schema`);
      assert.ok(entry.code.startsWith(`${catName}.`), `${entry.code} debería empezar por "${catName}."`);
    }
  }
});

test("cada código tiene todas las claves requeridas (CODE/SEVERITY/RETRYABLE/ALERT_LEVEL/OWNER via categoría/RUNBOOK_REF)", () => {
  for (const [catName, cat] of Object.entries(TAXONOMY.categories)) {
    assert.ok(typeof cat.owner === "string" && cat.owner.length > 0, `categoría ${catName} sin owner`);
    for (const entry of cat.codes) {
      for (const key of REQUIRED_CODE_KEYS) {
        assert.ok(Object.prototype.hasOwnProperty.call(entry, key), `${entry.code} no tiene la clave "${key}"`);
      }
    }
  }
});

test("severity de cada código está dentro del enum de severidades declarado", () => {
  for (const cat of Object.values(TAXONOMY.categories)) {
    for (const entry of cat.codes) {
      assert.ok(TAXONOMY.severities.includes(entry.severity), `severity "${entry.severity}" inválida en ${entry.code}`);
    }
  }
});

test("severity de cada código está dentro del enum 'level' del log-event.schema.json (mismo vocabulario)", () => {
  for (const cat of Object.values(TAXONOMY.categories)) {
    for (const entry of cat.codes) {
      assert.ok(SCHEMA.properties.level.enum.includes(entry.severity), `"${entry.severity}" en ${entry.code} no está en el enum de level del schema`);
    }
  }
});

test("alert_level de cada código está dentro de P0-P3", () => {
  for (const cat of Object.values(TAXONOMY.categories)) {
    for (const entry of cat.codes) {
      assert.ok(TAXONOMY.alert_levels.includes(entry.alert_level), `alert_level "${entry.alert_level}" inválido en ${entry.code}`);
    }
  }
});

test("retryable es siempre booleano", () => {
  for (const cat of Object.values(TAXONOMY.categories)) {
    for (const entry of cat.codes) {
      assert.equal(typeof entry.retryable, "boolean", `${entry.code} retryable no es booleano`);
    }
  }
});

test("no hay códigos duplicados en toda la taxonomía", () => {
  const allCodes = Object.values(TAXONOMY.categories).flatMap((cat) => cat.codes.map((c) => c.code));
  const unique = new Set(allCodes);
  assert.equal(unique.size, allCodes.length, "hay al menos un código duplicado entre categorías");
});

test("hay al menos un código de severidad critical con alert_level P0 (WORKER_5XX.INTERNAL_ERROR)", () => {
  const allCodes = Object.values(TAXONOMY.categories).flatMap((cat) => cat.codes);
  assert.ok(allCodes.some((c) => c.severity === "critical" && c.alert_level === "P0"));
});

test("el catch-all UNKNOWN existe para eventos críticos sin categoría asignable", () => {
  assert.ok(TAXONOMY.categories.UNKNOWN.codes.some((c) => c.code === "UNKNOWN.UNCLASSIFIED"));
});
