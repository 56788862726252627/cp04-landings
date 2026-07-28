import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04GenerateDocument } from "./documentPipeline.js";

const SAMPLE_SPEC = {
  title: "Manual de uso",
  meta: { Versión: "1.0", Autor: "Agencia IA" },
  sections: [
    { heading: "Introducción", body: "Este manual explica..." },
    { heading: "Instalación", body: "Paso 1...\nPaso 2..." },
  ],
};

test("sin 'title' falla con un mensaje claro, sin lanzar", () => {
  const result = cp04GenerateDocument({}, "markdown");
  assert.equal(result.status, "failed");
});

test("genera Markdown real con título, meta y todas las secciones", () => {
  const result = cp04GenerateDocument(SAMPLE_SPEC, "markdown");
  assert.equal(result.status, "completed");
  assert.match(result.content, /^# Manual de uso/);
  assert.match(result.content, /\*\*Versión:\*\* 1\.0/);
  assert.match(result.content, /## Introducción/);
  assert.match(result.content, /## Instalación/);
});

test("genera HTML real con título, meta y secciones, con saltos de línea preservados", () => {
  const result = cp04GenerateDocument(SAMPLE_SPEC, "html");
  assert.equal(result.status, "completed");
  assert.match(result.content, /<h1>Manual de uso<\/h1>/);
  assert.match(result.content, /<li><strong>Versión:<\/strong> 1\.0<\/li>/);
  assert.match(result.content, /Paso 1\.\.\.<br\/>Paso 2\.\.\./);
});

test("escapa HTML en el body (evita inyección básica)", () => {
  const spec = { title: "T", sections: [{ heading: "H", body: "<img src=x onerror=alert(1)>" }] };
  const result = cp04GenerateDocument(spec, "html");
  assert.equal(result.content.includes("<img src=x"), false);
});

test("un formato no implementado (pdf) devuelve not_implemented sin fingir el binario", () => {
  const result = cp04GenerateDocument(SAMPLE_SPEC, "pdf");
  assert.equal(result.status, "not_implemented");
  assert.ok(result.reason);
});

test("un formato desconocido falla de forma explícita", () => {
  const result = cp04GenerateDocument(SAMPLE_SPEC, "no-existe");
  assert.equal(result.status, "failed");
});

test("sin secciones produce igualmente un documento válido (solo título/meta)", () => {
  const result = cp04GenerateDocument({ title: "Solo título" }, "markdown");
  assert.equal(result.status, "completed");
  assert.match(result.content, /^# Solo título/);
});
