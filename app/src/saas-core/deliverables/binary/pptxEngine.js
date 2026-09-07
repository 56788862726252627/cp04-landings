// App 3 · Prompt 4/6 — PptxEngine.
//
// Motor REAL de PPTX con `pptxgenjs` (pura JS, MIT, produce OpenXML
// válido internamente vía `jszip` — sin dependencias nativas, sin red
// en tiempo de ejecución). Acepta el mismo spec `{title, slides}` que
// PresentationPipeline ya usa para markdown/html (Prompt 1/6).

import pptxgen from "pptxgenjs";
import { Buffer } from "node:buffer";

const ACCENT_DEFAULT = "0EA5E9";
const INK_DEFAULT = "0F172A";

function hex(color) {
  return String(color || "").replace(/^#/, "").toUpperCase() || ACCENT_DEFAULT;
}

/**
 * @param {{title:string, slides:{title:string, bullets?:string[], notes?:string, image?:Buffer, table?:string[][]}[], brand?:{projectName?:string, accentColor?:string}}} deck
 * @returns {Promise<{status:"completed"|"failed", buffer?:Buffer, slideCount?:number, reason?:string}>}
 */
export async function cp04GeneratePptxFromDeck(deck) {
  if (!deck || !deck.title) return { status: "failed", reason: "cp04GeneratePptxFromDeck requiere deck.title" };
  if (!Array.isArray(deck.slides) || deck.slides.length === 0) {
    return { status: "failed", reason: "cp04GeneratePptxFromDeck requiere al menos 1 diapositiva en deck.slides" };
  }
  for (let i = 0; i < deck.slides.length; i++) {
    if (!deck.slides[i] || !deck.slides[i].title) {
      return { status: "failed", reason: `deck.slides[${i}] no tiene 'title'` };
    }
  }

  const accent = hex(deck.brand?.accentColor);
  const projectName = deck.brand?.projectName || "";

  try {
    const pptx = new pptxgen();
    pptx.defineLayout({ name: "CP04_16x9", width: 13.333, height: 7.5 });
    pptx.layout = "CP04_16x9";
    pptx.title = deck.title;
    pptx.author = projectName || "Agencia IA";

    // Portada.
    const cover = pptx.addSlide();
    cover.background = { color: INK_DEFAULT };
    cover.addText(deck.title, {
      x: 0.6, y: 2.6, w: 12.1, h: 1.6, align: "center",
      fontSize: 36, bold: true, color: "FFFFFF", fontFace: "Helvetica",
    });
    if (projectName) {
      cover.addText(projectName, { x: 0.6, y: 4.3, w: 12.1, h: 0.6, align: "center", fontSize: 16, color: accent });
    }

    deck.slides.forEach((slideSpec, idx) => {
      const slide = pptx.addSlide();
      slide.background = { color: "FFFFFF" };
      slide.addText(slideSpec.title, {
        x: 0.5, y: 0.35, w: 12.3, h: 0.8, fontSize: 26, bold: true, color: accent, fontFace: "Helvetica",
      });
      slide.addShape(pptx.ShapeType.line, { x: 0.5, y: 1.15, w: 12.3, h: 0, line: { color: accent, width: 1.5 } });

      if (Array.isArray(slideSpec.bullets) && slideSpec.bullets.length > 0) {
        slide.addText(
          slideSpec.bullets.map((text) => ({ text: String(text), options: { bullet: true, breakLine: true } })),
          { x: 0.6, y: 1.5, w: 12.1, h: 4.4, fontSize: 16, color: INK_DEFAULT, valign: "top" }
        );
      }
      if (Array.isArray(slideSpec.table) && slideSpec.table.length > 0) {
        const rows = slideSpec.table.map((row, rIdx) => row.map((cell) => ({
          text: String(cell ?? ""),
          options: { bold: rIdx === 0, fill: rIdx === 0 ? { color: accent } : undefined, color: rIdx === 0 ? "FFFFFF" : INK_DEFAULT },
        })));
        slide.addTable(rows, { x: 0.6, y: 3.4, w: 12.1, fontSize: 12, border: { type: "solid", color: "94A3B8", pt: 0.5 } });
      }
      if (slideSpec.image) {
        try {
          slide.addImage({ data: `data:image/png;base64,${slideSpec.image.toString("base64")}`, x: 8.4, y: 1.5, w: 4.2, h: 3.2 });
        } catch {
          // Imagen no válida: se omite sin abortar la diapositiva.
        }
      }
      if (slideSpec.notes) slide.addNotes(slideSpec.notes);

      slide.addText(`${idx + 1} / ${deck.slides.length}`, {
        x: 12.3, y: 7.05, w: 0.9, h: 0.35, fontSize: 9, color: "94A3B8", align: "right",
      });
    });

    // Cierre.
    const closing = pptx.addSlide();
    closing.background = { color: INK_DEFAULT };
    closing.addText("Gracias", { x: 0.6, y: 3.0, w: 12.1, h: 1.2, align: "center", fontSize: 32, bold: true, color: "FFFFFF" });
    if (projectName) closing.addText(projectName, { x: 0.6, y: 4.1, w: 12.1, h: 0.5, align: "center", fontSize: 14, color: accent });

    const buffer = await pptx.write({ outputType: "nodebuffer" });
    return { status: "completed", buffer: Buffer.isBuffer(buffer) ? buffer : Buffer.from(buffer), slideCount: deck.slides.length + 2 };
  } catch (error) {
    return { status: "failed", reason: `error generando PPTX: ${error.message}` };
  }
}
