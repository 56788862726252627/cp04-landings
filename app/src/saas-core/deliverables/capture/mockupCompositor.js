// App 3 · Prompt 3/6 — MockupCompositor (Fase 5).
//
// Compone un marco SVG simple y genérico alrededor de una captura PNG
// real (incrustada como data URI base64 — sin escribir un segundo
// archivo binario aparte del PNG original). El marco es un rectángulo
// redondeado con una barra de metadatos — deliberadamente NO imita el
// contorno de ningún dispositivo comercial real (sin muescas, sin
// botones, sin logotipos): es una etiqueta informativa, no una
// falsificación de marca.

function escapeXml(text) {
  return String(text ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

const HEADER_HEIGHT = 56;
const PADDING = 12;
const THUMB_MAX_WIDTH = 480;

/**
 * @param {{pngBuffer:Buffer, device:string, system:string, orientation:string, resolution:{width:number,height:number}, projectName:string}} spec
 * @returns {string} SVG completo con la captura incrustada.
 */
export function cp04ComposeMockupFrame(spec) {
  const scale = spec.resolution.width > THUMB_MAX_WIDTH ? THUMB_MAX_WIDTH / spec.resolution.width : 1;
  const imgWidth = Math.round(spec.resolution.width * scale);
  const imgHeight = Math.round(spec.resolution.height * scale);
  const frameWidth = imgWidth + PADDING * 2;
  const frameHeight = imgHeight + HEADER_HEIGHT + PADDING * 2;
  const base64 = spec.pngBuffer.toString("base64");

  const metaLine = `${spec.device} · ${spec.system} · ${spec.orientation} · ${spec.resolution.width}×${spec.resolution.height}`;

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${frameWidth}" height="${frameHeight}" viewBox="0 0 ${frameWidth} ${frameHeight}">
  <rect x="0" y="0" width="${frameWidth}" height="${frameHeight}" rx="14" fill="#0b0f14" stroke="#334155" stroke-width="2" />
  <text x="${PADDING}" y="20" fill="#e2e8f0" font-family="sans-serif" font-size="13" font-weight="700">${escapeXml(spec.projectName)}</text>
  <text x="${PADDING}" y="38" fill="#94a3b8" font-family="sans-serif" font-size="11">${escapeXml(metaLine)}</text>
  <rect x="${frameWidth - 118}" y="10" width="106" height="18" rx="4" fill="#7c3aed" />
  <text x="${frameWidth - 65}" y="23" fill="#ffffff" font-family="sans-serif" font-size="9" font-weight="700" text-anchor="middle">SIMULACIÓN VISUAL</text>
  <image x="${PADDING}" y="${HEADER_HEIGHT}" width="${imgWidth}" height="${imgHeight}" href="data:image/png;base64,${base64}" />
</svg>`;
}
