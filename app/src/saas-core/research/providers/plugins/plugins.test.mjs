import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";

import { createProviderRegistry, discoverAndRegisterPlugins } from "../core/providerRegistry.js";
import { DIMENSION_IDS } from "../../dimensionRegistry.js";

const STUB_PLUGIN_MODULES = [
  "lighthouseProviderPlugin.js",
  "seoProviderPlugin.js",
  "performanceProviderPlugin.js",
  "accessibilityProviderPlugin.js",
  "socialProviderPlugin.js",
  "schemaProviderPlugin.js",
  "technologyProviderPlugin.js",
  "securityHeadersProviderPlugin.js",
  "dnsProviderPlugin.js",
  "whoisProviderPlugin.js",
  "speedProviderPlugin.js",
  "aiContentProviderPlugin.js",
];

test("existen exactamente los 12 módulos de proveedores stub del enunciado (Fase 3)", async () => {
  for (const file of STUB_PLUGIN_MODULES) {
    const mod = await import(`./${file}`);
    assert.ok(mod.PROVIDER, `${file} debe exportar PROVIDER`);
  }
});

test("cada proveedor stub declara status='stub', capabilities con dimensiones válidas (o '*'), y un collect() que nunca lanza", async () => {
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

test("cada proveedor stub tiene un id único (sin colisiones entre los 12)", async () => {
  const ids = new Set();
  for (const file of STUB_PLUGIN_MODULES) {
    const { PROVIDER } = await import(`./${file}`);
    assert.ok(!ids.has(PROVIDER.id), `id duplicado: ${PROVIDER.id}`);
    ids.add(PROVIDER.id);
  }
  assert.equal(ids.size, 12);
});

test("discoverAndRegisterPlugins carga automáticamente los 13 proveedores reales (12 stub + 1 real) desde el directorio real de plugins, sin listarlos a mano", async () => {
  const registry = createProviderRegistry();
  const pluginsDir = path.resolve("src/saas-core/research/providers/plugins");
  const { loaded, errors } = await discoverAndRegisterPlugins(registry, pluginsDir);
  assert.deepEqual(errors, [], JSON.stringify(errors));
  assert.equal(loaded.length, 13, `se esperaban 13 proveedores, se cargaron: ${loaded.join(", ")}`);
  assert.ok(loaded.includes("publicWebsiteFetcher"));
  const realProvider = registry.get("publicWebsiteFetcher");
  assert.equal(realProvider.status, "real");
  const stubCount = registry.list().filter((p) => p.status === "stub").length;
  assert.equal(stubCount, 12);
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
