import { test } from "node:test";
import assert from "node:assert/strict";

import { parseColor, relativeLuminance, computeContrastRatio, WCAG_AA_NORMAL_TEXT_THRESHOLD } from "./a11yContrast.js";

test("parseColor reconoce hex de 3 y 6 dígitos y rgb()", () => {
  assert.deepEqual(parseColor("#fff"), { r: 255, g: 255, b: 255 });
  assert.deepEqual(parseColor("#000000"), { r: 0, g: 0, b: 0 });
  assert.deepEqual(parseColor("rgb(255, 0, 0)"), { r: 255, g: 0, b: 0 });
  assert.equal(parseColor("no-es-un-color"), null);
});

test("relativeLuminance: blanco=1, negro=0", () => {
  assert.equal(relativeLuminance({ r: 255, g: 255, b: 255 }), 1);
  assert.equal(relativeLuminance({ r: 0, g: 0, b: 0 }), 0);
});

test("computeContrastRatio: blanco sobre negro = 21:1 (máximo posible)", () => {
  assert.equal(computeContrastRatio("#ffffff", "#000000"), 21);
});

test("computeContrastRatio: mismo color = 1:1 (mínimo posible)", () => {
  assert.equal(computeContrastRatio("#777777", "#777777"), 1);
});

test("computeContrastRatio: gris claro sobre blanco es insuficiente para AA texto normal", () => {
  const ratio = computeContrastRatio("#aaaaaa", "#ffffff");
  assert.ok(ratio < WCAG_AA_NORMAL_TEXT_THRESHOLD, `ratio=${ratio}`);
});

test("computeContrastRatio: negro sobre blanco supera AA texto normal", () => {
  const ratio = computeContrastRatio("#000000", "#ffffff");
  assert.ok(ratio >= WCAG_AA_NORMAL_TEXT_THRESHOLD, `ratio=${ratio}`);
});

test("computeContrastRatio devuelve null si algún color no es reconocible (nunca inventa)", () => {
  assert.equal(computeContrastRatio("currentColor", "#ffffff"), null);
  assert.equal(computeContrastRatio("#fff", "transparent"), null);
});

test("computeContrastRatio es simétrico (orden de argumentos no importa)", () => {
  assert.equal(computeContrastRatio("#000", "#fff"), computeContrastRatio("#fff", "#000"));
});
