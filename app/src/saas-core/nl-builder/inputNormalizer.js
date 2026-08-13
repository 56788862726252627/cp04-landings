// Paso 11 · Fase 3.A — Input normalizer.
//
// Limpia y clasifica el texto de entrada ANTES de cualquier extracción de
// intención. No decide módulos ni sector con precisión fina (eso es
// intentExtractor.js) — aquí solo se resuelven señales de bajo nivel:
// idioma, país/moneda/zona horaria por defecto, canales, plataformas y
// restricciones explícitas ("sin Stripe", "no usar WhatsApp").

export const MAX_INPUT_LENGTH = 8000;

const ENGLISH_MARKERS = ["create a saas", "for a", "with", "and", "clinic", "business", "please", "reminders", "bookings"];
const SPANISH_MARKERS = ["crea un", "para una", "para un", "con", "clínica", "negocio", "reservas", "recordatorios"];

const CITY_TIMEZONE = Object.freeze({
  málaga: { country: "ES", currency: "EUR", timezone: "Europe/Madrid" },
  malaga: { country: "ES", currency: "EUR", timezone: "Europe/Madrid" },
  madrid: { country: "ES", currency: "EUR", timezone: "Europe/Madrid" },
  barcelona: { country: "ES", currency: "EUR", timezone: "Europe/Madrid" },
  sevilla: { country: "ES", currency: "EUR", timezone: "Europe/Madrid" },
  valencia: { country: "ES", currency: "EUR", timezone: "Europe/Madrid" },
  granada: { country: "ES", currency: "EUR", timezone: "Europe/Madrid" },
  london: { country: "GB", currency: "GBP", timezone: "Europe/London" },
  "new york": { country: "US", currency: "USD", timezone: "America/New_York" },
});

const CHANNEL_KEYWORDS = Object.freeze({
  web: ["web", "página web", "landing", "website"],
  whatsapp: ["whatsapp"],
  app: ["app móvil", "aplicación móvil", "mobile app", "pwa"],
  telefono: ["teléfono", "llamada telefónica", "phone"],
  presencial: ["presencial", "en persona", "in person", "walk-in"],
});

const PLATFORM_KEYWORDS = Object.freeze({
  pwa: ["pwa", "progressive web app"],
  movil: ["móvil", "mobile"],
  tablet: ["tablet", "tableta"],
  escritorio: ["escritorio", "desktop", "portátil", "ordenador"],
});

const RESTRICTION_PATTERNS = Object.freeze([
  { id: "no_stripe", pattern: /\bsin\s+(conectar\s+)?stripe\b/i },
  { id: "no_whatsapp", pattern: /\bsin\s+whatsapp\b/i },
  { id: "no_pagos_online", pattern: /\bsin\s+pagos?\s+online\b/i },
  { id: "no_publicidad", pattern: /\bsin\s+(publicidad|marketing)\b/i },
]);

function collapseWhitespace(text) {
  return text.replace(/\s+/g, " ").trim();
}

function detectLanguage(lowerText) {
  const esScore = SPANISH_MARKERS.reduce((acc, kw) => (lowerText.includes(kw) ? acc + 1 : acc), 0);
  const enScore = ENGLISH_MARKERS.reduce((acc, kw) => (lowerText.includes(kw) ? acc + 1 : acc), 0);
  if (/[áéíóúñ¿¡]/i.test(lowerText)) return "es";
  return enScore > esScore ? "en" : "es";
}

function detectCity(text) {
  const esMatch = text.match(/\bde\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ]*(?:\s+[A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ]*)?)\b/);
  if (esMatch) return esMatch[1];
  const enMatch = text.match(/\bin\s+([A-Z][\w]*(?:\s+[A-Z][\w]*)?)\b/);
  if (enMatch) return enMatch[1];
  return null;
}

function detectByKeywordMap(lowerText, map) {
  const found = [];
  for (const [id, keywords] of Object.entries(map)) {
    if (keywords.some((kw) => lowerText.includes(kw))) found.push(id);
  }
  return found;
}

/**
 * Normaliza texto libre de entrada. Nunca lanza: entrada vacía o
 * extremadamente larga se maneja de forma segura (truncado + nota), nunca
 * como excepción no controlada.
 * @param {string} rawText
 */
export function normalizeInput(rawText) {
  const original = typeof rawText === "string" ? rawText : "";
  const truncated = original.length > MAX_INPUT_LENGTH;
  const bounded = truncated ? original.slice(0, MAX_INPUT_LENGTH) : original;
  const cleanedText = collapseWhitespace(bounded);
  const lowerText = cleanedText.toLowerCase();

  const language = cleanedText.length === 0 ? "es" : detectLanguage(lowerText);
  const city = detectCity(cleanedText);
  const cityKey = city ? city.toLowerCase() : null;
  const geo = (cityKey && CITY_TIMEZONE[cityKey]) || { country: "ES", currency: "EUR", timezone: "Europe/Madrid" };

  const channels = detectByKeywordMap(lowerText, CHANNEL_KEYWORDS);
  const platforms = detectByKeywordMap(lowerText, PLATFORM_KEYWORDS);
  const restrictions = RESTRICTION_PATTERNS.filter((r) => r.pattern.test(cleanedText)).map((r) => r.id);

  return {
    originalText: original,
    cleanedText,
    lowerText,
    isEmpty: cleanedText.length === 0,
    truncated,
    language,
    detectedCity: city,
    country: geo.country,
    currency: geo.currency,
    timezone: geo.timezone,
    channels,
    platforms,
    restrictions,
  };
}
