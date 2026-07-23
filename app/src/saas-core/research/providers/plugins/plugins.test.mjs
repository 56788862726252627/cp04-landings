import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { createProviderRegistry, discoverAndRegisterPlugins } from "../core/providerRegistry.js";
import { DIMENSION_IDS } from "../../dimensionRegistry.js";

// Paso 16 — seoProvider dejó de ser stub. Paso 17 — accessibilityProvider
// dejó de ser stub (ver plugins/accessibilityProviderPlugin.js): 10
// stubs siguen pendientes.
const STUB_PLUGIN_MODULES = [
  "lighthouseProviderPlugin.js",
  "performanceProviderPlugin.js",
  "socialProviderPlugin.js",
  "schemaProviderPlugin.js",
  "technologyProviderPlugin.js",
  "securityHeadersProviderPlugin.js",
  "dnsProviderPlugin.js",
  "whoisProviderPlugin.js",
  "speedProviderPlugin.js",
  "aiContentProviderPlugin.js",
];

test("existen exactamente los 10 módulos de proveedores stub restantes (Fase 3 de Paso 14, tras convertir seoProvider en Paso 16 y accessibilityProvider en Paso 17 en reales)", async () => {
  for (const file of STUB_PLUGIN_MODULES) {
    const mod = await import(`./${file}`);
    assert.ok(mod.PROVIDER, `${file} debe exportar PROVIDER`);
  }
});

test("cada proveedor stub restante declara status='stub', capabilities con dimensiones válidas (o '*'), y un collect() que nunca lanza", async () => {
  for (const file of STUB_PLUGIN_MODULES) {
    const { PROVIDER } = await import(`./${file}`);
    assert.equal(PROVIDER.status, "stub", file);
    for (const dim of PROVIDER.capabilities.dimensions) {
      if (dim !== "*") assert.ok(DIMENSION_IDS.includes(dim), `${file} declara una dimensión desconocida: ${dim}`);
    }
    const result = await PROVIDER.collect({}, {});
    assert.equal(result.status, "not_implemented", file);
  }
});

test("cada proveedor stub restante tiene un id único (sin colisiones entre los 10)", async () => {
  const ids = new Set();
  for (const file of STUB_PLUGIN_MODULES) {
    const { PROVIDER } = await import(`./${file}`);
    assert.ok(!ids.has(PROVIDER.id), `id duplicado: ${PROVIDER.id}`);
    ids.add(PROVIDER.id);
  }
  assert.equal(ids.size, 10);
});

test("discoverAndRegisterPlugins carga automáticamente los 13 proveedores (10 stub + 3 real: publicWebsiteFetcher, seoProvider y accessibilityProvider) desde el directorio real de plugins, sin listarlos a mano", async () => {
  const registry = createProviderRegistry();
  const pluginsDir = path.resolve("src/saas-core/research/providers/plugins");
  const { loaded, errors } = await discoverAndRegisterPlugins(registry, pluginsDir);
  assert.deepEqual(errors, [], JSON.stringify(errors));
  assert.equal(loaded.length, 13, `se esperaban 13 proveedores, se cargaron: ${loaded.join(", ")}`);
  assert.ok(loaded.includes("publicWebsiteFetcher"));
  assert.ok(loaded.includes("seoProvider"));
  assert.ok(loaded.includes("accessibilityProvider"));
  const realProvider = registry.get("publicWebsiteFetcher");
  assert.equal(realProvider.status, "real");
  const seoProvider = registry.get("seoProvider");
  assert.equal(seoProvider.status, "real");
  const a11yProvider = registry.get("accessibilityProvider");
  assert.equal(a11yProvider.status, "real");
  const stubCount = registry.list().filter((p) => p.status === "stub").length;
  assert.equal(stubCount, 10);
  const realCount = registry.list().filter((p) => p.status === "real").length;
  assert.equal(realCount, 3);
});

test("tras el auto-descubrimiento, resolveFallbackChain('performance') incluye lighthouseProvider/performanceProvider/speedProvider en orden de prioridad", async () => {
  const registry = createProviderRegistry();
  const pluginsDir = path.resolve("src/saas-core/research/providers/plugins");
  await discoverAndRegisterPlugins(registry, pluginsDir);
  const chain = registry.resolveFallbackChain("performance").map((p) => p.id);
  assert.ok(chain.includes("lighthouseProvider"));
  assert.ok(chain.includes("performanceProvider"));
  assert.ok(chain.includes("speedProvider"));
  // publicWebsiteFetcher cubre "*", así que también aparece:
  assert.ok(chain.includes("publicWebsiteFetcher"));
});
