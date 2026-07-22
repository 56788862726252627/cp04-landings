import { test } from "node:test";
import assert from "node:assert/strict";

import { createEvidence, validateEvidence, hashEvidenceContent, evidenceDedupeKey, sortEvidenceStable, SOURCE_TYPES, CLASSIFICATIONS } from "./evidenceSchema.js";

test("createEvidence produce un objeto válido según validateEvidence", () => {
  const ev = createEvidence({
    sourceId: "src-1",
    sourceType: "local_html",
    title: "Home",
    excerpt: "contenido de ejemplo",
    normalizedContent: "contenido de ejemplo",
    relatedDimension: "mobileExperience",
    signal: { strength: 0.8, polarity: "positive" },
    confidence: 0.7,
    provenance: "fixture local",
  });
  const { valid, errors } = validateEvidence(ev);
  assert.equal(valid, true, JSON.stringify(errors));
  assert.equal(SOURCE_TYPES.includes(ev.sourceType), true);
  assert.equal(CLASSIFICATIONS.includes(ev.classification), true);
});

test("hashEvidenceContent es determinista para el mismo contenido", () => {
  assert.equal(hashEvidenceContent("hola mundo"), hashEvidenceContent("hola mundo"));
  assert.notEqual(hashEvidenceContent("hola mundo"), hashEvidenceContent("otro contenido"));
});

test("createEvidence nunca incluye capturedAt en el hash (mismo contenido -> mismo evidenceId siempre)", () => {
  const a = createEvidence({ sourceId: "s", sourceType: "local_json", excerpt: "x", normalizedContent: "x", relatedDimension: "seoTechnical" });
  const b = createEvidence({ sourceId: "s", sourceType: "local_json", excerpt: "x", normalizedContent: "x", relatedDimension: "seoTechnical" });
  assert.equal(a.evidenceId, b.evidenceId);
  assert.equal(a.contentHash, b.contentHash);
});

test("validateEvidence rechaza sourceType, classification o signal.polarity inválidos", () => {
  const ev = createEvidence({ sourceId: "s", sourceType: "local_json", excerpt: "x", normalizedContent: "x", relatedDimension: "seoTechnical" });
  const broken1 = { ...ev, sourceType: "no_existe" };
  const broken2 = { ...ev, classification: "no_existe" };
  const broken3 = { ...ev, signal: { strength: 2, polarity: "no_existe" } };
  assert.equal(validateEvidence(broken1).valid, false);
  assert.equal(validateEvidence(broken2).valid, false);
  assert.equal(validateEvidence(broken3).valid, false);
});

test("validateEvidence rechaza un valor no-objeto sin lanzar", () => {
  assert.equal(validateEvidence(null).valid, false);
  assert.equal(validateEvidence("string").valid, false);
});

test("evidenceDedupeKey identifica duplicados por sourceId+contentHash", () => {
  const a = createEvidence({ sourceId: "s1", sourceType: "local_html", excerpt: "igual", normalizedContent: "igual", relatedDimension: "seoTechnical" });
  const b = createEvidence({ sourceId: "s1", sourceType: "local_html", excerpt: "igual", normalizedContent: "igual", relatedDimension: "accessibility" });
  const c = createEvidence({ sourceId: "s2", sourceType: "local_html", excerpt: "igual", normalizedContent: "igual", relatedDimension: "seoTechnical" });
  assert.equal(evidenceDedupeKey(a), evidenceDedupeKey(b));
  assert.notEqual(evidenceDedupeKey(a), evidenceDedupeKey(c));
});

test("sortEvidenceStable produce el mismo orden en ejecuciones repetidas, independientemente del orden de entrada", () => {
  const a = createEvidence({ sourceId: "b", sourceType: "local_html", excerpt: "1", normalizedContent: "1", relatedDimension: "seoTechnical" });
  const b = createEvidence({ sourceId: "a", sourceType: "local_html", excerpt: "2", normalizedContent: "2", relatedDimension: "seoTechnical" });
  const sorted1 = sortEvidenceStable([a, b]).map((e) => e.evidenceId);
  const sorted2 = sortEvidenceStable([b, a]).map((e) => e.evidenceId);
  assert.deepEqual(sorted1, sorted2);
});
