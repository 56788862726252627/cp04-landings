import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04IsPdfEngineConfigured, cp04GeneratePdf } from "./pdfPipeline.js";

test("cp04IsPdfEngineConfigured es false sin CP04_PDF_ENGINE_MODULE", () => {
  assert.equal(cp04IsPdfEngineConfigured({}), false);
});

test("cp04IsPdfEngineConfigured es true solo cuando se declara explícitamente", () => {
  assert.equal(cp04IsPdfEngineConfigured({ CP04_PDF_ENGINE_MODULE: "algun-modulo" }), true);
});

test("cp04GeneratePdf sin spec.content falla, no genera nada", () => {
  const result = cp04GeneratePdf(null, {});
  assert.equal(result.status, "failed");
});

test("cp04GeneratePdf sin motor configurado (caso por defecto de este entorno) devuelve not_implemented, nunca 'completed'", () => {
  const result = cp04GeneratePdf({ content: "# Documento" }, {});
  assert.equal(result.status, "not_implemented");
  assert.ok(result.reason);
});

test("cp04GeneratePdf incluso con CP04_PDF_ENGINE_MODULE declarado sigue en not_implemented en este prompt (no se conecta ningún motor real)", () => {
  const result = cp04GeneratePdf({ content: "# Documento" }, { CP04_PDF_ENGINE_MODULE: "algun-modulo" });
  assert.equal(result.status, "not_implemented");
});

test("nunca devuelve status 'completed' bajo ninguna combinación de entorno en este prompt (ningún PDF real se finge)", () => {
  const combos = [{}, { CP04_PDF_ENGINE_MODULE: "x" }, { CP04_PDF_ENGINE_MODULE: "" }];
  for (const env of combos) {
    const result = cp04GeneratePdf({ content: "texto" }, env);
    assert.notEqual(result.status, "completed");
  }
});
