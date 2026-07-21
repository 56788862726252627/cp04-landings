import { test } from "node:test";
import assert from "node:assert/strict";

import { deduplicateEvidence } from "./evidenceDeduper.js";
import { createEvidence } from "./evidenceSchema.js";

test("deduplicateEvidence elimina duplicados exactos (mismo sourceId+contentHash)", () => {
  const a = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "t", excerpt: "igual", normalizedContent: "igual", relatedDimension: "branding" });
  const b = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "t", excerpt: "igual", normalizedContent: "igual", relatedDimension: "branding" });
  const c = createEvidence({ sourceId: "s2", sourceType: "local_html", title: "t", excerpt: "distinto", normalizedContent: "distinto", relatedDimension: "branding" });
  const result = deduplicateEvidence([a, b, c]);
  assert.equal(result.length, 2);
});

test("deduplicateEvidence produce el mismo resultado sin importar el orden de entrada", () => {
  const a = createEvidence({ sourceId: "s1", sourceType: "local_html", title: "t", excerpt: "1", normalizedContent: "1", relatedDimension: "branding" });
  const b = createEvidence({ sourceId: "s2", sourceType: "local_html", title: "t", excerpt: "2", normalizedContent: "2", relatedDimension: "seoTechnical" });
  const r1 = deduplicateEvidence([a, b]).map((e) => e.evidenceId);
  const r2 = deduplicateEvidence([b, a]).map((e) => e.evidenceId);
  assert.deepEqual(r1, r2);
});

test("deduplicateEvidence sobre una lista vacía devuelve una lista vacía", () => {
  assert.deepEqual(deduplicateEvidence([]), []);
});
