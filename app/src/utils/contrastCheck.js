// Club Pádel 04 · Cálculo de contraste WCAG 2.x, puro y reutilizable.
//
// Prompt 4 (Mejora 2.6, 2026-07-26): auditoría de accesibilidad encontró
// varios botones con contraste real ~1:1 (texto prácticamente invisible)
// causados por reglas CSS "catch-all" que no distinguían el propósito de
// cada elemento. Este módulo formaliza el cálculo usado para medirlo y
// para evitar que vuelva a pasar sin que un test lo note.

function hexToRgb(hex) {
  const clean = String(hex || "").replace("#", "");
  const full = clean.length === 3 ? clean.split("").map((c) => c + c).join("") : clean;
  const num = parseInt(full, 16);
  return { r: (num >> 16) & 255, g: (num >> 8) & 255, b: num & 255 };
}

function relativeLuminance({ r, g, b }) {
  const channel = (c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function cp04ContrastRatio(fgHex, bgHex) {
  const L1 = relativeLuminance(hexToRgb(fgHex)) + 0.05;
  const L2 = relativeLuminance(hexToRgb(bgHex)) + 0.05;
  return L1 > L2 ? L1 / L2 : L2 / L1;
}

// WCAG 2.x AA: 4.5:1 para texto normal, 3:1 para texto grande
// (>=24px, o >=18.66px si es negrita/peso >=700).
export function cp04MeetsAA(ratio, { isLargeText = false } = {}) {
  return ratio >= (isLargeText ? 3 : 4.5);
}
