/**
 * CORE · faviconGenerator.js
 * Genera favicon SVG por cliente desde branding del manifest.
 * Sin dependencias externas. Sin llamadas de red. 100% ficticio/demo.
 *
 * Prioridad:
 *   1. branding.favicon  → SVG inline o data URI proporcionado por el cliente
 *   2. branding.inicial + branding.primaryColor → SVG autogenerado (fallback)
 */

/**
 * Genera un SVG de favicon (32x32) para el cliente.
 *
 * @param {object} branding  - manifest.branding
 * @param {object} business  - manifest.business
 * @returns {string} SVG string
 */
export function generateFaviconSvg(branding = {}, business = {}) {
  // Priority 1: cliente proporciona favicon personalizado (SVG inline)
  if (branding.favicon && typeof branding.favicon === 'string') {
    return branding.favicon;
  }

  // Fallback: genera a partir de inicial + primaryColor
  const inicial      = (branding.inicial ?? (business.name ?? 'S').charAt(0)).toUpperCase();
  const primaryColor = branding.primaryColor ?? '#1d4ed8';

  // SVG inline compacto con esquinas redondeadas + texto centrado
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32">',
    `<rect width="32" height="32" rx="6" fill="${primaryColor}"/>`,
    `<text x="16" y="23" text-anchor="middle" `,
    `font-family="system-ui,-apple-system,sans-serif" `,
    `font-size="18" font-weight="700" fill="#ffffff">${inicial}</text>`,
    '</svg>',
  ].join('');
}

/**
 * Convierte SVG string a data URI base64 para uso en <link rel="icon">.
 *
 * @param {string} svgString
 * @returns {string} data:image/svg+xml;base64,...
 */
export function faviconToDataUri(svgString) {
  const b64 = Buffer.from(svgString, 'utf8').toString('base64');
  return `data:image/svg+xml;base64,${b64}`;
}

/**
 * Retorna el tag <link rel="icon"> completo para insertar en HTML.
 *
 * @param {object} manifest
 * @returns {string} HTML tag completo
 */
export function getFaviconLinkTag(manifest) {
  const br  = manifest?.branding  ?? {};
  const biz = manifest?.business  ?? {};
  const svg = generateFaviconSvg(br, biz);
  const uri = faviconToDataUri(svg);
  return `<link rel="icon" href="${uri}" type="image/svg+xml">`;
}

/**
 * Retorna el tag <link rel="apple-touch-icon"> para iOS.
 * Misma imagen que el favicon principal.
 *
 * @param {object} manifest
 * @returns {string} HTML tag completo
 */
export function getAppleTouchIconTag(manifest) {
  const br  = manifest?.branding  ?? {};
  const biz = manifest?.business  ?? {};
  const svg = generateFaviconSvg(br, biz);
  const uri = faviconToDataUri(svg);
  return `<link rel="apple-touch-icon" href="${uri}">`;
}

/**
 * Retorna el tag <meta name="theme-color"> a partir del branding.
 *
 * @param {object} manifest
 * @returns {string} HTML tag completo
 */
export function getThemeColorMeta(manifest) {
  const color = manifest?.branding?.primaryColor ?? '#1d4ed8';
  return `<meta name="theme-color" content="${color}">`;
}

/**
 * Genera todos los tags de identidad visual para insertar en <head>.
 * Retorna un bloque HTML listo para insertar.
 *
 * @param {object} manifest
 * @returns {string} HTML snippet con favicon + theme-color + apple-touch-icon
 */
export function getBrandingHeadTags(manifest) {
  return [
    getFaviconLinkTag(manifest),
    getAppleTouchIconTag(manifest),
    getThemeColorMeta(manifest),
  ].join('\n    ');
}
