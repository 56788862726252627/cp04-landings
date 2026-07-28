// Prompt 1/6: cp04GeneratePdf era un adaptador "siempre not_implemented"
// gobernado por CP04_PDF_ENGINE_MODULE. Prompt 4/6: motor real (pdfkit)
// vía binary/pdfEngine.js — ver docs/app3-fabrica-entregables-20260727/
// 05-motores-binarios-20260728.md. Estos tests prueban el contrato
// nuevo; la validación estructural profunda del PDF vive en
// binary/pdfEngine.test.mjs y binary/binaryValidator.test.mjs.
import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04GeneratePdf } from "./pdfPipeline.js";
import { cp04ValidatePdfBuffer } from "./binary/binaryValidator.js";

test("cp04GeneratePdf sin payload falla, no genera nada", async () => {
  const result = await cp04GeneratePdf(null);
  assert.equal(result.status, "failed");
});

test("cp04GeneratePdf con un payload sin sections ni slides falla con un mensaje claro", async () => {
  const result = await cp04GeneratePdf({ title: "X" });
  assert.equal(result.status, "failed");
  assert.match(result.reason, /sections.*slides|slides.*sections/);
});

test("cp04GeneratePdf con spec.sections (documento/contrato) produce un PDF real y válido", async () => {
  const result = await cp04GeneratePdf({ title: "Documento", sections: [{ heading: "Intro", body: "Contenido real." }] });
  assert.equal(result.status, "completed");
  assert.equal(result.format, "pdf");
  const validation = cp04ValidatePdfBuffer(result.buffer);
  assert.equal(validation.state, "validated", JSON.stringify(validation.errors));
});

test("cp04GeneratePdf con deck.slides (presentación) produce un PDF real tipo folleto, una sección por diapositiva", async () => {
  const result = await cp04GeneratePdf({ title: "Deck", slides: [{ title: "Uno", bullets: ["a"] }, { title: "Dos", bullets: ["b"] }] });
  assert.equal(result.status, "completed");
  const validation = cp04ValidatePdfBuffer(result.buffer);
  assert.equal(validation.state, "validated", JSON.stringify(validation.errors));
});

test("cp04GeneratePdf nunca genera un PDF vacío o con 0 páginas", async () => {
  const result = await cp04GeneratePdf({ title: "X", sections: [{ heading: "H", body: "b" }] });
  const validation = cp04ValidatePdfBuffer(result.buffer);
  assert.ok(validation.pageCount >= 1);
});
