import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { createProviderRegistry, discoverAndRegisterPlugins, ProviderRegistryError } from "./providerRegistry.js";
import { defineStubProvider, defineProviderCapabilities } from "./providerTypes.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-provider-plugins-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

function stub(id, priority, dims = ["*"]) {
  return defineStubProvider({ id, label: id, capabilities: defineProviderCapabilities({ dimensions: dims }), priority });
}

test("register/get/list funcionan y ordenan por prioridad ascendente", () => {
  const registry = createProviderRegistry();
  registry.register(stub("b", 20));
  registry.register(stub("a", 10));
  const ids = registry.list().map((p) => p.id);
  assert.deepEqual(ids, ["a", "b"]);
});

test("register rechaza un id duplicado", () => {
  const registry = createProviderRegistry();
  registry.register(stub("x", 10));
  assert.throws(() => registry.register(stub("x", 20)), ProviderRegistryError);
});

test("unregister elimina el proveedor", () => {
  const registry = createProviderRegistry();
  registry.register(stub("x", 10));
  registry.unregister("x");
  assert.equal(registry.get("x"), null);
});

test("setEnabled/isEnabled activan y desactivan un proveedor", () => {
  const registry = createProviderRegistry();
  registry.register(stub("x", 10));
  assert.equal(registry.isEnabled("x"), true);
  registry.setEnabled("x", false);
  assert.equal(registry.isEnabled("x"), false);
  assert.equal(registry.list({ onlyEnabled: true }).length, 0);
});

test("setEnabled lanza para un id desconocido", () => {
  const registry = createProviderRegistry();
  assert.throws(() => registry.setEnabled("no-existe", true), ProviderRegistryError);
});

test("setPriority cambia el orden de resolución", () => {
  const registry = createProviderRegistry();
  registry.register(stub("a", 10));
  registry.register(stub("b", 20));
  registry.setPriority("a", 30);
  const ids = registry.list().map((p) => p.id);
  assert.deepEqual(ids, ["b", "a"]);
});

test("resolveFallbackChain devuelve solo proveedores habilitados que cubren la dimensión, en orden de prioridad", () => {
  const registry = createProviderRegistry();
  registry.register(stub("generic", 50)); // cubre "*"
  registry.register(stub("seo-specific", 10, ["seoTechnical"]));
  registry.register(stub("unrelated", 5, ["branding"]));
  registry.setEnabled("unrelated", false);
  const chain = registry.resolveFallbackChain("seoTechnical").map((p) => p.id);
  assert.deepEqual(chain, ["seo-specific", "generic"]);
});

test("healthCheckAll agrega el resultado de cada proveedor registrado, incluso si uno lanza", async () => {
  const registry = createProviderRegistry();
  registry.register(stub("ok", 10));
  registry.register(defineStubProvider({ id: "roto", label: "roto", capabilities: defineProviderCapabilities(), healthCheck: undefined }));
  // Forzamos un healthCheck que lanza reemplazando el proveedor registrado por uno con healthCheck defectuoso:
  registry.unregister("roto");
  const brokenProvider = { ...stub("roto", 10), healthCheck: async () => { throw new Error("boom"); } };
  registry.register(brokenProvider);
  const results = await registry.healthCheckAll();
  assert.equal(results.length, 2);
  const broken = results.find((r) => r.id === "roto");
  assert.equal(broken.healthy, false);
  assert.match(broken.message, /boom/);
});

test("clear() vacía el registro", () => {
  const registry = createProviderRegistry();
  registry.register(stub("x", 10));
  registry.clear();
  assert.equal(registry.list().length, 0);
});

test("discoverAndRegisterPlugins carga automáticamente módulos .js válidos de un directorio (plugin real, sin tocar el núcleo)", async () => {
  await withTempDir(async (dir) => {
    await writeFile(
      path.join(dir, "miPlugin.js"),
      `
      import { defineStubProvider, defineProviderCapabilities } from "${pathToFileUrlSafe(path.resolve("src/saas-core/research/providers/core/providerTypes.js"))}";
      export const PROVIDER = defineStubProvider({ id: "mi-plugin-de-prueba", label: "Mi Plugin", capabilities: defineProviderCapabilities({ dimensions: ["branding"] }) });
      `,
      "utf8"
    );
    const registry = createProviderRegistry();
    const { loaded, errors } = await discoverAndRegisterPlugins(registry, dir);
    assert.deepEqual(loaded, ["mi-plugin-de-prueba"]);
    assert.deepEqual(errors, []);
    assert.ok(registry.get("mi-plugin-de-prueba"));
  });
});

test("discoverAndRegisterPlugins ignora archivos .test.mjs y reporta (sin lanzar) un módulo sin PROVIDER", async () => {
  await withTempDir(async (dir) => {
    await writeFile(path.join(dir, "algo.test.mjs"), "export const PROVIDER = {};", "utf8");
    await writeFile(path.join(dir, "sinProvider.js"), "export const OTRA_COSA = 1;", "utf8");
    const registry = createProviderRegistry();
    const { loaded, errors } = await discoverAndRegisterPlugins(registry, dir);
    assert.deepEqual(loaded, []);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].file, "sinProvider.js");
  });
});

test("discoverAndRegisterPlugins reporta (sin lanzar) un archivo .js con error de sintaxis", async () => {
  await withTempDir(async (dir) => {
    await writeFile(path.join(dir, "roto.js"), "export const PROVIDER = { esto no es js válido", "utf8");
    const registry = createProviderRegistry();
    const { loaded, errors } = await discoverAndRegisterPlugins(registry, dir);
    assert.deepEqual(loaded, []);
    assert.equal(errors.length, 1);
  });
});

function pathToFileUrlSafe(p) {
  return "file://" + p.replace(/\\/g, "/");
}
