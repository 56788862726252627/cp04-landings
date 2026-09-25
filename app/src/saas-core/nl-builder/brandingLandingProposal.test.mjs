import { test } from "node:test";
import assert from "node:assert/strict";

import { buildBrandingProposal, buildLandingProposal, buildPwaProposal } from "./brandingLandingProposal.js";
import { meetsWcagAA } from "../factory/brandingEngine.js";
import { getSectorPresetById } from "./sectorLexicon.js";

const dental = getSectorPresetById("dental");
const business = { proposedName: "Sonrisas Demo Málaga", sector: "dental" };

test("buildBrandingProposal produce un slug kebab-case estable a partir del nombre", () => {
  const branding = buildBrandingProposal({ business, sectorPreset: dental });
  assert.equal(branding.slug, "sonrisas-demo-malaga");
});

test("todo color de acento propuesto pasa WCAG AA contra el fondo por defecto", () => {
  const branding = buildBrandingProposal({ business, sectorPreset: dental });
  assert.ok(meetsWcagAA(branding.palette.accent, branding.palette.bg), `${branding.palette.accent} no cumple AA contra ${branding.palette.bg}`);
});

test("los 10 sectores producen siempre un acento con contraste AA válido (nunca se propone un color sin validar)", () => {
  const sectorIds = ["padel-sports", "dental", "physiotherapy", "veterinary", "hair-beauty", "law", "restaurant", "education", "automotive", "real-estate"];
  for (const id of sectorIds) {
    const preset = getSectorPresetById(id);
    const branding = buildBrandingProposal({ business, sectorPreset: preset });
    assert.ok(meetsWcagAA(branding.palette.accent, branding.palette.bg), `sector ${id}: acento ${branding.palette.accent} no cumple AA`);
  }
});

test("iconManifest nunca reclama haber generado binarios reales", () => {
  const branding = buildBrandingProposal({ business, sectorPreset: dental });
  assert.match(branding.iconManifest.note, /ningún binario/i);
  assert.ok(branding.iconManifest.sizesPx.length > 0);
});

test("buildLandingProposal incluye las secciones mínimas requeridas y testimonios etiquetados como demo", () => {
  const landing = buildLandingProposal({ business, sectorPreset: dental });
  for (const section of ["header", "hero", "valueProp", "benefits", "services", "howItWorks", "testimonials", "faq", "cta", "contact", "footer", "privacyPlaceholder"]) {
    assert.ok(landing.sectionsEnabled.includes(section), `falta la sección "${section}"`);
  }
  for (const testimonial of landing.testimonials) {
    assert.equal(testimonial.isDemo, true);
  }
});

test("buildPwaProposal deriva themeColor del acento de branding y declara compatibilidad multiplataforma", () => {
  const branding = buildBrandingProposal({ business, sectorPreset: dental });
  const pwa = buildPwaProposal({ business, brandingProposal: branding });
  assert.equal(pwa.themeColor, branding.palette.accent);
  assert.equal(pwa.compatibility.android, true);
  assert.equal(pwa.compatibility.ios, true);
});

test("determinista: misma entrada produce la misma propuesta", () => {
  const a = buildBrandingProposal({ business, sectorPreset: dental });
  const b = buildBrandingProposal({ business, sectorPreset: dental });
  assert.deepEqual(a, b);
});
