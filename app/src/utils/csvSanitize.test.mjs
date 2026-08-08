import { test } from "node:test";
import assert from "node:assert/strict";
import { sanitizeCsvCell } from "./csvSanitize.js";

// ── texto normal ──────────────────────────────────────────────────────────────

test("sanitizeCsvCell: texto normal sin cambios", () => {
  assert.strictEqual(sanitizeCsvCell("Juan García"), "Juan García");
});

test("sanitizeCsvCell: texto con espacios internos sin cambios", () => {
  assert.strictEqual(sanitizeCsvCell("Ana López Ruiz"), "Ana López Ruiz");
});

// ── prefijos de fórmula ───────────────────────────────────────────────────────

test("sanitizeCsvCell: =HYPERLINK(...) recibe apóstrofo (comillas internas dobladas primero)", () => {
  // Las comillas internas se doblan antes de añadir el apóstrofo de prefijo.
  assert.strictEqual(sanitizeCsvCell('=HYPERLINK("http://evil.example")'), '\'=HYPERLINK(""http://evil.example"")');
});

test("sanitizeCsvCell: +SUM(...) recibe apóstrofo", () => {
  assert.strictEqual(sanitizeCsvCell("+SUM(A1:A10)"), "'+SUM(A1:A10)");
});

test("sanitizeCsvCell: -1+2 recibe apóstrofo", () => {
  assert.strictEqual(sanitizeCsvCell("-1+2"), "'-1+2");
});

test("sanitizeCsvCell: @SUM(...) recibe apóstrofo", () => {
  assert.strictEqual(sanitizeCsvCell("@SUM(A1)"), "'@SUM(A1)");
});

test("sanitizeCsvCell: tab inicial recibe apóstrofo", () => {
  assert.strictEqual(sanitizeCsvCell("\tmalicioso"), "'\tmalicioso");
});

test("sanitizeCsvCell: carriage return inicial recibe apóstrofo", () => {
  assert.strictEqual(sanitizeCsvCell("\rmalicioso"), "'\rmalicioso");
});

// ── caracteres especiales CSV ─────────────────────────────────────────────────

test("sanitizeCsvCell: comilla doble interna se dobla (RFC 4180)", () => {
  assert.strictEqual(sanitizeCsvCell('di"az'), 'di""az');
});

test("sanitizeCsvCell: comilla doble inicial no es fórmula, solo se dobla", () => {
  assert.strictEqual(sanitizeCsvCell('"cita"'), '""cita""');
});

test("sanitizeCsvCell: coma interna no altera el contenido (la envuelve el llamador)", () => {
  assert.strictEqual(sanitizeCsvCell("García, Martínez"), "García, Martínez");
});

test("sanitizeCsvCell: salto de línea interno no recibe apóstrofo (no es prefijo de fórmula)", () => {
  assert.strictEqual(sanitizeCsvCell("linea1\nlinea2"), "linea1\nlinea2");
});

// ── valor vacío y tipos especiales ───────────────────────────────────────────

test("sanitizeCsvCell: string vacío devuelve string vacío", () => {
  assert.strictEqual(sanitizeCsvCell(""), "");
});

test("sanitizeCsvCell: null devuelve string vacío", () => {
  assert.strictEqual(sanitizeCsvCell(null), "");
});

test("sanitizeCsvCell: undefined devuelve string vacío", () => {
  assert.strictEqual(sanitizeCsvCell(undefined), "");
});

test("sanitizeCsvCell: número normal sin cambios", () => {
  assert.strictEqual(sanitizeCsvCell(42), "42");
});

test("sanitizeCsvCell: número negativo recibe apóstrofo", () => {
  assert.strictEqual(sanitizeCsvCell(-5), "'-5");
});

// ── combinaciones ─────────────────────────────────────────────────────────────

test("sanitizeCsvCell: =fórmula con comilla interna: primero dobla, luego añade apóstrofo", () => {
  assert.strictEqual(sanitizeCsvCell('=CMD("rm -rf")'), '\'=CMD(""rm -rf"")');
});
