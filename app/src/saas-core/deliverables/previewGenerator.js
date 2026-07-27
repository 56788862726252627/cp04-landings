// App 3 · Prompt 1/6 — PreviewGenerator.
//
// Genera previsualizaciones REALES en SVG (texto XML, cero dependencias,
// cero red) para logotipos/iconos/fondos/banners y para los marcos de
// MockupPipeline. No es un generador de diseño — es una plantilla
// paramétrica honesta: un rectángulo con color/tamaño/texto, útil como
// placeholder real y como base de trabajo, nunca presentado como un
// diseño final.

function escapeXml(text) {
  return String(text ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/**
 * @param {{width:number, height:number, label?:string, background?:string, foreground?:string, shape?:"rect"|"circle"}} spec
 * @returns {string} SVG completo, listo para escribir a disco o servir como image/svg+xml.
 */
export function cp04GenerateSvgPreview(spec = {}) {
  const width = Number.isFinite(spec.width) && spec.width > 0 ? Math.round(spec.width) : 320;
  const height = Number.isFinite(spec.height) && spec.height > 0 ? Math.round(spec.height) : 320;
  const background = spec.background || "#05080d";
  const foreground = spec.foreground || "#b6ff00";
  const label = escapeXml(spec.label || "");
  const shape = spec.shape === "circle" ? "circle" : "rect";

  const shapeMarkup = shape === "circle"
    ? `<circle cx="${width / 2}" cy="${height / 2}" r="${Math.min(width, height) / 2 - 4}" fill="${background}" stroke="${foreground}" stroke-width="2" />`
    : `<rect x="2" y="2" width="${width - 4}" height="${height - 4}" rx="12" fill="${background}" stroke="${foreground}" stroke-width="2" />`;

  const labelMarkup = label
    ? `<text x="${width / 2}" y="${height / 2}" fill="${foreground}" font-family="sans-serif" font-size="${Math.max(12, Math.round(Math.min(width, height) / 12))}" text-anchor="middle" dominant-baseline="middle">${label}</text>`
    : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">${shapeMarkup}${labelMarkup}</svg>`;
}

/** Envuelve un SVG ya generado en una página HTML mínima, autocontenida — útil para revisar la previsualización en un navegador sin escribir un archivo .svg aparte. */
export function cp04WrapSvgInHtmlPage(svgMarkup, title = "Previsualización") {
  return `<!doctype html><html lang="es"><head><meta charset="utf-8"><title>${escapeXml(title)}</title></head><body style="margin:0;display:flex;align-items:center;justify-content:center;min-height:100vh;background:#0b0f14;">${svgMarkup}</body></html>`;
}
