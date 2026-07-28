// App 3 · Prompt 1/6 (stub) → Prompt 4/6 (motor real) — PdfPipeline.
//
// Punto de integración único de PDF, reutilizado por los pipelines de
// documento/contrato (spec `{title, sections}`) y de presentación
// (deck `{title, slides}`) — un solo motor real (`binary/pdfEngine.js`,
// `pdfkit`), sin duplicar lógica de renderizado por tipo de entregable.
//
// Hasta el Prompt 4/6 esto era un adaptador "siempre not_implemented"
// a la espera de una librería real. Ya no: `pdfkit` es pura JS, sin
// dependencias nativas, sin red en tiempo de ejecución (ver
// docs/app3-fabrica-entregables-20260727/05-motores-binarios-20260728.md
// para el detalle de la decisión). El punto de extensión por
// `CP04_PDF_ENGINE_MODULE` queda retirado: no tiene sentido seguir
// declarando un motor "pendiente de configurar" cuando ya hay uno real
// y por defecto.

import { cp04GeneratePdfFromSpec, cp04GeneratePdfFromDeck } from "./binary/pdfEngine.js";

/**
 * @param {{title:string, sections?:object[], slides?:object[]}} payload - documento/contrato (`sections`) o presentación (`slides`).
 * @returns {Promise<{status:"completed"|"failed", format:"pdf", buffer?:Buffer, pageCount?:number, reason?:string}>}
 */
export async function cp04GeneratePdf(payload) {
  if (!payload) return { status: "failed", format: "pdf", reason: "cp04GeneratePdf requiere un documento o una presentación" };

  if (Array.isArray(payload.slides)) {
    const result = await cp04GeneratePdfFromDeck(payload);
    return { ...result, format: "pdf" };
  }
  if (Array.isArray(payload.sections)) {
    const result = await cp04GeneratePdfFromSpec(payload);
    return { ...result, format: "pdf" };
  }
  return { status: "failed", format: "pdf", reason: "cp04GeneratePdf requiere payload.sections (documento/contrato) o payload.slides (presentación)" };
}
