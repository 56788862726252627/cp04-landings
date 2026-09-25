import { test } from "node:test";
import assert from "node:assert/strict";
import { Buffer } from "node:buffer";
import JSZip from "jszip";
import { cp04GenerateDocxFromSpec } from "./docxEngine.js";
import { cp04ValidateOoxmlBuffer, CP04_DOCX_REQUIRED_ENTRIES } from "./binaryValidator.js";

test("cp04GenerateDocxFromSpec sin title falla, no genera nada", async () => {
  const result = await cp04GenerateDocxFromSpec({ sections: [{ heading: "H" }] });
  assert.equal(result.status, "failed");
});

test("cp04GenerateDocxFromSpec sin sections (o vacío) falla, no genera nada", async () => {
  const r1 = await cp04GenerateDocxFromSpec({ title: "X" });
  assert.equal(r1.status, "failed");
  const r2 = await cp04GenerateDocxFromSpec({ title: "X", sections: [] });
  assert.equal(r2.status, "failed");
});

test("cp04GenerateDocxFromSpec produce un DOCX real: ZIP válido con todas las partes OOXML obligatorias", async () => {
  const result = await cp04GenerateDocxFromSpec({ title: "Doc", sections: [{ heading: "H", body: "b", bullets: ["x"], table: [["A", "B"], ["1", "2"]] }] });
  assert.equal(result.status, "completed");
  const validation = await cp04ValidateOoxmlBuffer(result.buffer, "docx");
  assert.equal(validation.state, "validated", JSON.stringify(validation.errors));
  for (const entry of CP04_DOCX_REQUIRED_ENTRIES) assert.ok(validation.entries.includes(entry), `falta ${entry}`);
});

test("cp04GenerateDocxFromSpec: word/document.xml contiene el texto real pedido, incluido Unicode/español", async () => {
  const result = await cp04GenerateDocxFromSpec({ title: "Título", sections: [{ heading: "Sección con ñ", body: "café, dirección, mañana, 99€" }] });
  const zip = await JSZip.loadAsync(result.buffer);
  const xml = await zip.files["word/document.xml"].async("string");
  assert.match(xml, /café/);
  assert.match(xml, /dirección/);
  assert.match(xml, /Secci.*n con /);
});

test("cp04GenerateDocxFromSpec: ninguna sección referenciada queda como placeholder sin sustituir", async () => {
  const result = await cp04GenerateDocxFromSpec({ title: "Doc real", sections: [{ heading: "Alcance", body: "Contenido real, no una plantilla vacía." }] });
  const zip = await JSZip.loadAsync(result.buffer);
  const xml = await zip.files["word/document.xml"].async("string");
  assert.doesNotMatch(xml, /\{\{.*\}\}|\$\{.*\}|<%.*%>/, "no debería quedar ningún marcador de plantilla sin resolver");
});

test("cp04GenerateDocxFromSpec es idempotente en CONTENIDO: el mismo spec produce siempre el mismo texto en word/document.xml (el timestamp de docProps/core.xml es la única parte que varía, fuera del contrato de idempotencia del checksum de contenido)", async () => {
  const spec = { title: "Idempotente", sections: [{ heading: "H", body: "b" }] };
  const a = await cp04GenerateDocxFromSpec(spec);
  await new Promise((r) => setTimeout(r, 1100));
  const b = await cp04GenerateDocxFromSpec(spec);
  const za = await JSZip.loadAsync(a.buffer);
  const zb = await JSZip.loadAsync(b.buffer);
  const xmlA = await za.files["word/document.xml"].async("string");
  const xmlB = await zb.files["word/document.xml"].async("string");
  assert.equal(xmlA, xmlB);
});

test("cp04GenerateDocxFromSpec con una imagen no decodificable no rompe el documento (se omite)", async () => {
  const result = await cp04GenerateDocxFromSpec({ title: "Con imagen mala", sections: [{ heading: "H", body: "b", image: "no-es-un-buffer" }] });
  assert.equal(result.status, "completed");
  assert.equal((await cp04ValidateOoxmlBuffer(result.buffer, "docx")).state, "validated");
});

test("un DOCX corrupto (bytes aleatorios con firma ZIP falsa) se detecta como 'corrupt', nunca como completed/válido", async () => {
  const fake = Buffer.concat([Buffer.from("PK"), Buffer.from("basura-no-es-un-zip-real-de-verdad")]);
  const result = await cp04ValidateOoxmlBuffer(fake, "docx");
  assert.notEqual(result.state, "validated");
});
