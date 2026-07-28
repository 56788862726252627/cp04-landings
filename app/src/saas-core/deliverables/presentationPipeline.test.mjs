import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04GeneratePresentation } from "./presentationPipeline.js";

const VALID_DECK = {
  title: "Propuesta comercial",
  slides: [
    { title: "Diagnóstico", bullets: ["Punto 1", "Punto 2"], notes: "Explicar contexto." },
    { title: "Propuesta", bullets: ["Solución A", "Solución B"] },
  ],
};

test("sin título falla con un mensaje claro", () => {
  assert.equal(cp04GeneratePresentation({ slides: [{ title: "S" }] }).status, "failed");
});

test("sin diapositivas (o vacío) falla con un mensaje claro", () => {
  assert.equal(cp04GeneratePresentation({ title: "T" }).status, "failed");
  assert.equal(cp04GeneratePresentation({ title: "T", slides: [] }).status, "failed");
});

test("una diapositiva sin título falla explicando cuál", () => {
  const result = cp04GeneratePresentation({ title: "T", slides: [{ title: "OK" }, {}] });
  assert.equal(result.status, "failed");
  assert.match(result.reason, /slides\[1\]/);
});

test("genera Markdown real con todas las diapositivas numeradas, bullets y notas", () => {
  const result = cp04GeneratePresentation(VALID_DECK, "markdown");
  assert.equal(result.status, "completed");
  assert.equal(result.slideCount, 2);
  assert.match(result.content, /## Diapositiva 1: Diagnóstico/);
  assert.match(result.content, /- Punto 1/);
  assert.match(result.content, /_Notas: Explicar contexto\._/);
  assert.match(result.content, /## Diapositiva 2: Propuesta/);
});

test("genera HTML real con una <section> por diapositiva", () => {
  const result = cp04GeneratePresentation(VALID_DECK, "html");
  assert.equal(result.status, "completed");
  const sections = result.content.match(/<section class="slide"/g) || [];
  assert.equal(sections.length, 2);
});

test("en PPTX declara not_implemented, conservando el recuento de diapositivas ya validado", () => {
  const result = cp04GeneratePresentation(VALID_DECK, "pptx");
  assert.equal(result.status, "not_implemented");
  assert.equal(result.slideCount, 2);
});
