// App 3 · Prompt 1/6 — PresentationPipeline.
//
// Genera una presentación como una lista estructurada de diapositivas
// (título + puntos + notas), exportable de verdad a Markdown/HTML hoy.
// PPTX/PDF quedan `not_implemented` (ver exportFormats.js) — el
// contenido de cada diapositiva ya queda definido y reutilizable en
// cuanto exista un motor real de PPTX.

import { cp04GetExportFormat } from "./exportFormats.js";

/** @param {{title:string, bullets?:string[], notes?:string}} slide */
function validateSlide(slide, index) {
  if (!slide || typeof slide !== "object" || !slide.title) {
    return `slides[${index}]: falta 'title'`;
  }
  return null;
}

function toMarkdown(deck) {
  const lines = [`# ${deck.title}`, ""];
  deck.slides.forEach((slide, idx) => {
    lines.push(`## Diapositiva ${idx + 1}: ${slide.title}`, "");
    for (const bullet of slide.bullets || []) lines.push(`- ${bullet}`);
    if (slide.notes) lines.push("", `_Notas: ${slide.notes}_`);
    lines.push("");
  });
  return lines.join("\n").trimEnd() + "\n";
}

function toHtml(deck) {
  const slidesHtml = deck.slides
    .map((slide, idx) => {
      const bulletsHtml = (slide.bullets || []).map((b) => `<li>${b}</li>`).join("");
      const notesHtml = slide.notes ? `<p class="notes"><em>Notas: ${slide.notes}</em></p>` : "";
      return `<section class="slide" data-index="${idx + 1}"><h2>${slide.title}</h2><ul>${bulletsHtml}</ul>${notesHtml}</section>`;
    })
    .join("\n");
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${deck.title}</title></head><body><h1>${deck.title}</h1>${slidesHtml}</body></html>`;
}

/**
 * @param {{title:string, slides:{title:string, bullets?:string[], notes?:string}[]}} deck
 * @param {string} [formatId]
 */
export function cp04GeneratePresentation(deck, formatId = "markdown") {
  if (!deck || !deck.title) return { status: "failed", reason: "la presentación requiere un 'title'", format: formatId };
  if (!Array.isArray(deck.slides) || deck.slides.length === 0) {
    return { status: "failed", reason: "la presentación requiere al menos 1 diapositiva en 'slides'", format: formatId };
  }
  for (let i = 0; i < deck.slides.length; i++) {
    const error = validateSlide(deck.slides[i], i);
    if (error) return { status: "failed", reason: error, format: formatId };
  }

  const format = cp04GetExportFormat(formatId);
  if (!format) return { status: "failed", reason: `formato desconocido: "${formatId}"`, format: formatId };
  if (!format.implemented) {
    return { status: "not_implemented", reason: `el formato "${formatId}" todavía no tiene motor real (${format.requiresDependency})`, format: formatId, slideCount: deck.slides.length };
  }

  if (format.id === "markdown") return { status: "completed", format: format.id, content: toMarkdown(deck), slideCount: deck.slides.length };
  if (format.id === "html") return { status: "completed", format: format.id, content: toHtml(deck), slideCount: deck.slides.length };
  return { status: "failed", reason: `PresentationPipeline solo produce markdown/html hoy, no "${formatId}"`, format: formatId };
}
