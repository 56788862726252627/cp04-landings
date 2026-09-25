import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import JSZip from "jszip";
import { cp04GeneratePptxFromDeck } from "./pptxEngine.js";
import { cp04ValidateOoxmlBuffer, CP04_PPTX_REQUIRED_ENTRIES } from "./binaryValidator.js";

test("cp04GeneratePptxFromDeck sin title falla, no genera nada", async () => {
  const result = await cp04GeneratePptxFromDeck({ slides: [{ title: "S" }] });
  assert.equal(result.status, "failed");
});

test("cp04GeneratePptxFromDeck sin slides (o vacío) falla, no genera nada", async () => {
  const r1 = await cp04GeneratePptxFromDeck({ title: "X" });
  assert.equal(r1.status, "failed");
  const r2 = await cp04GeneratePptxFromDeck({ title: "X", slides: [] });
  assert.equal(r2.status, "failed");
});

test("cp04GeneratePptxFromDeck: una diapositiva sin title falla explicando cuál", async () => {
  const result = await cp04GeneratePptxFromDeck({ title: "X", slides: [{ title: "OK" }, { bullets: ["sin title"] }] });
  assert.equal(result.status, "failed");
  assert.match(result.reason, /slides\[1\]/);
});

test("cp04GeneratePptxFromDeck produce un PPTX real: ZIP válido con presentation.xml, slides, layouts y masters", async () => {
  const result = await cp04GeneratePptxFromDeck({
    title: "Deck", slides: [{ title: "S1", bullets: ["a", "b"] }, { title: "S2", table: [["A", "B"], ["1", "2"]] }],
  });
  assert.equal(result.status, "completed");
  const validation = await cp04ValidateOoxmlBuffer(result.buffer, "pptx");
  assert.equal(validation.state, "validated", JSON.stringify(validation.errors));
  for (const entry of CP04_PPTX_REQUIRED_ENTRIES) assert.ok(validation.entries.includes(entry), `falta ${entry}`);
  assert.ok(validation.entries.some((n) => n.startsWith("ppt/slideLayouts/")));
  assert.ok(validation.entries.some((n) => n.startsWith("ppt/slideMasters/")));
});

test("cp04GeneratePptxFromDeck: slideCount incluye portada + diapositivas + cierre", async () => {
  const result = await cp04GeneratePptxFromDeck({ title: "Deck", slides: [{ title: "S1" }, { title: "S2" }] });
  assert.equal(result.slideCount, 4); // portada + 2 + cierre
  const zip = await JSZip.loadAsync(result.buffer);
  const slideFiles = Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n));
  assert.equal(slideFiles.length, 4);
});

test("cp04GeneratePptxFromDeck con texto Unicode/español produce contenido real en las diapositivas", async () => {
  const result = await cp04GeneratePptxFromDeck({ title: "Título", slides: [{ title: "Sección", bullets: ["café, dirección, mañana, 99€"] }] });
  const zip = await JSZip.loadAsync(result.buffer);
  const slide2 = await zip.files["ppt/slides/slide2.xml"].async("string");
  assert.match(slide2, /café/);
});

test("cp04GeneratePptxFromDeck: notas de orador se incluyen cuando se aportan", async () => {
  const result = await cp04GeneratePptxFromDeck({ title: "Deck", slides: [{ title: "S1", bullets: ["a"], notes: "nota real del ponente" }] });
  const zip = await JSZip.loadAsync(result.buffer);
  const notesFiles = Object.keys(zip.files).filter((n) => /^ppt\/notesSlides\/notesSlide\d+\.xml$/.test(n));
  assert.ok(notesFiles.length > 0, "debería existir al menos un notesSlideN.xml");
});

test("cp04GeneratePptxFromDeck con una imagen no decodificable no rompe la diapositiva (se omite)", async () => {
  const result = await cp04GeneratePptxFromDeck({ title: "Deck", slides: [{ title: "S1", bullets: ["a"], image: Buffer.from("no-es-una-imagen") }] });
  assert.equal(result.status, "completed");
  assert.equal((await cp04ValidateOoxmlBuffer(result.buffer, "pptx")).state, "validated");
});

test("un PPTX corrupto (ZIP truncado) se detecta como corrupt/incomplete, nunca 'validated'", async () => {
  const { buffer } = await cp04GeneratePptxFromDeck({ title: "Deck", slides: [{ title: "S1" }] });
  const truncated = buffer.subarray(0, Math.floor(buffer.length / 3));
  const result = await cp04ValidateOoxmlBuffer(truncated, "pptx");
  assert.notEqual(result.state, "validated");
});
