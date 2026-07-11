import { test } from "node:test";
import assert from "node:assert/strict";
import { getRuntimeFeatureFlags, resolveRuntimeFeatureCascade } from "./getRuntimeFeatureFlags.js";
import { loadResolvedRuntimeConfig } from "./loadResolvedRuntimeConfig.js";
import { repoPath } from "../config/paths.js";

test("getRuntimeFeatureFlags: lanza sin resolvedConfig.features", () => {
  assert.throws(() => getRuntimeFeatureFlags({}), /requiere un resolvedConfig ya resuelto/);
});

test("getRuntimeFeatureFlags: expone features + degraded de Club Pádel 04 (cascada CORE<VERTICAL<CLIENT ya aplicada)", () => {
  const { resolvedConfig } = loadResolvedRuntimeConfig({ clientSource: repoPath("config", "client-config.example.valid.json") });
  const result = getRuntimeFeatureFlags(resolvedConfig);
  // torneos/ranking: OFF en CORE, ON en VERTICAL padel, sin override en CLIENT -> ON (gana VERTICAL_DEFAULT)
  assert.equal(result.features.torneos, true);
  assert.equal(result.features.ranking, true);
  // pagos: forzado false en las 3 capas (const:false en schema, ya probado en loadResolvedRuntimeConfig.test.mjs)
  assert.equal(result.features.pagos, false);
  assert.deepEqual(result.degraded, []);
});

test("resolveRuntimeFeatureCascade: CLIENT_OVERRIDE gana sobre VERTICAL_DEFAULT y GLOBAL_DEFAULT", () => {
  const core = { featureDefaults: { torneos: false } };
  const vertical = { featureOverrides: { torneos: true } };
  const clientOverridesOff = { features: { torneos: false } };
  const clientNoOverride = { features: {} };

  assert.equal(resolveRuntimeFeatureCascade(core, vertical, clientNoOverride).features.torneos, true, "gana VERTICAL_DEFAULT sin CLIENT_OVERRIDE");
  assert.equal(resolveRuntimeFeatureCascade(core, vertical, clientOverridesOff).features.torneos, false, "CLIENT_OVERRIDE gana sobre VERTICAL_DEFAULT");
});

// Fase 4: dependencias de "foundations" de integración. Estas no son
// features reales de config/core-config.default.json hoy (no se activa
// ningún servicio) — son un catálogo SINTÉTICO que prueba que el motor
// genérico de resolveFeatureFlags degrada correctamente estas relaciones
// nombradas en la misión, para cuando existan de verdad.
function foundationsCore(overrides = {}) {
  return {
    featureDefaults: {
      payments: false,
      stripe: false,
      messaging: false,
      whatsapp: false,
      ranking: false,
      tournaments: false,
      observability: false,
      analytics: false,
      ...overrides,
    },
    featureDependencies: {
      stripe: ["payments"],
      whatsapp: ["messaging"],
      tournaments: ["ranking"],
      analytics: ["observability"],
    },
  };
}

test("Fase 4 — stripe requires payments foundation: stripe ON con payments OFF se degrada a OFF", () => {
  const core = foundationsCore({ stripe: true, payments: false });
  const { features, degraded } = resolveRuntimeFeatureCascade(core, {}, {});
  assert.equal(features.stripe, false);
  assert.ok(degraded.some((d) => d.feature === "stripe" && d.missingDependencies.includes("payments")));
});

test("Fase 4 — stripe requires payments foundation: stripe ON con payments ON se mantiene ON", () => {
  const core = foundationsCore({ stripe: true, payments: true });
  const { features, degraded } = resolveRuntimeFeatureCascade(core, {}, {});
  assert.equal(features.stripe, true);
  assert.deepEqual(degraded, []);
});

test("Fase 4 — whatsapp requires messaging foundation: whatsapp ON con messaging OFF se degrada a OFF", () => {
  const core = foundationsCore({ whatsapp: true, messaging: false });
  const { features } = resolveRuntimeFeatureCascade(core, {}, {});
  assert.equal(features.whatsapp, false);
});

test("Fase 4 — tournaments may require rankings: tournaments ON con ranking OFF se degrada a OFF", () => {
  const core = foundationsCore({ tournaments: true, ranking: false });
  const { features } = resolveRuntimeFeatureCascade(core, {}, {});
  assert.equal(features.tournaments, false);
});

test("Fase 4 — advanced analytics requires observability: analytics ON con observability OFF se degrada a OFF", () => {
  const core = foundationsCore({ analytics: true, observability: false });
  const { features } = resolveRuntimeFeatureCascade(core, {}, {});
  assert.equal(features.analytics, false);
});

test("Fase 4 — ninguna dependencia activa un servicio real: el motor solo apaga, nunca enciende", () => {
  const core = foundationsCore({ stripe: false, payments: true });
  const { features } = resolveRuntimeFeatureCascade(core, {}, {});
  assert.equal(features.stripe, false, "payments=true no enciende stripe por sí solo");
});
