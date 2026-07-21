// Paso 12 · Fase 6 — Extracción de señales de HTML (funciones puras).
//
// Regex ligero, no un parser DOM completo (no hay dependencias nuevas):
// suficiente para detectar señales estructurales reales en un snapshot
// HTML local o de fixture. Separado de sourceAdapters.js para que cada
// señal sea testeable de forma aislada y determinista.

function stripTags(html) {
  return String(html ?? "")
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function hasViewportMeta(html) {
  return /<meta[^>]+name=["']viewport["']/i.test(html);
}

export function hasManifestLink(html) {
  return /<link[^>]+rel=["']manifest["']/i.test(html);
}

export function hasJsonLd(html) {
  return /<script[^>]+type=["']application\/ld\+json["']/i.test(html);
}

export function getTitleLength(html) {
  const match = html.match(/<title>([\s\S]*?)<\/title>/i);
  return match ? match[1].trim().length : 0;
}

export function getMetaDescriptionLength(html) {
  const match = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']*)["']/i);
  return match ? match[1].trim().length : 0;
}

export function hasCanonicalLink(html) {
  return /<link[^>]+rel=["']canonical["']/i.test(html);
}

export function countHeadings(html) {
  const matches = html.match(/<h[1-3][^>]*>/gi);
  return matches ? matches.length : 0;
}

export function wordCount(html) {
  const text = stripTags(html);
  return text.length === 0 ? 0 : text.split(/\s+/).filter(Boolean).length;
}

/** Cobertura de atributos alt no vacíos sobre el total de <img>. Devuelve null si no hay imágenes. */
export function altAttributeCoverage(html) {
  const imgs = html.match(/<img\b[^>]*>/gi) || [];
  if (imgs.length === 0) return null;
  const withAlt = imgs.filter((tag) => /\balt=["'][^"']+["']/i.test(tag)).length;
  return withAlt / imgs.length;
}

export function ariaAttributeCount(html) {
  const matches = html.match(/\baria-[a-z]+=/gi);
  return matches ? matches.length : 0;
}

/** Colores hex únicos hallados en atributos style/CSS embebido (heurística de branding). */
export function extractHexColors(html) {
  const matches = html.match(/#[0-9a-fA-F]{3,6}\b/g) || [];
  return [...new Set(matches.map((c) => c.toLowerCase()))];
}

const BOOKING_KEYWORDS = /\b(reserva|reservar|cita previa|book now|book an appointment|agenda tu cita|pide cita)\b/i;

export function hasBookingSignal(html) {
  const text = stripTags(html);
  return BOOKING_KEYWORDS.test(text) || /<form[^>]*(reserva|booking|cita)/i.test(html);
}

export function hasContactInfo(html) {
  const text = stripTags(html);
  const hasPhone = /(\+?\d[\d\s().-]{7,}\d)/.test(text);
  const hasEmail = /[\w.+-]+@[\w-]+\.[a-z]{2,}/i.test(text);
  return hasPhone || hasEmail;
}

const SOCIAL_DOMAINS = ["facebook.com", "instagram.com", "twitter.com", "x.com", "tiktok.com", "linkedin.com/company", "youtube.com"];

export function extractSocialLinks(html) {
  const found = [];
  for (const domain of SOCIAL_DOMAINS) {
    const pattern = new RegExp(`href=["'][^"']*${domain.replace(/[./]/g, "\\$&")}`, "i");
    if (pattern.test(html)) found.push(domain);
  }
  return found;
}

/** Enlaces http:// dentro de una página servida (o que declara ser) https — señal de contenido mixto. */
export function hasMixedContentLinks(html) {
  return /href=["']http:\/\/(?!localhost)/i.test(html) || /src=["']http:\/\/(?!localhost)/i.test(html);
}

export function hasPrivacyPolicyLink(html) {
  return /(privacidad|aviso legal|privacy policy|política de privacidad)/i.test(html);
}

export function hasCookieConsentBanner(html) {
  return /(consentimiento de cookies|cookie banner|aceptar cookies|this site uses cookies)/i.test(html);
}

const ANALYTICS_MARKERS = ["gtag(", "google-analytics", "googletagmanager", "fbq(", "facebook pixel"];
const CHAT_WIDGET_MARKERS = ["intercom", "tawk.to", "crisp.chat", "wa.me", "whatsapp"];

export function detectAnalyticsMarkers(html) {
  const lower = html.toLowerCase();
  return ANALYTICS_MARKERS.filter((marker) => lower.includes(marker));
}

export function detectChatWidgetMarkers(html) {
  const lower = html.toLowerCase();
  return CHAT_WIDGET_MARKERS.filter((marker) => lower.includes(marker));
}

const CTA_KEYWORDS = /\b(reserva ahora|pide cita|contáctanos|llámanos|solicita información|book now|contact us|get a quote|empieza ahora)\b/gi;

export function countCtaKeywords(html) {
  const text = stripTags(html);
  const matches = text.match(CTA_KEYWORDS);
  return matches ? matches.length : 0;
}

export function hasNavElement(html) {
  return /<nav\b/i.test(html) || /<header\b[\s\S]*<\/header>/i.test(html);
}

export function hasHreflangOrLanguageSwitcher(html) {
  return /<link[^>]+hreflang=/i.test(html) || /\b(idioma|language|en \| es|es \| en)\b/i.test(html);
}

export function countRequiredFormFields(html) {
  const matches = html.match(/<(input|select|textarea)\b[^>]*\brequired\b[^>]*>/gi);
  return matches ? matches.length : 0;
}

export { stripTags };
