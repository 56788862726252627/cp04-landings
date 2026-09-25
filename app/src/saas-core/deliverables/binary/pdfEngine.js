// App 3 · Prompt 4/6 — PdfEngine.
//
// Motor REAL de PDF con `pdfkit` (pura JS, MIT, sin dependencias
// nativas, sin red en tiempo de ejecución — la misma librería que
// `exportFormats.js` ya nombraba como candidata desde el Prompt 1/6).
// Produce un Buffer de PDF real, válido, abrible en cualquier visor
// estándar — nunca un texto renombrado con extensión .pdf.
//
// Acepta el mismo spec `{title, subtitle?, meta?, sections}` que ya usa
// DocumentPipeline/ContractPipeline para markdown/html (Prompt 1/6) —
// mismo contenido, renderer distinto, sin duplicar la definición del
// documento en dos formatos incompatibles.

import PDFDocument from "pdfkit";
import { Buffer } from "node:buffer";

const PAGE_SIZE = "A4";
const PAGE_MARGIN = 56;

function collectPdfBuffer(doc) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });
}

function drawSimpleTable(doc, rows) {
  const startX = doc.page.margins.left;
  const usableWidth = doc.page.width - doc.page.margins.left - doc.page.margins.right;
  const colCount = rows[0].length;
  const colWidth = usableWidth / colCount;
  const rowHeight = 20;

  for (let r = 0; r < rows.length; r++) {
    if (doc.y + rowHeight > doc.page.height - doc.page.margins.bottom) doc.addPage();
    const y = doc.y;
    const isHeader = r === 0;
    doc.font(isHeader ? "Helvetica-Bold" : "Helvetica").fontSize(9);
    for (let c = 0; c < colCount; c++) {
      const x = startX + c * colWidth;
      doc.rect(x, y, colWidth, rowHeight).stroke("#94a3b8");
      doc.fillColor("#0f172a").text(String(rows[r][c] ?? ""), x + 4, y + 5, { width: colWidth - 8, height: rowHeight - 8, ellipsis: true });
    }
    doc.y = y + rowHeight;
  }
  doc.moveDown(0.5);
}

/**
 * @param {{title:string, subtitle?:string, meta?:object, sections:{heading:string, body?:string, bullets?:string[], table?:string[][], image?:Buffer}[], brand?:{projectName?:string, logoBuffer?:Buffer, accentColor?:string}}} spec
 * @returns {Promise<{status:"completed"|"failed", buffer?:Buffer, pageCount?:number, reason?:string}>}
 */
