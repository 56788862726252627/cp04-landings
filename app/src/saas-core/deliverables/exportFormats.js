// App 3 · Prompt 1/6 — Fábrica de entregables visuales.
//
// Registro único de los 11 formatos de exportación pedidos por el
// enunciado. Cada formato declara honestamente si esta sesión puede
// generarlo de verdad hoy (`implemented: true`, cero dependencias
// nuevas, cero llamadas de red) o si solo existe la interfaz/contrato a
// la espera de una librería de renderizado real (`implemented: false`).
//
// Criterio de qué queda `implemented: true`: solo los formatos que son
// texto plano estructurado (Markdown, HTML, SVG) o un objeto JSON
// (el propio manifiesto) se pueden producir con Node/JS puro, sin
// instalar nada y sin red — igual que esta app ya hace en
// `devicePreview.js`/`proposalGenerator.js` (Paso 20). PDF/DOCX/PPTX
// (binarios de Office/Adobe) y PNG/JPG/WebP/MP4/GIF (rasterizado/vídeo)
// requieren una librería real (pdfkit, docx, pptxgenjs, sharp, ffmpeg…)
// que no está instalada en este entorno — declararlos "implementados"
// sin esa librería sería exactamente el tipo de simulación que las
// reglas de esta sesión prohíben ("no declarar PDF real si no existe").

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
    implemented: false, engine: null, requiresDependency: "pdfkit o equivalente (no instalado)",
  }),
  docx: Object.freeze({
    id: "docx", label: "Word (DOCX)", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", extension: ".docx",
    implemented: false, engine: null, requiresDependency: "docx o equivalente (no instalado)",
  }),
  pptx: Object.freeze({
    id: "pptx", label: "PowerPoint (PPTX)", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation", extension: ".pptx",
    implemented: false, engine: null, requiresDependency: "pptxgenjs o equivalente (no instalado)",
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
