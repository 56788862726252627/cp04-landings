import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CP04_EXPORT_FORMATS,
  CP04_EXPORT_FORMAT_IDS,
  cp04GetExportFormat,
  cp04IsFormatImplemented,
  cp04ListImplementedFormats,
  cp04ListPendingFormats,
} from "./exportFormats.js";

test("existen exactamente los 11 formatos pedidos por el enunciado", () => {
  assert.equal(CP04_EXPORT_FORMAT_IDS.length, 11);
  for (const id of ["pdf", "docx", "pptx", "png", "jpg", "svg", "webp", "mp4", "gif", "html", "markdown"]) {
    assert.ok(CP04_EXPORT_FORMATS[id], `falta el formato "${id}"`);
  }
});

test("cp04GetExportFormat es insensible a mayúsculas y devuelve null para un formato inexistente", () => {
  assert.equal(cp04GetExportFormat("PDF")?.id, "pdf");
  assert.equal(cp04GetExportFormat("no-existe"), null);
});

test("markdown/html/svg/pdf/docx/pptx están implementados hoy (Prompt 1/6 + motores reales del Prompt 4/6, sin red) — el resto declara honestamente not_implemented", () => {
  assert.deepEqual(cp04ListImplementedFormats().sort(), ["docx", "html", "markdown", "pdf", "pptx", "svg"]);
  const pending = cp04ListPendingFormats().sort();
  assert.deepEqual(pending, ["gif", "jpg", "mp4", "png", "webp"]);
});

test("cada formato no implementado declara requiresDependency (nunca queda en blanco sin explicar por qué)", () => {
  for (const id of cp04ListPendingFormats()) {
    assert.ok(CP04_EXPORT_FORMATS[id].requiresDependency, `${id} debería explicar qué le falta`);
  }
});

test("cp04IsFormatImplemented coincide con la propiedad implemented del registro", () => {
  assert.equal(cp04IsFormatImplemented("markdown"), true);
  assert.equal(cp04IsFormatImplemented("mp4"), false);
  assert.equal(cp04IsFormatImplemented("no-existe"), false);
});

test("el registro es inmutable (Object.freeze) — no se puede alterar en tiempo de ejecución", () => {
  assert.throws(() => { CP04_EXPORT_FORMATS.pdf.implemented = true; }, TypeError);
});
