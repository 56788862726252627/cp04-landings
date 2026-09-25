import { test } from "node:test";
import assert from "node:assert/strict";

import {
  resolveBrandTokens,
  tokensToCssVariables,
  relativeLuminance,
  contrastRatio,
  meetsWcagAA,
  buildPendingAssetsManifest,
  ICON_SIZES_PX,
  PENDING_BINARY_ASSETS,
} from "./brandingEngine.js";

test("resolveBrandTokens sin branding produce tokens seguros por defecto", () => {
  const tokens = resolveBrandTokens();
  assert.equal(tokens.colors.primary, "#2f6bff");
  assert.equal(tokens.fallbackApplied.colors.includes("primary"), true);
});

test("resolveBrandTokens respeta colores explícitos y no los marca como fallback", () => {
  const tokens = resolveBrandTokens({ colors: { primary: "#1c6fd6" } });
  assert.equal(tokens.colors.primary, "#1c6fd6");
  assert.equal(tokens.fallbackApplied.colors.includes("primary"), false);
  assert.equal(tokens.fallbackApplied.colors.includes("accent"), true);
});

test("contrastRatio(negro, blanco) es 21:1 (máximo posible)", () => {
  assert.ok(Math.abs(contrastRatio("#000000", "#ffffff") - 21) < 0.01);
});

test("contrastRatio de un color contra sí mismo es 1:1", () => {
  assert.ok(Math.abs(contrastRatio("#2f6bff", "#2f6bff") - 1) < 0.001);
});

test("meetsWcagAA es true para negro/blanco y false para grises muy próximos", () => {
  assert.equal(meetsWcagAA("#000000", "#ffffff"), true);
  assert.equal(meetsWcagAA("#888888", "#8a8a8a"), false);
});

test("relativeLuminance(#ffffff) es 1, relativeLuminance(#000000) es 0", () => {
  assert.ok(Math.abs(relativeLuminance("#ffffff") - 1) < 0.001);
  assert.ok(Math.abs(relativeLuminance("#000000") - 0) < 0.001);
});

test("resolveBrandTokens detecta un par de contraste insuficiente", () => {
  const tokens = resolveBrandTokens({ colors: { text: "#eeeeee", bg: "#ffffff" } });
  assert.equal(tokens.contrast.allPassAA, false);
  assert.ok(tokens.contrast.failing.some((f) => f.pair === "text_on_bg"));
});

test("tokensToCssVariables produce un bloque :root con todas las claves de color", () => {
  const tokens = resolveBrandTokens({ colors: { primary: "#123456" } });
  const css = tokensToCssVariables(tokens);
  assert.match(css, /:root \{/);
  assert.match(css, /--color-primary: #123456;/);
  assert.match(css, /--font-display:/);
  assert.match(css, /--radius-md:/);
});

test("buildPendingAssetsManifest incluye los 13 tamaños de icono pedidos y ningún binario generado", () => {
  const manifest = buildPendingAssetsManifest({ businessId: "demo" });
  assert.equal(ICON_SIZES_PX.length, 13);
  assert.ok([16, 32, 48, 72, 96, 128, 144, 152, 180, 192, 256, 384, 512].every((s) => ICON_SIZES_PX.includes(s)));
  assert.ok(manifest.assets.every((a) => a.status === "not_implemented"));
  assert.equal(manifest.businessId, "demo");
});

test("PENDING_BINARY_ASSETS incluye favicon, apple-touch-icon y maskable icons", () => {
  const ids = PENDING_BINARY_ASSETS.map((a) => a.id);
  assert.ok(ids.includes("favicon_ico"));
  assert.ok(ids.includes("apple_touch_icon"));
  assert.ok(ids.includes("maskable_icon_192"));
  assert.ok(ids.includes("maskable_icon_512"));
  assert.ok(ids.includes("manifest_webmanifest"));
});
