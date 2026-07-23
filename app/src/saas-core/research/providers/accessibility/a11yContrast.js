// Paso 17 · Fase 3.I — Cálculo de contraste WCAG 2.2 (fórmula normativa
// real, no una aproximación). Solo calcula cuando AMBOS colores
// (texto/fondo) son extraíbles y reconocibles (#hex o rgb()) — cuando no,
// `computeContrastRatio` devuelve `null` (nunca inventa un contraste).

/** "#fff"/"#ffffff"/"rgb(255,255,255)"/"rgba(255,255,255,0.9)" -> {r,g,b} | null */
export function parseColor(value) {
  const v = String(value ?? "").trim().toLowerCase();
  const hex3 = v.match(/^#([0-9a-f])([0-9a-f])([0-9a-f])$/);
  if (hex3) return { r: parseInt(hex3[1] + hex3[1], 16), g: parseInt(hex3[2] + hex3[2], 16), b: parseInt(hex3[3] + hex3[3], 16) };
  const hex6 = v.match(/^#([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/);
  if (hex6) return { r: parseInt(hex6[1], 16), g: parseInt(hex6[2], 16), b: parseInt(hex6[3], 16) };
  const rgb = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) return { r: Number(rgb[1]), g: Number(rgb[2]), b: Number(rgb[3]) };
  return null;
}

function channelToLinear(c) {
  const s = c / 255;
  return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

/** Luminancia relativa WCAG (0-1). */
export function relativeLuminance({ r, g, b }) {
  return 0.2126 * channelToLinear(r) + 0.7152 * channelToLinear(g) + 0.0722 * channelToLinear(b);
}

/** Ratio de contraste WCAG (1-21). Devuelve null si algún color no es reconocible. */
export function computeContrastRatio(foreground, background) {
  const fg = parseColor(foreground);
  const bg = parseColor(background);
  if (!fg || !bg) return null;
  const l1 = relativeLuminance(fg);
  const l2 = relativeLuminance(bg);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

// WCAG 2.2 SC 1.4.3 (AA): texto normal 4.5:1, texto grande 3:1. Sin
// información de tamaño de fuente fiable desde HTML/CSS estático, se usa
// el umbral de texto normal (más estricto) por defecto — declarado así
// explícitamente en cada hallazgo, nunca se infiere el tamaño de fuente.
export const WCAG_AA_NORMAL_TEXT_THRESHOLD = 4.5;
export const WCAG_AA_LARGE_TEXT_THRESHOLD = 3;
