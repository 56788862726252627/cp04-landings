// App 3 · Prompt 1/6 — DocumentPipeline.
//
// Genera documentos reales en Markdown/HTML a partir de una plantilla
// simple (título + secciones) para manuales, informes, documentación
// técnica y comercial. Es la base que ContractPipeline y
// PresentationPipeline reutilizan. PDF/DOCX quedan como
// `not_implemented` (ver exportFormats.js) — se documenta la sección
// pedida, nunca se finge el binario.

import { cp04GetExportFormat } from "./exportFormats.js";

function escapeHtml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/**
 * @param {{title:string, sections:{heading:string, body:string}[], meta?:object}} spec
 */
function toMarkdown(spec) {
  const lines = [`# ${spec.title}`, ""];
  if (spec.meta && Object.keys(spec.meta).length > 0) {
    for (const [key, value] of Object.entries(spec.meta)) lines.push(`**${key}:** ${value}`);
    lines.push("");
  }
  for (const section of spec.sections || []) {
    lines.push(`## ${section.heading}`, "", section.body || "", "");
  }
  return lines.join("\n").trimEnd() + "\n";
}

function toHtml(spec) {
  const metaHtml = spec.meta && Object.keys(spec.meta).length > 0
    ? `<ul>${Object.entries(spec.meta).map(([k, v]) => `<li><strong>${escapeHtml(k)}:</strong> ${escapeHtml(v)}</li>`).join("")}</ul>`
    : "";
  const sectionsHtml = (spec.sections || [])
    .map((s) => `<section><h2>${escapeHtml(s.heading)}</h2><p>${escapeHtml(s.body).replace(/\n/g, "<br/>")}</p></section>`)
    .join("\n");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeHtml(spec.title)}</title></head><body><h1>${escapeHtml(spec.title)}</h1>${metaHtml}${sectionsHtml}</body></html>`;
}

/**
 * @param {{title:string, sections:{heading:string, body:string}[], meta?:object}} spec
 * @param {string} formatId
 * @returns {{status:"completed"|"failed"|"not_implemented", format:string, content?:string, reason?:string}}
 */
export function cp04GenerateDocument(spec, formatId = "markdown") {
  if (!spec || !spec.title) {
    return { status: "failed", reason: "el documento requiere al menos un 'title'", format: formatId };
  }
  const format = cp04GetExportFormat(formatId);
  if (!format) return { status: "failed", reason: `formato desconocido: "${formatId}"`, format: formatId };
  if (!format.implemented) {
    return { status: "not_implemented", reason: `el formato "${formatId}" todavía no tiene motor real (${format.requiresDependency})`, format: formatId };
  }

  if (format.id === "markdown") return { status: "completed", format: format.id, content: toMarkdown(spec) };
  if (format.id === "html") return { status: "completed", format: format.id, content: toHtml(spec) };
  return { status: "failed", reason: `DocumentPipeline solo produce markdown/html hoy, no "${formatId}"`, format: formatId };
}
