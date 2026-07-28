// App 3 · Prompt 4/6 — DocxPipeline.
//
// Punto de integración único de DOCX, reutilizado por los pipelines de
// documento y contrato (mismo spec `{title, sections}` que ya usan
// DocumentPipeline/ContractPipeline para markdown/html). Motor real:
// `binary/docxEngine.js` (`docx`, pura JS, sin red).

import { cp04GenerateDocxFromSpec } from "./binary/docxEngine.js";

/**
 * @param {{title:string, sections:object[]}} spec
 * @returns {Promise<{status:"completed"|"failed", format:"docx", buffer?:Buffer, reason?:string}>}
 */
export async function cp04GenerateDocx(spec) {
  if (!spec || !Array.isArray(spec.sections)) {
    return { status: "failed", format: "docx", reason: "cp04GenerateDocx requiere spec.sections (documento/contrato)" };
  }
  const result = await cp04GenerateDocxFromSpec(spec);
  return { ...result, format: "docx" };
}
