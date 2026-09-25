import { test } from "node:test";
import assert from "node:assert/strict";

import { buildLandingConfig, renderLandingHtml } from "./landingGenerator.js";
import { resolveBrandTokens } from "./brandingEngine.js";
import { FULL_BUSINESS_BLUEPRINT } from "./businessBlueprintExamples.js";
import { buildTerminology } from "../terminology/terminology.js";

const { dictionary: terminology } = buildTerminology(FULL_BUSINESS_BLUEPRINT.branding ? {} : {});

test("buildLandingConfig incluye todas las secciones mínimas requeridas", () => {
  const cfg = buildLandingConfig(FULL_BUSINESS_BLUEPRINT, terminology);
  const required = ["header", "hero", "valueProposition", "benefits", "services", "howItWorks", "testimonials", "faq", "cta", "contact", "footer"];
  for (const section of required) assert.ok(cfg.sectionsEnabled.includes(section), `falta sección ${section}`);
});

test("los testimonios siempre están marcados como demo, nunca implican ser reales", () => {
  const cfg = buildLandingConfig(FULL_BUSINESS_BLUEPRINT, terminology);
  assert.ok(cfg.testimonials.items.length > 0);
  assert.ok(cfg.testimonials.items.every((t) => t.isDemoData === true));
  assert.match(cfg.testimonials.demoNotice, /demostración/);
});

test("el footer incluye placeholders de privacidad/términos explícitamente marcados como pendientes de revisión", () => {
  const cfg = buildLandingConfig(FULL_BUSINESS_BLUEPRINT, terminology);
  assert.match(cfg.footer.privacyPlaceholder, /pendiente de revisión legal/);
});

test("robots meta es noindex,nofollow por defecto (no se publica nada real)", () => {
  const cfg = buildLandingConfig(FULL_BUSINESS_BLUEPRINT, terminology);
  assert.equal(cfg.meta.robots, "noindex,nofollow");
});

test("renderLandingHtml produce el mismo HTML para el mismo input (reutilizable, no aleatorio)", () => {
  const cfg = buildLandingConfig(FULL_BUSINESS_BLUEPRINT, terminology);
  const tokens = resolveBrandTokens(FULL_BUSINESS_BLUEPRINT.branding);
  const htmlA = renderLandingHtml(cfg, tokens);
  const htmlB = renderLandingHtml(cfg, tokens);
  assert.equal(htmlA, htmlB);
  assert.match(htmlA, /<!doctype html>/);
  assert.match(htmlA, new RegExp(FULL_BUSINESS_BLUEPRINT.commercialName));
});

test("renderLandingHtml escapa HTML de entradas del blueprint (sin XSS)", () => {
  const malicious = { ...FULL_BUSINESS_BLUEPRINT, commercialName: '<script>alert(1)</script>' };
  const cfg = buildLandingConfig(malicious, terminology);
  const tokens = resolveBrandTokens(malicious.branding);
  const html = renderLandingHtml(cfg, tokens);
  assert.doesNotMatch(html, /<script>alert\(1\)<\/script>/);
  assert.match(html, /&lt;script&gt;/);
});

test("un solo renderer sirve para dos negocios distintos (reutilizable, sin duplicar código)", () => {
  const otherBlueprint = { ...FULL_BUSINESS_BLUEPRINT, businessId: "otro-negocio", tenantId: "otro-negocio", commercialName: "Otro Negocio Demo" };
  const cfgA = buildLandingConfig(FULL_BUSINESS_BLUEPRINT, terminology);
  const cfgB = buildLandingConfig(otherBlueprint, terminology);
  const tokens = resolveBrandTokens();
  const htmlA = renderLandingHtml(cfgA, tokens);
  const htmlB = renderLandingHtml(cfgB, tokens);
  assert.notEqual(htmlA, htmlB);
  assert.match(htmlB, /Otro Negocio Demo/);
});
