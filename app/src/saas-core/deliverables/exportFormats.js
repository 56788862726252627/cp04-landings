// App 3 · Prompt 1/6 (registro) → Prompt 4/6 (motores PDF/DOCX/PPTX reales) —
// Fábrica de entregables visuales.
//
// Registro único de los 11 formatos de exportación pedidos por el
// enunciado. Cada formato declara honestamente si esta sesión puede
// generarlo de verdad hoy (`implemented: true`, sin llamadas de red en
// tiempo de ejecución) o si solo existe la interfaz/contrato a la
// espera de una librería de renderizado real (`implemented: false`).
//
// Markdown/HTML/SVG: texto plano estructurado, JS puro, sin dependencia.
// PDF (`pdfkit`)/DOCX (`docx`)/PPTX (`pptxgenjs`): motores reales desde
// el Prompt 4/6 — librerías puras JS, MIT, sin dependencias nativas, sin
// llamada de red en tiempo de ejecución (ver
// docs/app3-fabrica-entregables-20260727/05-motores-binarios-20260728.md).
// PNG/JPG/WebP/MP4/GIF (rasterizado/vídeo) siguen sin motor real
// instalado — declararlos "implementados" sin él sería exactamente el
// tipo de simulación que las reglas de esta sesión prohíben.

export const CP04_EXPORT_FORMATS = Object.freeze({
  markdown: Object.freeze({
    id: "markdown", label: "Markdown", mimeType: "text/markdown", extension: ".md",
    implemented: true, engine: "local-string-template", requiresDependency: null,
  }),
  html: Object.freeze({
    id: "html", label: "HTML", mimeType: "text/html", extension: ".html",
    implemented: true, engine: "local-string-template", requiresDependency: null,
  }),
  svg: Object.freeze({
    id: "svg", label: "SVG", mimeType: "image/svg+xml", extension: ".svg",
    implemented: true, engine: "local-string-template", requiresDependency: null,
  }),
  pdf: Object.freeze({
    id: "pdf", label: "PDF", mimeType: "application/pdf", extension: ".pdf",
    implemented: true, engine: "pdfkit", requiresDependency: null,
  }),
  docx: Object.freeze({
    id: "docx", label: "Word (DOCX)", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: ".docx",
    implemented: true, engine: "docx", requiresDependency: null,
  }),
  pptx: Object.freeze({
    id: "pptx", label: "PowerPoint (PPTX)", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extension: ".pptx",
    implemented: true, engine: "pptxgenjs", requiresDependency: null,
  }),
  png: Object.freeze({
    id: "png", label: "PNG", mimeType: "image/png", extension: ".png",
    implemented: false, engine: null, requiresDependency: "sharp/canvas o equivalente (no instalado)",
  }),
  jpg: Object.freeze({
    id: "jpg", label: "JPG", mimeType: "image/jpeg", extension: ".jpg",
    implemented: false, engine: null, requiresDependency: "sharp/canvas o equivalente (no instalado)",
  }),
  webp: Object.freeze({
    id: "webp", label: "WebP", mimeType: "image/webp", extension: ".webp",
    implemented: false, engine: null, requiresDependency: "sharp o equivalente (no instalado)",
  }),
  mp4: Object.freeze({
    id: "mp4", label: "MP4", mimeType: "video/mp4", extension: ".mp4",
    implemented: false, engine: null, requiresDependency: "ffmpeg o equivalente (no instalado)",
  }),
  gif: Object.freeze({
    id: "gif", label: "GIF", mimeType: "image/gif", extension: ".gif",
    implemented: false, engine: null, requiresDependency: "ffmpeg/gifenc o equivalente (no instalado)",
  }),
});

export const CP04_EXPORT_FORMAT_IDS = Object.freeze(Object.keys(CP04_EXPORT_FORMATS));

export function cp04GetExportFormat(formatId) {
  return CP04_EXPORT_FORMATS[String(formatId || "").toLowerCase()] || null;
}

export function cp04IsFormatImplemented(formatId) {
  const format = cp04GetExportFormat(formatId);
  return Boolean(format?.implemented);
}

export function cp04ListImplementedFormats() {
  return CP04_EXPORT_FORMAT_IDS.filter((id) => CP04_EXPORT_FORMATS[id].implemented);
}

export function cp04ListPendingFormats() {
  return CP04_EXPORT_FORMAT_IDS.filter((id) => !CP04_EXPORT_FORMATS[id].implemented);
}
