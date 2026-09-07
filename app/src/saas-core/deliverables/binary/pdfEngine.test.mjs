import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { Buffer } from "node:buffer";
import { cp04GeneratePdfFromSpec, cp04GeneratePdfFromDeck } from "./pdfEngine.js";
import { cp04ValidatePdfBuffer } from "./binaryValidator.js";

function sha(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

test("cp04GeneratePdfFromSpec sin title falla, no genera nada", async () => {
  const result = await cp04GeneratePdfFromSpec({ sections: [{ heading: "H" }] });
  assert.equal(result.status, "failed");
  assert.ok(result.reason);
});

test("cp04GeneratePdfFromSpec sin sections (o vacío) falla, no genera nada", async () => {
  const r1 = await cp04GeneratePdfFromSpec({ title: "X" });
  assert.equal(r1.status, "failed");
  const r2 = await cp04GeneratePdfFromSpec({ title: "X", sections: [] });
  assert.equal(r2.status, "failed");
});

test("cp04GeneratePdfFromSpec produce un PDF válido con portada, secciones, bullets y tabla", async () => {
  const result = await cp04GeneratePdfFromSpec({
    title: "Informe", subtitle: "Sub", meta: { Fecha: "2026-07-28" },
    sections: [
      { heading: "Intro", body: "cuerpo" },
      { heading: "Lista", bullets: ["uno", "dos"] },
      { heading: "Tabla", table: [["A", "B"], ["1", "2"]] },
    ],
  });
  assert.equal(result.status, "completed");
  const validation = cp04ValidatePdfBuffer(result.buffer);
  assert.equal(validation.state, "validated", JSON.stringify(validation.errors));
});

test("cp04GeneratePdfFromSpec con texto Unicode/español (acentos, ñ, €) produce un PDF válido y con contenido real", async () => {
  const result = await cp04GeneratePdfFromSpec({
    title: "Título con acentos: café, dirección, mañana", sections: [{ heading: "Sección", body: "Ñoño paga 99€/mes." }],
  });
  assert.equal(result.status, "completed");
  assert.equal(cp04ValidatePdfBuffer(result.buffer).state, "validated");
});

test("cp04GeneratePdfFromSpec con una imagen no decodificable no rompe el documento (se omite, el PDF sigue siendo válido)", async () => {
  const result = await cp04GeneratePdfFromSpec({
    title: "Con imagen mala", sections: [{ heading: "H", body: "b", image: Buffer.from("no soy una imagen real") }],
  });
  assert.equal(result.status, "completed");
  assert.equal(cp04ValidatePdfBuffer(result.buffer).state, "validated");
});

test("cp04GeneratePdfFromSpec es idempotente: el mismo spec produce siempre el mismo checksum (fecha de creación fija internamente)", async () => {
  const spec = { title: "Idempotente", sections: [{ heading: "H", body: "b" }] };
  const a = await cp04GeneratePdfFromSpec(spec);
  await new Promise((r) => setTimeout(r, 1100));
  const b = await cp04GeneratePdfFromSpec(spec);
  assert.equal(sha(a.buffer), sha(b.buffer));
});

test("cp04GeneratePdfFromDeck convierte una presentación en un PDF válido (una sección por diapositiva)", async () => {
  const result = await cp04GeneratePdfFromDeck({ title: "Deck", slides: [{ title: "S1", bullets: ["a"] }, { title: "S2", bullets: ["b"], notes: "nota" }] });
  assert.equal(result.status, "completed");
  const validation = cp04ValidatePdfBuffer(result.buffer);
  assert.equal(validation.state, "validated");
});

test("cp04GeneratePdfFromDeck sin slides falla, no genera nada", async () => {
  const result = await cp04GeneratePdfFromDeck({ title: "X", slides: [] });
  assert.equal(result.status, "failed");
});
