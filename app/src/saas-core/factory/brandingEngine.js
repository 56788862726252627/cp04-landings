// Paso 10 · Fase 6 — Motor de branding white-label.
//
// Capa DECLARATIVA: resuelve `blueprint.branding` a un conjunto de tokens
// (colores, tipografías, radios, sombras) con valores seguros por defecto y
// comprobación de contraste (WCAG 2 relative luminance). No genera ningún
// binario (favicon.ico, PNGs de icono): para eso deja el CONTRATO de
// tamaños/formatos requeridos, con estado "not_implemented" explícito,
// siguiendo el mismo patrón que `adapters/providerAdapters.js`.

const DEFAULT_COLORS = Object.freeze({
  primary: "#2f6bff",
  accent: "#20e3b2",
  bg: "#ffffff",
  surface: "#f4f6fb",
  text: "#0c1420",
  danger: "#d6493a",
  warning: "#c98a1c",
});

const DEFAULT_FONTS = Object.freeze({ display: "'Inter', sans-serif", body: "'Inter', sans-serif" });
const DEFAULT_RADII = Object.freeze({ sm: "6px", md: "12px", lg: "20px", pill: "999px" });
const DEFAULT_SHADOWS = Object.freeze({
  sm: "0 1px 2px rgba(12,20,32,0.08)",
  md: "0 4px 16px rgba(12,20,32,0.12)",
  lg: "0 12px 32px rgba(12,20,32,0.18)",
});

// Fase 6 — contrato de generación futura de assets binarios de icono/PWA.
// Ninguna función de este módulo produce estos ficheros; solo documenta el
// tamaño/nombre esperado para que un generador posterior (Fase 13, fuera de
// alcance) tenga un objetivo estable y verificable.
export const ICON_SIZES_PX = Object.freeze([16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512]);

export const PENDING_BINARY_ASSETS = Object.freeze([
  { id: "favicon_ico", label: "favicon.ico", status: "not_implemented" },
  ...ICON_SIZES_PX.map((size) => ({ id: `icon_${size}`, label: `icon-${size}.png`, status: "not_implemented", sizePx: size })),
  { id: "apple_touch_icon", label: "apple-touch-icon.png (180x180)", status: "not_implemented" },
  { id: "maskable_icon_192", label: "maskable-icon-192.png", status: "not_implemented" },
  { id: "maskable_icon_512", label: "maskable-icon-512.png", status: "not_implemented" },
  { id: "manifest_webmanifest", label: "manifest.webmanifest", status: "not_implemented" },
]);

function hexToRgb(hex) {
  const clean = String(hex).replace("#", "");
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function channelToLinear(c) {
  const v = c / 255;
  return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
}

/** Luminancia relativa WCAG 2 de un color hexadecimal (#rrggbb). */
export function relativeLuminance(hex) {
  const { r, g, b } = hexToRgb(hex);
  const [rl, gl, bl] = [r, g, b].map(channelToLinear);
  return 0.2126 * rl + 0.7152 * gl + 0.0722 * bl;
}

/** Ratio de contraste WCAG 2 entre dos colores hexadecimales (1..21). */
export function contrastRatio(hexA, hexB) {
  const lA = relativeLuminance(hexA) + 0.05;
  const lB = relativeLuminance(hexB) + 0.05;
  return lA > lB ? lA / lB : lB / lA;
}

/** true si el par cumple el mínimo AA de WCAG 2 (4.5:1 texto normal). */
export function meetsWcagAA(hexA, hexB) {
  return contrastRatio(hexA, hexB) >= 4.5;
}

/**
 * Resuelve el branding declarativo de un blueprint a un conjunto completo
 * de tokens, con fallback seguro por token y un reporte de contraste.
 * Nunca lanza: un branding parcial o ausente produce tokens por defecto.
 * @param {{colors?: object, fonts?: object, tone?: string, logoRef?: string, faviconRef?: string} | undefined} branding
 */
export function resolveBrandTokens(branding = {}) {
  const colors = { ...DEFAULT_COLORS, ...(branding?.colors || {}) };
  const fonts = { ...DEFAULT_FONTS, ...(branding?.fonts || {}) };
  const tone = branding?.tone || "profesional-neutro";

  const contrastChecks = [
    { pair: "text_on_bg", a: colors.text, b: colors.bg, ratio: contrastRatio(colors.text, colors.bg) },
    { pair: "text_on_surface", a: colors.text, b: colors.surface, ratio: contrastRatio(colors.text, colors.surface) },
    { pair: "bg_on_primary", a: colors.bg, b: colors.primary, ratio: contrastRatio(colors.bg, colors.primary) },
  ];
  const failing = contrastChecks.filter((c) => c.ratio < 4.5);

  return {
    colors,
    fonts,
    radii: { ...DEFAULT_RADII },
    shadows: { ...DEFAULT_SHADOWS },
    tone,
    logoRef: branding?.logoRef || null,
    faviconRef: branding?.faviconRef || null,
    contrast: {
      checks: contrastChecks,
      allPassAA: failing.length === 0,
      failing,
    },
    fallbackApplied: {
      colors: Object.keys(DEFAULT_COLORS).filter((k) => !(branding?.colors || {})[k]),
      fonts: Object.keys(DEFAULT_FONTS).filter((k) => !(branding?.fonts || {})[k]),
    },
  };
}

/** Serializa los tokens resueltos como custom properties CSS (:root {...}). */
export function tokensToCssVariables(tokens) {
  const lines = [":root {"];
  for (const [key, value] of Object.entries(tokens.colors)) lines.push(`  --color-${key}: ${value};`);
  lines.push(`  --font-display: ${tokens.fonts.display};`);
  lines.push(`  --font-body: ${tokens.fonts.body};`);
  for (const [key, value] of Object.entries(tokens.radii)) lines.push(`  --radius-${key}: ${value};`);
  for (const [key, value] of Object.entries(tokens.shadows)) lines.push(`  --shadow-${key}: ${value};`);
  lines.push("}");
  return lines.join("\n") + "\n";
}

/** Manifest declarativo (sin binarios) de los assets PWA/branding pendientes de generación visual. */
export function buildPendingAssetsManifest({ businessId }) {
  return {
    businessId,
    generatedAt: null,
    note: "Ningún binario se genera en este paso. Contrato + fixtures preparados para un generador visual futuro (Fase 13).",
    assets: PENDING_BINARY_ASSETS,
  };
}
