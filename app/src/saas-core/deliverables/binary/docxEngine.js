// App 3 · Prompt 4/6 — DocxEngine.
//
// Motor REAL de DOCX con la librería `docx` (pura JS, MIT, produce
// OpenXML válido internamente vía `jszip` — sin dependencias nativas,
// sin red en tiempo de ejecución). Acepta el mismo spec
// `{title, subtitle?, meta?, sections}` que PdfEngine y que
// DocumentPipeline/ContractPipeline ya usan para markdown/html.

import {
  Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType,
  Table, TableRow, TableCell, WidthType, ImageRun, Header, Footer,
  PageNumber, BorderStyle,
} from "docx";

function bulletParagraphs(bullets) {
  return (bullets || []).map((text) => new Paragraph({ text: String(text), bullet: { level: 0 } }));
}

function tableFromRows(rows) {
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: rows.map((row, rIdx) => new TableRow({
      children: row.map((cell) => new TableCell({
        width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
        borders: {
          top: { style: BorderStyle.SINGLE, size: 2, color: "94A3B8" },
          bottom: { style: BorderStyle.SINGLE, size: 2, color: "94A3B8" },
          left: { style: BorderStyle.SINGLE, size: 2, color: "94A3B8" },
          right: { style: BorderStyle.SINGLE, size: 2, color: "94A3B8" },
        },
        children: [new Paragraph({ children: [new TextRun({ text: String(cell ?? ""), bold: rIdx === 0 })] })],
      })),
    })),
  });
}

function sectionImageParagraph(imageBuffer) {
  try {
    return new Paragraph({
      children: [new ImageRun({ data: imageBuffer, transformation: { width: 420, height: 280 }, type: "png" })],
    });
  } catch {
    return null;
  }
}

/**
 * @param {{title:string, subtitle?:string, meta?:object, sections:{heading:string, body?:string, bullets?:string[], table?:string[][], image?:Buffer}[], brand?:{projectName?:string, accentColor?:string}}} spec
 * @returns {Promise<{status:"completed"|"failed", buffer?:Buffer, reason?:string}>}
 */
export async function cp04GenerateDocxFromSpec(spec) {
  if (!spec || !spec.title) return { status: "failed", reason: "cp04GenerateDocxFromSpec requiere spec.title" };
  if (!Array.isArray(spec.sections) || spec.sections.length === 0) {
    return { status: "failed", reason: "cp04GenerateDocxFromSpec requiere al menos 1 elemento en spec.sections" };
  }

  try {
    const children = [];

    children.push(new Paragraph({ text: spec.title, heading: HeadingLevel.TITLE, alignment: AlignmentType.CENTER }));
    if (spec.subtitle) {
      children.push(new Paragraph({ text: spec.subtitle, alignment: AlignmentType.CENTER, spacing: { after: 200 } }));
    }
    if (spec.meta && Object.keys(spec.meta).length > 0) {
      for (const [key, value] of Object.entries(spec.meta)) {
        children.push(new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: `${key}: ${value}`, size: 20, color: "475569" })] }));
      }
    }
    children.push(new Paragraph({ text: "", pageBreakBefore: true }));

    for (const section of spec.sections) {
      if (!section || !section.heading) continue;
      children.push(new Paragraph({ text: section.heading, heading: HeadingLevel.HEADING_1 }));
      if (section.body) children.push(new Paragraph({ text: section.body }));
      if (Array.isArray(section.bullets) && section.bullets.length > 0) children.push(...bulletParagraphs(section.bullets));
      if (Array.isArray(section.table) && section.table.length > 0) children.push(tableFromRows(section.table));
      if (section.image) {
        const imgPara = sectionImageParagraph(section.image);
        if (imgPara) children.push(imgPara);
      }
      children.push(new Paragraph({ text: "" }));
    }

    const doc = new Document({
      creator: spec.brand?.projectName || "Agencia IA",
      title: spec.title,
      subject: spec.subtitle || "",
      description: `Generado por App 3 · Prompt 4/6`,
      sections: [
        {
          properties: {},
          headers: {
            default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: spec.brand?.projectName || spec.title, size: 16, color: "94A3B8" })] })] }),
          },
          footers: {
            default: new Footer({
              children: [new Paragraph({
                alignment: AlignmentType.CENTER,
                children: [
                  new TextRun({ text: "Página ", size: 16, color: "94A3B8" }),
                  new TextRun({ children: [PageNumber.CURRENT], size: 16, color: "94A3B8" }),
                  new TextRun({ text: " de ", size: 16, color: "94A3B8" }),
                  new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 16, color: "94A3B8" }),
                ],
              })],
            }),
          },
          children,
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);
    return { status: "completed", buffer };
  } catch (error) {
    return { status: "failed", reason: `error generando DOCX: ${error.message}` };
  }
}
