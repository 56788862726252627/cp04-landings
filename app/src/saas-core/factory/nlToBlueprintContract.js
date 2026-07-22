// Paso 10 · Fase 15 — Contrato de conversión instrucción natural → Business Blueprint.
//
// NO implementa un modelo de lenguaje real: `draftBlueprintFromInstruction`
// es una extracción determinista por palabras clave (keyword matching), útil
// para demostrar la FORMA del contrato y dejar preparado el punto donde un
// LLM real conectaría en un paso futuro (ver extensionPoints.js si se quiere
// modelar como proveedor). Nunca debe presentarse como comprensión de
// lenguaje natural real.

import { KNOWN_SECTORS } from "../tenant/tenantSchema.js";

const SECTOR_KEYWORDS = Object.freeze({
  dental: ["dental", "dentista", "odont"],
  physiotherapy: ["fisioterapia", "fisioterapeuta", "fisio"],
  "speech-therapy": ["logopedia", "logopeda"],
  psychology: ["psicolog", "psicoterapia"],
  law: ["abogad", "despacho de abogados", "jurídic", "legal"],
  fertility: ["fertilidad", "reproducción asistida"],
  "hair-salon": ["peluquería", "peluquero"],
  beauty: ["estética", "salón de belleza", "centro de estética"],
  veterinary: ["veterinari"],
  padel: ["pádel", "padel"],
  sports: ["club deportivo", "polideportivo"],
  "generic-local-service": [],
});

const NUMBER_WORDS = Object.freeze({ un: 1, una: 1, dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, siete: 7, ocho: 8 });

function detectSector(text) {
  const lower = text.toLowerCase();
  for (const [sector, keywords] of Object.entries(SECTOR_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) return sector;
  }
  return null;
}

function detectCity(text) {
  const match = text.match(/\bde\s+([A-ZÁÉÍÓÚÑ][\wÁÉÍÓÚÑáéíóúñ]+)\b/);
  return match ? match[1] : null;
}

function detectProfessionalCount(text) {
  const lower = text.toLowerCase();
  const digitMatch = lower.match(/\b(\d+)\s+(dentistas|odont[oó]logos|fisioterapeutas|profesionales|abogados|veterinarios|peluqueros|especialistas)\b/);
  if (digitMatch) return parseInt(digitMatch[1], 10);
  for (const [word, value] of Object.entries(NUMBER_WORDS)) {
    if (new RegExp(`\\b${word}\\s+(dentistas|odont[oó]logos|fisioterapeutas|profesionales|abogados|veterinarios|peluqueros|especialistas)\\b`).test(lower)) {
      return value;
    }
  }
  return null;
}

const FEATURE_KEYWORDS = Object.freeze({
  agenda: ["agenda", "citas", "reservas"],
  recordatorios: ["recordatorio"],
  formularios: ["formulario"],
  landing: ["landing", "página web", "web"],
  pwa: ["pwa", "app móvil", "aplicación móvil"],
  brandingPremium: ["branding premium", "marca premium", "diseño premium"],
});

function detectFeatures(text) {
  const lower = text.toLowerCase();
  const found = [];
  for (const [feature, keywords] of Object.entries(FEATURE_KEYWORDS)) {
    if (keywords.some((kw) => lower.includes(kw))) found.push(feature);
  }
  return found;
}

/**
 * Extrae un Business Blueprint PARCIAL de una instrucción en lenguaje
 * natural, mediante coincidencia de palabras clave (NO un LLM). Devuelve
 * también `missingFields` (lo que SIEMPRE requiere confirmación humana o un
 * LLM real) y `confidence` (heurística simple, no una probabilidad
 * calibrada).
 * @param {string} instruction
 */
export function draftBlueprintFromInstruction(instruction) {
  const text = String(instruction || "");
  const sector = detectSector(text);
  const city = detectCity(text);
  const professionalCount = detectProfessionalCount(text);
  const features = detectFeatures(text);

  const partial = {
    sector: sector || undefined,
    country: "ES",
    locale: "es-ES",
    currencies: ["EUR"],
    publicInfo: city ? { address: { city } } : undefined,
    professionals: professionalCount ? Array.from({ length: professionalCount }, (_, i) => ({ name: `Profesional ${i + 1} (a confirmar)`, role: "" })) : undefined,
    landingPage: features.includes("landing") ? {} : undefined,
    pwa: features.includes("pwa") ? {} : undefined,
    manualSteps: ["Confirmar todos los campos extraídos automáticamente antes de generar el negocio (extracción por palabras clave, no NLU real)"],
  };

  const missingFields = ["businessId", "tenantId", "commercialName", "plan", "timezone"];
  if (!sector) missingFields.push("sector");

  const detectedSignals = [
    sector ? `sector:${sector}` : null,
    city ? `ciudad:${city}` : null,
    professionalCount ? `profesionales:${professionalCount}` : null,
    ...features.map((f) => `feature:${f}`),
  ].filter(Boolean);

  return {
    partialBlueprint: partial,
    missingFields,
    confidence: sector && detectedSignals.length >= 3 ? "media" : "baja",
    method: "keyword_matching_v1",
    isRealLanguageUnderstanding: false,
    rawInstruction: text,
    detectedSignals,
  };
}

export { SECTOR_KEYWORDS, KNOWN_SECTORS };