export async function cp04GeneratePdfFromSpec(spec) {
  if (!spec || !spec.title) return { status: "failed", reason: "cp04GeneratePdfFromSpec requiere spec.title" };
  if (!Array.isArray(spec.sections) || spec.sections.length === 0) {
    return { status: "failed", reason: "cp04GeneratePdfFromSpec requiere al menos 1 elemento en spec.sections" };
  }

  const accent = spec.brand?.accentColor || "#0f172a";
  const doc = new PDFDocument({
    size: PAGE_SIZE,
    margin: PAGE_MARGIN,
    bufferPages: true,
    info: {
      Title: spec.title,
      Author: spec.brand?.projectName || "Agencia IA",
      Subject: spec.subtitle || "",
      Creator: "Agencia IA — App 3 (App 3 · Prompt 4/6)",
      // Fecha fija (no `new Date()`): sin esto, pdfkit incrusta la hora
      // real de generación en los metadatos internos del PDF y dos
      // ejecuciones con el MISMO contenido producirían checksums
      // distintos — rompería la idempotencia del manifiesto. La fecha
      // visible en el documento (portada, spec.meta) no depende de esto.
      CreationDate: new Date(0),
      ModDate: new Date(0),
    },
  });
  const bufferPromise = collectPdfBuffer(doc);

  try {
    // Portada.
    doc.fontSize(26).font("Helvetica-Bold").fillColor(accent).text(spec.title, { align: "center" });
    if (spec.subtitle) {
      doc.moveDown(0.6).fontSize(14).font("Helvetica").fillColor("#334155").text(spec.subtitle, { align: "center" });
    }
    doc.moveDown(2);
    if (spec.brand?.logoBuffer) {
      try {
        doc.image(spec.brand.logoBuffer, doc.page.width / 2 - 60, doc.y, { fit: [120, 120] });
        doc.moveDown(6);
      } catch {
        // Un logo corrupto/no decodificable no debe romper la generación del PDF — se omite.
      }
    }
    if (spec.meta && Object.keys(spec.meta).length > 0) {
      doc.moveDown(1).fontSize(10).font("Helvetica").fillColor("#475569");
      for (const [key, value] of Object.entries(spec.meta)) {
        doc.text(`${key}: ${value}`, { align: "center" });
      }
    }

    doc.addPage();

    for (const section of spec.sections) {
      if (!section || !section.heading) continue;
      if (doc.y > doc.page.height - doc.page.margins.bottom - 80) doc.addPage();

      doc.fontSize(16).font("Helvetica-Bold").fillColor(accent).text(section.heading);
      doc.moveDown(0.4);

      if (section.body) {
        doc.fontSize(11).font("Helvetica").fillColor("#0f172a").text(section.body, { align: "justify" });
        doc.moveDown(0.4);
      }
      if (Array.isArray(section.bullets) && section.bullets.length > 0) {
        doc.fontSize(11).font("Helvetica").fillColor("#0f172a");
        for (const bullet of section.bullets) {
          doc.text(`•  ${bullet}`, { indent: 14 });
        }
        doc.moveDown(0.4);
      }
      if (Array.isArray(section.table) && section.table.length > 0) {
        drawSimpleTable(doc, section.table);
      }
      if (section.image) {
        try {
          doc.image(section.image, { fit: [420, 300], align: "center" });
          doc.moveDown(0.5);
        } catch {
          // Imagen no decodificable: se omite sin abortar el documento completo.
        }
      }
      doc.moveDown(0.8);
    }

    const range = doc.bufferedPageRange();
    for (let i = range.start; i < range.start + range.count; i++) {
      doc.switchToPage(i);
      // Escribir en la franja del margen inferior dispararía un salto de
      // página automático (pdfkit interpreta esa zona como "desbordada")
      // — se anula el margen inferior temporalmente solo para el pie.
      const bottomMargin = doc.page.margins.bottom;
      doc.page.margins.bottom = 0;
      doc.fontSize(8).font("Helvetica").fillColor("#94a3b8").text(
        `${spec.brand?.projectName || ""}   ·   Página ${i - range.start + 1} de ${range.count}`,
        doc.page.margins.left,
        doc.page.height - bottomMargin + 18,
        { align: "center", width: doc.page.width - doc.page.margins.left - doc.page.margins.right, lineBreak: false }
      );
      doc.page.margins.bottom = bottomMargin;
    }

    doc.end();
    const buffer = await bufferPromise;
    return { status: "completed", buffer, pageCount: range.count };
  } catch (error) {
    doc.end();
    await bufferPromise.catch(() => {});
    return { status: "failed", reason: `error generando PDF: ${error.message}` };
  }
}

/**
 * Genera un PDF tipo "folleto" a partir de una presentación (deck de
 * diapositivas) — una página por diapositiva, título + bullets + notas
 * al pie. Reutiliza el mismo motor, no un renderer distinto.
 * @param {{title:string, slides:{title:string, bullets?:string[], notes?:string}[], brand?:object}} deck
 */
export async function cp04GeneratePdfFromDeck(deck) {
  if (!deck || !deck.title) return { status: "failed", reason: "cp04GeneratePdfFromDeck requiere deck.title" };
  if (!Array.isArray(deck.slides) || deck.slides.length === 0) {
    return { status: "failed", reason: "cp04GeneratePdfFromDeck requiere al menos 1 diapositiva en deck.slides" };
  }
  const spec = {
    title: deck.title,
    subtitle: "Versión imprimible / folleto",
    brand: deck.brand,
    sections: deck.slides.map((slide, idx) => ({
      heading: `${idx + 1}. ${slide.title}`,
      bullets: slide.bullets,
      body: slide.notes ? `Notas: ${slide.notes}` : undefined,
    })),
  };
  return cp04GeneratePdfFromSpec(spec);
}
