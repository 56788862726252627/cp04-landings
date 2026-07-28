import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import { cp04ValidatePdfBuffer, cp04ValidateOoxmlBuffer, CP04_BINARY_MIME } from "./binaryValidator.js";
import { cp04GeneratePdfFromSpec } from "./pdfEngine.js";
import { cp04GenerateDocxFromSpec } from "./docxEngine.js";
import { cp04GeneratePptxFromDeck } from "./pptxEngine.js";

const SPEC = { title: "Doc", sections: [{ heading: "H", body: "cuerpo real" }] };
const DECK = { title: "Deck", slides: [{ title: "S1", bullets: ["a"] }] };

// --- PDF ---

test("cp04ValidatePdfBuffer: un PDF real generado por PdfEngine valida OK", async () => {
  const { buffer } = await cp04GeneratePdfFromSpec(SPEC);
  const result = cp04ValidatePdfBuffer(buffer);
  assert.equal(result.state, "validated", JSON.stringify(result.errors));
  assert.ok(result.pageCount >= 1);
});

test("cp04ValidatePdfBuffer: buffer vacío falla (failed), nunca 'validated'", () => {
  assert.equal(cp04ValidatePdfBuffer(Buffer.alloc(0)).state, "failed");
  assert.equal(cp04ValidatePdfBuffer(null).state, "failed");
});

test("cp04ValidatePdfBuffer: texto plano renombrado como PDF se detecta como 'corrupt' (firma inválida)", () => {
  const result = cp04ValidatePdfBuffer(Buffer.from("esto es solo texto, no un PDF"));
  assert.equal(result.state, "corrupt");
  assert.match(result.errors[0], /firma inválida/);
});

test("cp04ValidatePdfBuffer: un PDF truncado a la mitad se detecta como 'incomplete', nunca 'validated'", async () => {
  const { buffer } = await cp04GeneratePdfFromSpec(SPEC);
  const truncated = buffer.subarray(0, Math.floor(buffer.length / 2));
  const result = cp04ValidatePdfBuffer(truncated);
  assert.notEqual(result.state, "validated");
  assert.ok(["incomplete", "corrupt"].includes(result.state));
});

test("cp04ValidatePdfBuffer: un PDF multipágina reporta el número de páginas correcto", async () => {
  const spec = { title: "Multi", sections: Array.from({ length: 10 }, (_, i) => ({ heading: `Sección ${i}`, body: "x".repeat(2000) })) };
  const { buffer, pageCount } = await cp04GeneratePdfFromSpec(spec);
  const result = cp04ValidatePdfBuffer(buffer);
  assert.equal(result.state, "validated");
  assert.equal(result.pageCount, pageCount);
  assert.ok(pageCount > 2, "un documento largo debe generar más de 2 páginas");
});

// --- OOXML (DOCX/PPTX) ---

test("cp04ValidateOoxmlBuffer: un DOCX real generado por DocxEngine valida OK", async () => {
  const { buffer } = await cp04GenerateDocxFromSpec(SPEC);
  const result = await cp04ValidateOoxmlBuffer(buffer, "docx");
  assert.equal(result.state, "validated", JSON.stringify(result.errors));
});

test("cp04ValidateOoxmlBuffer: un PPTX real generado por PptxEngine valida OK", async () => {
  const { buffer } = await cp04GeneratePptxFromDeck(DECK);
  const result = await cp04ValidateOoxmlBuffer(buffer, "pptx");
  assert.equal(result.state, "validated", JSON.stringify(result.errors));
});

test("cp04ValidateOoxmlBuffer: formato no soportado devuelve 'unsupported', nunca lanza", async () => {
  const result = await cp04ValidateOoxmlBuffer(Buffer.from("x"), "xlsx");
  assert.equal(result.state, "unsupported");
});

test("cp04ValidateOoxmlBuffer: texto plano renombrado como DOCX/PPTX se detecta como 'corrupt' (firma ZIP inválida)", async () => {
  const fake = Buffer.from("esto no es un zip");
  assert.equal((await cp04ValidateOoxmlBuffer(fake, "docx")).state, "corrupt");
  assert.equal((await cp04ValidateOoxmlBuffer(fake, "pptx")).state, "corrupt");
});

test("cp04ValidateOoxmlBuffer: un DOCX truncado (ZIP incompleto) se detecta como 'corrupt', nunca 'validated'", async () => {
  const { buffer } = await cp04GenerateDocxFromSpec(SPEC);
  const truncated = buffer.subarray(0, Math.floor(buffer.length / 2));
  const result = await cp04ValidateOoxmlBuffer(truncated, "docx");
  assert.notEqual(result.state, "validated");
});

test("cp04ValidateOoxmlBuffer: un PPTX sin ninguna diapositiva real (manipulado) se detecta como 'incomplete'", async () => {
  const { buffer } = await cp04GeneratePptxFromDeck(DECK);
  const JSZip = (await import("jszip")).default;
  const zip = await JSZip.loadAsync(buffer);
  for (const name of Object.keys(zip.files)) {
    if (/^ppt\/slides\/slide\d+\.xml$/.test(name)) zip.remove(name);
  }
  const manipulated = await zip.generateAsync({ type: "nodebuffer" });
  const result = await cp04ValidateOoxmlBuffer(manipulated, "pptx");
  assert.equal(result.state, "incomplete");
  assert.match(result.errors.join(";"), /ninguna diapositiva real/);
});

test("CP04_BINARY_MIME declara el MIME real de los 3 formatos", () => {
  assert.equal(CP04_BINARY_MIME.pdf, "application/pdf");
  assert.equal(CP04_BINARY_MIME.docx, "application/vnd.openxmlformats-officedocument.wordprocessingml.document");
  assert.equal(CP04_BINARY_MIME.pptx, "application/vnd.openxmlformats-officedocument.presentationml.presentation");
});
