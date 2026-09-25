import { test } from "node:test";
import assert from "node:assert/strict";

import { serializeAsJson, serializeIntentAsSummary, serializeIntentAsMarkdown, renderExplanation, structuralDiff, serializeDiffAsMarkdown } from "./outputSerializer.js";
import { interpretBusinessDescription } from "./intentExtractor.js";

const intent = interpretBusinessDescription("clínica dental de Málaga con reservas y expedientes", { seed: "demo-serializer" });

test("serializeAsJson produce JSON válido que reconstruye el mismo objeto", () => {
  const json = serializeAsJson(intent);
  assert.deepEqual(JSON.parse(json), intent);
});

test("serializeIntentAsSummary es corto (pocas líneas) y menciona sector y confianza", () => {
  const summary = serializeIntentAsSummary(intent);
  assert.ok(summary.split("\n").length <= 6);
  assert.match(summary, /dental/);
  assert.match(summary, /Confianza global/);
});

test("serializeIntentAsMarkdown incluye todas las secciones clave", () => {
  const md = serializeIntentAsMarkdown(intent);
  for (const heading of ["## Negocio", "## Objetivos", "## Módulos", "## Roles y permisos", "## Automatizaciones recomendadas", "## Supuestos", "## Ambigüedades", "## Preguntas recomendadas", "## Confianza"]) {
    assert.ok(md.includes(heading), `falta la sección ${heading}`);
  }
});

test("renderExplanation nunca inventa un módulo que no esté en intent.modules", () => {
  const explanation = renderExplanation(intent);
  for (const m of intent.modules) {
    assert.ok(explanation.includes(m.id), `falta explicación para el módulo ${m.id}`);
  }
});

test("structuralDiff detecta añadidos, eliminados y cambiados en objetos anidados", () => {
  const before = { a: 1, b: { x: 1, y: 2 }, list: [1, 2] };
  const after = { a: 2, b: { x: 1, z: 3 }, list: [1, 2, 3] };
  const diff = structuralDiff(before, after);
  assert.ok(diff.changed.some((c) => c.path === "$.a" && c.before === 1 && c.after === 2));
  assert.ok(diff.added.some((c) => c.path === "$.b.z"));
  assert.ok(diff.removed.some((c) => c.path === "$.b.y"));
  assert.ok(diff.added.some((c) => c.path === "$.list[2]"));
});

test("structuralDiff entre un intent y sí mismo no produce ninguna diferencia", () => {
  const diff = structuralDiff(intent, intent);
  assert.equal(diff.added.length, 0);
  assert.equal(diff.removed.length, 0);
  assert.equal(diff.changed.length, 0);
});

test("structuralDiff detecta el cambio de seed entre dos ejecuciones con distinto seed", () => {
  const other = interpretBusinessDescription("clínica dental de Málaga con reservas y expedientes", { seed: "otro-seed" });
  const diff = structuralDiff(intent, other);
  assert.ok(diff.changed.some((c) => c.path === "$.requestId"));
  assert.ok(diff.changed.some((c) => c.path === "$.generationMetadata.seed"));
});

test("serializeDiffAsMarkdown produce un documento legible con las 3 secciones", () => {
  const diff = structuralDiff({ a: 1 }, { a: 2, b: 3 });
  const md = serializeDiffAsMarkdown(diff);
  assert.match(md, /## Añadido/);
  assert.match(md, /## Eliminado/);
  assert.match(md, /## Cambiado/);
});
