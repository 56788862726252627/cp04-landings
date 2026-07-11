import { test } from "node:test";
import assert from "node:assert/strict";
import { getRuntimeBranding } from "./getRuntimeBranding.js";
import { loadResolvedRuntimeConfig } from "./loadResolvedRuntimeConfig.js";
import { repoPath } from "../config/paths.js";

test("getRuntimeBranding: lanza sin resolvedConfig.brand", () => {
  assert.throws(() => getRuntimeBranding({}), /requiere resolvedConfig.brand/);
});

test("getRuntimeBranding: Club Pádel 04 expone acentos, nombre, contacto, locale y timezone reales", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") });
  const branding = getRuntimeBranding(resolvedConfig);
  assert.equal(branding.clubName, "Club Pádel 04");
  assert.equal(branding.primaryAccent, "#b6ff00");
  assert.equal(branding.secondaryAccent, "#20e3b2");
  assert.equal(branding.locale.language, "es-ES");
  assert.equal(branding.timezone, "Europe/Madrid");
  assert.equal(branding.contact.email, "info@clubpadel04.example");
});

test("getRuntimeBranding: sin theme (fail-safe) no fabrica acentos — quedan null en vez de un valor inventado", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({
    clientSource: repoPath("fixtures", "tenant-config", "invalid-cross-tenant-reference.client-config.json"),
  });
  const branding = getRuntimeBranding(resolvedConfig);
  assert.equal(branding.primaryAccent, null);
  assert.equal(branding.secondaryAccent, null);
  assert.equal(branding.theme, null);
});

test("getRuntimeBranding: logo/favicon ausentes quedan null, nunca un placeholder inventado", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") });
  const branding = getRuntimeBranding(resolvedConfig);
  assert.equal(branding.logo, null);
  assert.equal(branding.favicon, null);
  assert.deepEqual(branding.backgroundAssets, []);
});

test("getRuntimeBranding: legalLinks siempre presente y null — campo pendiente en client-config.schema.json v1 (ver CLIENT_CONFIG_SCHEMA_GUIDE.md), nunca inventado", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") });
  const branding = getRuntimeBranding(resolvedConfig);
  assert.equal(branding.legalLinks, null);
  assert.ok("legalLinks" in branding, "la clave debe existir explícitamente, no solo estar ausente");
});
