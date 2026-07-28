// App 3 · Prompt 4/6 — BinaryValidator.
//
// Capa común de validación real para los 3 formatos binarios nuevos
// (PDF/DOCX/PPTX). Nunca decide "válido" por la extensión del archivo
// — siempre inspecciona la firma/estructura real del contenido. Reusa
// `jszip` (ya presente como dependencia de `docx`/`pptxgenjs`) para
// leer el contenedor ZIP de verdad en vez de asumir su estructura.
//
// Estados explícitos (nunca un booleano plano que oculte el motivo):
// "validated" | "failed" | "corrupt" | "incomplete" | "unsupported".

import { Buffer } from "node:buffer";
import JSZip from "jszip";

const PDF_SIGNATURE = "%PDF-";
const MIN_PDF_BYTES = 200;
const MIN_OOXML_BYTES = 800; // un .docx/.pptx real de verdad, aunque mínimo, siempre supera esto ampliamente

export const CP04_DOCX_REQUIRED_ENTRIES = Object.freeze(["[Content_Types].xml", "_rels/.rels", "word/document.xml"]);
export const CP04_PPTX_REQUIRED_ENTRIES = Object.freeze(["[Content_Types].xml", "ppt/presentation.xml", "ppt/_rels/presentation.xml.rels"]);

/**
 * @param {Buffer} buffer
 * @returns {{state:"validated"|"failed"|"corrupt"|"incomplete", errors:string[], pageCount?:number, byteLength:number}}
 */
export function cp04ValidatePdfBuffer(buffer) {
  const errors = [];
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { state: "failed", errors: ["el buffer está vacío o no es un Buffer"], byteLength: 0 };
  }
  const head = buffer.subarray(0, 8).toString("latin1");
  if (!head.startsWith(PDF_SIGNATURE)) {
    return { state: "corrupt", errors: [`firma inválida: se esperaba "${PDF_SIGNATURE}", se encontró "${head}"`], byteLength: buffer.length };
  }
  if (buffer.length < MIN_PDF_BYTES) {
    errors.push(`archivo demasiado pequeño para ser un PDF real (${buffer.length} bytes, mínimo ${MIN_PDF_BYTES})`);
  }

  const tail = buffer.subarray(Math.max(0, buffer.length - 32)).toString("latin1");
  if (!tail.includes("%%EOF")) {
    errors.push("falta el marcador de fin de archivo %%EOF — el PDF puede estar truncado");
  }

  const text = buffer.toString("latin1");
  const hasCatalog = /\/Type\s*\/Catalog/.test(text);
  if (!hasCatalog) errors.push("falta el objeto /Type /Catalog — estructura interna inválida");

  const countMatch = text.match(/\/Type\s*\/Pages[^>]*?\/Count\s+(\d+)/) || text.match(/\/Count\s+(\d+)[^>]*?\/Type\s*\/Pages/);
  const pageCount = countMatch ? Number(countMatch[1]) : (text.match(/\/Type\s*\/Page[^s]/g) || []).length;
  if (!pageCount || pageCount < 1) errors.push("no se detectó ninguna página (/Type /Page) en el PDF");

  const streamCount = (text.match(/\bstream\b/g) || []).length;
  if (streamCount === 0) errors.push("sin bloques de contenido (stream/endstream) — el PDF estaría vacío");

  if (errors.length > 0) {
    const isTruncation = errors.some((e) => e.includes("%%EOF") || e.includes("truncado"));
    return { state: isTruncation ? "incomplete" : "corrupt", errors, pageCount, byteLength: buffer.length };
  }
  return { state: "validated", errors: [], pageCount, byteLength: buffer.length };
}

/**
 * Valida un contenedor OOXML (DOCX o PPTX): ZIP real + partes XML
 * obligatorias presentes y no vacías. `format` decide qué entradas se
 * exigen.
 * @param {Buffer} buffer
 * @param {"docx"|"pptx"} format
 * @returns {Promise<{state:"validated"|"failed"|"corrupt"|"incomplete"|"unsupported", errors:string[], byteLength:number, entries?:string[]}>}
 */
export async function cp04ValidateOoxmlBuffer(buffer, format) {
  if (format !== "docx" && format !== "pptx") {
    return { state: "unsupported", errors: [`formato OOXML no soportado por este validador: "${format}"`], byteLength: buffer?.length || 0 };
  }
  if (!Buffer.isBuffer(buffer) || buffer.length === 0) {
    return { state: "failed", errors: ["el buffer está vacío o no es un Buffer"], byteLength: 0 };
  }
  if (buffer.subarray(0, 2).toString("hex") !== "504b") {
    return { state: "corrupt", errors: ["firma ZIP inválida (se esperaba 'PK' al inicio) — no es un contenedor OOXML real"], byteLength: buffer.length };
  }
  if (buffer.length < MIN_OOXML_BYTES) {
    return { state: "incomplete", errors: [`archivo demasiado pequeño para ser un ${format.toUpperCase()} real (${buffer.length} bytes, mínimo ${MIN_OOXML_BYTES})`], byteLength: buffer.length };
  }

  let zip;
  try {
    zip = await JSZip.loadAsync(buffer);
  } catch (error) {
    return { state: "corrupt", errors: [`el ZIP no se pudo abrir (contenedor truncado o corrupto): ${error.message}`], byteLength: buffer.length };
  }

  const required = format === "docx" ? CP04_DOCX_REQUIRED_ENTRIES : CP04_PPTX_REQUIRED_ENTRIES;
  const errors = [];
  for (const entry of required) {
    const file = zip.files[entry];
    if (!file) {
      errors.push(`falta la parte obligatoria "${entry}"`);
      continue;
    }
    if (!file.dir) {
      const content = await file.async("string");
      if (!content || content.trim().length === 0) errors.push(`la parte "${entry}" está vacía`);
      else if (!content.includes("<?xml")) errors.push(`la parte "${entry}" no parece XML válido (sin declaración <?xml)`);
    }
  }

  if (format === "pptx") {
    const slideEntries = Object.keys(zip.files).filter((n) => /^ppt\/slides\/slide\d+\.xml$/.test(n));
    if (slideEntries.length === 0) errors.push("no se encontró ninguna diapositiva real (ppt/slides/slideN.xml)");
  }

  const entries = Object.keys(zip.files);
  if (errors.length > 0) return { state: "incomplete", errors, byteLength: buffer.length, entries };
  return { state: "validated", errors: [], byteLength: buffer.length, entries };
}

/** MIME real por formato — nunca inferido de la extensión del archivo. */
export const CP04_BINARY_MIME = Object.freeze({
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
});
