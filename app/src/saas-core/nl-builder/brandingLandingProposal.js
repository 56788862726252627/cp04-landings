// Paso 11 · Fase 10 — Propuesta inicial de branding, landing y PWA.
//
// Genera una propuesta DECLARATIVA a partir del Business Intent: nunca
// produce binarios (ver brandingEngine.js de Paso 10 para el contrato de
// esos assets, que este módulo referencia sin duplicar). Los colores
// candidatos por sector se validan siempre con el mismo verificador de
// contraste WCAG AA de Paso 10 (`meetsWcagAA`) antes de proponerse: si un
// color de acento no pasa el contraste, se descarta a favor del valor por
// defecto seguro (nunca se propone un color sin comprobar).

import { meetsWcagAA, ICON_SIZES_PX, PENDING_BINARY_ASSETS } from "../factory/brandingEngine.js";
import { slugify } from "../../../tenant-cli/lib/tenantProvisioning.mjs";

const SAFE_DEFAULT_ACCENT = "#1d4e89";
const SAFE_TEXT = "#0c1420";
const SAFE_BG = "#ffffff";

// Acentos candidatos por sector (solo sugerencia visual, no identidad real de
// ningún negocio). Cada uno se valida contra SAFE_BG antes de usarse (ver
// brandingLandingProposal.test.mjs); si falla, se descarta silenciosamente a
// favor de SAFE_DEFAULT_ACCENT, que también cumple AA por construcción.
const SECTOR_ACCENT_HINTS = Object.freeze({
  "padel-sports": "#146c43",
  dental: "#0b6e6e",
  physiotherapy: "#1f7a34",
  veterinary: "#a85a13",
  "hair-beauty": "#a6336b",
  law: "#1f3a63",
  restaurant: "#b23b2e",
  education: "#3a5bd9",
  automotive: "#4a4f57",
  "real-estate": "#8a6d1f",
});

const TONE_BY_SECTOR = Object.freeze({
  "padel-sports": "enérgico-cercano",
  dental: "cercano-profesional",
  physiotherapy: "cercano-profesional",
  veterinary: "cercano-cálido",
  "hair-beauty": "moderno-cercano",
  law: "formal-institucional",
  restaurant: "cálido-acogedor",
  education: "cercano-motivador",
  automotive: "directo-confiable",
  "real-estate": "profesional-confiable",
});

function pickAccent(presetId) {
  const candidate = SECTOR_ACCENT_HINTS[presetId];
  if (candidate && meetsWcagAA(candidate, SAFE_BG)) return candidate;
  return SAFE_DEFAULT_ACCENT;
}

/**
 * @param {{proposedName: string, sector: string}} business
 * @param {object} sectorPreset preset de sectorLexicon.js
 * @returns {object} branding declarativo compatible con Business Intent (business.branding)
 */
export function buildBrandingProposal({ business, sectorPreset }) {
  const slug = slugify(business.proposedName) || "negocio-sin-nombre";
  const accent = pickAccent(sectorPreset.presetId);
  const tone = TONE_BY_SECTOR[sectorPreset.presetId] || "profesional-neutro";

  return {
    proposedName: business.proposedName,
    slug,
    tagline: `${sectorPreset.label} — gestión digital sencilla`,
    tone,
    palette: {
      primary: SAFE_DEFAULT_ACCENT,
      accent,
      bg: SAFE_BG,
      text: SAFE_TEXT,
      contrastCheckedAgainstWcagAA: true,
    },
    fonts: { display: "'Inter', sans-serif", body: "'Inter', sans-serif" },
    style: "moderno-minimalista",
    iconManifest: {
      note: "Ningún binario generado en este paso; contrato de Paso 10 (brandingEngine.js) reutilizado tal cual.",
      sizesPx: ICON_SIZES_PX,
      pendingAssets: PENDING_BINARY_ASSETS.map((a) => a.id),
    },
    faviconRef: null,
    logoRef: null,
  };
}

const SECTION_LABELS_BY_TIER = Object.freeze(["header", "hero", "valueProp", "benefits", "services", "howItWorks", "testimonials", "faq", "cta", "contact", "footer", "privacyPlaceholder"]);

/**
 * @param {{proposedName: string}} business
 * @param {object} sectorPreset
 * @returns {object} landing declarativo compatible con Business Intent (business.landing)
 */
export function buildLandingProposal({ business, sectorPreset }) {
  return {
    sectionsEnabled: [...SECTION_LABELS_BY_TIER],
    ctaLabel: "Solicitar una demostración",
    ctaHref: "#contacto",
    navigation: ["Inicio", "Servicios", "Cómo funciona", "Preguntas frecuentes", "Contacto"],
    testimonials: [
      { name: "Cliente demo 1", quote: `Muy contento con la gestión de ${sectorPreset.label.toLowerCase()}.`, isDemo: true },
      { name: "Cliente demo 2", quote: "El proceso de reserva es mucho más rápido ahora.", isDemo: true },
    ],
    faq: [
      { question: `¿Qué incluye la solución de ${business.proposedName} para ${sectorPreset.label.toLowerCase()}?`, answer: "Gestión de citas, clientes y automatizaciones básicas, ampliable según el plan." },
      { question: "¿Los datos mostrados son reales?", answer: "No. Todos los datos de demostración son ficticios y están etiquetados como tal." },
    ],
    privacyPlaceholder: "Aviso de privacidad y términos: placeholder pendiente de revisión legal antes de producción.",
  };
}

/**
 * @param {object} brandingProposal salida de buildBrandingProposal
 * @param {{proposedName: string}} business
 * @returns {object} pwa declarativo compatible con Business Intent (business.pwa)
 */
export function buildPwaProposal({ business, brandingProposal }) {
  return {
    shortName: business.proposedName.slice(0, 24),
    themeColor: brandingProposal.palette.accent,
    backgroundColor: brandingProposal.palette.bg,
    display: "standalone",
    orientation: "portrait",
    startUrl: "/",
    compatibility: {
      mobile: true,
      tablet: true,
      desktop: true,
      android: true,
      ios: true,
      modernBrowsers: true,
    },
  };
}
