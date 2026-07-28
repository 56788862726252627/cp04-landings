// App 3 · Prompt 1/6 — PdfPipeline.
//
// Interfaz para generación real de PDF. Hoy NO hay ninguna librería de
// renderizado de PDF instalada en este entorno (pdfkit/puppeteer/etc.)
// — instalar una implicaría una dependencia nueva y, en el caso de un
// motor basado en navegador, un coste de proceso no justificado para
// este prompt. `cp04GeneratePdf` es por tanto un adaptador "siempre
// not_implemented" por defecto, con la misma forma de contrato que
// tendrá el adaptador real el día que se conecte — así ExportManager no
// tiene que cambiar cuando eso ocurra.
//
// Nota de diseño: Torneos (Club Pádel 04) ya resuelve "imprimir/PDF" en
// el navegador con `window.print()` (diálogo nativo) — eso es válido
// solo dentro de una pestaña de navegador con interacción del usuario,
// no sirve para generar un PDF en un pipeline de servidor/Node como
// este. Son dos problemas distintos, no se confunden aquí.

export function cp04IsPdfEngineConfigured(env = {}) {
  return Boolean(env.CP04_PDF_ENGINE_MODULE);
}

/**
 * @param {{content:string, title?:string}} spec - contenido ya generado (p. ej. por DocumentPipeline) que se querría convertir a PDF.
 * @param {object} [env]
 * @returns {{status:"not_implemented"|"completed", reason?:string}}
 */
export function cp04GeneratePdf(spec, env = {}) {
  if (!spec || !spec.content) {
    return { status: "failed", reason: "cp04GeneratePdf requiere spec.content (el documento ya generado en markdown/html)" };
  }
  if (!cp04IsPdfEngineConfigured(env)) {
    return {
      status: "not_implemented",
      reason: "no hay motor de PDF configurado (CP04_PDF_ENGINE_MODULE) — este entorno no instala librerías de renderizado de PDF por defecto, coste 0€ y sin dependencias nuevas",
    };
  }
  // Punto de extensión: cuando exista un motor real, env.CP04_PDF_ENGINE_MODULE
  // apuntaría a un adaptador inyectable que implemente { render(spec) }.
  // No se implementa aquí — API lista, sin simular un PDF que no existe.
  return { status: "not_implemented", reason: "motor de PDF declarado pero sin implementación conectada en este prompt" };
}
