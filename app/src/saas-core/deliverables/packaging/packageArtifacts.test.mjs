import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04BuildPackageIndexHtml, cp04BuildPackageReadme } from "./packageArtifacts.js";

const ENTRIES = [
  { id: "a", deliverableType: "contrato", format: "docx", path: "Contratos/contrato.docx", status: "validated" },
  { id: "b", deliverableType: "propuesta_comercial", format: "pdf", path: "PDFs/propuesta.pdf", status: "validated" },
];

test("cp04BuildPackageIndexHtml produce HTML real, navegable, con un enlace por entregable", () => {
  const html = cp04BuildPackageIndexHtml({ projectName: "Cliente X", version: 3, entries: ENTRIES });
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /<a href="Contratos\/contrato\.docx">/);
  assert.match(html, /<a href="PDFs\/propuesta\.pdf">/);
  assert.match(html, /versión 3/);
});

test("cp04BuildPackageIndexHtml agrupa por carpeta de primer nivel", () => {
  const html = cp04BuildPackageIndexHtml({ projectName: "X", version: 1, entries: ENTRIES });
  assert.match(html, /Contratos \(1\)/);
  assert.match(html, /PDFs \(1\)/);
});

test("cp04BuildPackageIndexHtml escapa HTML en los datos (evita inyección básica)", () => {
  const html = cp04BuildPackageIndexHtml({
    projectName: "X", version: 1,
    entries: [{ id: "a", deliverableType: "<script>alert(1)</script>", format: "pdf", path: "PDFs/x.pdf", status: "validated" }],
  });
  assert.doesNotMatch(html, /<script>alert/);
});

test("cp04BuildPackageIndexHtml NO incluye ningún timestamp de generación (reproducibilidad del zip)", () => {
  const html = cp04BuildPackageIndexHtml({ projectName: "X", version: 1, entries: ENTRIES });
  assert.doesNotMatch(html, /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/, "no debería contener un ISO timestamp de wall-clock");
});

test("cp04BuildPackageReadme produce un README real con el resumen de contenido y validación", () => {
  const readme = cp04BuildPackageReadme({
    projectName: "Cliente X", version: 2, entries: ENTRIES, failed: [],
    validation: { validated: 2, invalid: 0 },
  });
  assert.match(readme, /^# Cliente X/);
  assert.match(readme, /Versión 2/);
  assert.match(readme, /Contratos\/\*\* — 1 archivo/);
  assert.match(readme, /Entregables incluidos y validados: 2/);
});

test("cp04BuildPackageReadme documenta los entregables excluidos con su motivo", () => {
  const readme = cp04BuildPackageReadme({
    projectName: "X", version: 1, entries: ENTRIES,
    failed: [{ id: "c", reason: "checksum no coincide" }],
    validation: { validated: 2, invalid: 1 },
  });
  assert.match(readme, /Excluidos/);
  assert.match(readme, /checksum no coincide/);
});

test("cp04BuildPackageReadme NO incluye ningún timestamp de generación (reproducibilidad del zip)", () => {
  const readme = cp04BuildPackageReadme({ projectName: "X", version: 1, entries: ENTRIES, failed: [], validation: { validated: 2, invalid: 0 } });
  assert.doesNotMatch(readme, /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/);
});

test("cp04BuildPackageReadme deja claro que no se subió nada a Drive/servicios externos", () => {
  const readme = cp04BuildPackageReadme({ projectName: "X", version: 1, entries: ENTRIES, failed: [], validation: { validated: 2, invalid: 0 } });
  assert.match(readme, /sin conexión a Google Drive/);
});
