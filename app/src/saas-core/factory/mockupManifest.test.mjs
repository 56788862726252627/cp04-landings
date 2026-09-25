import { test } from "node:test";
import assert from "node:assert/strict";

import { buildMockupManifest, VIEWPORT_PRESETS, DEMO_ROUTES } from "./mockupManifest.js";

test("buildMockupManifest genera una entrada por combinación ruta x viewport", () => {
  const manifest = buildMockupManifest({ businessId: "demo-negocio" });
  assert.equal(manifest.entries.length, DEMO_ROUTES.length * Object.keys(VIEWPORT_PRESETS).length);
});

test("los nombres de mockup son estables (deterministas) entre dos llamadas", () => {
  const a = buildMockupManifest({ businessId: "demo-negocio" });
  const b = buildMockupManifest({ businessId: "demo-negocio" });
  assert.deepEqual(a.entries.map((e) => e.name), b.entries.map((e) => e.name));
});

test("ninguna entrada se marca como capturada (no se toma ninguna captura real en este paso)", () => {
  const manifest = buildMockupManifest({ businessId: "demo-negocio" });
  assert.ok(manifest.entries.every((e) => e.captured === false));
});

test("incluye los 4 breakpoints pedidos: móvil, tablet, portátil, escritorio", () => {
  assert.deepEqual(Object.keys(VIEWPORT_PRESETS).sort(), ["desktop", "laptop", "mobile", "tablet"]);
});

test("buildMockupManifest acepta un subconjunto de viewports", () => {
  const manifest = buildMockupManifest({ businessId: "demo-negocio", viewports: ["mobile"] });
  assert.ok(manifest.entries.every((e) => e.viewport.id === "mobile"));
});
