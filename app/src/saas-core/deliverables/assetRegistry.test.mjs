import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04CreateAssetRegistry } from "./assetRegistry.js";

test("registerAsset exige projectId, type, name y format", () => {
  const registry = cp04CreateAssetRegistry();
  assert.throws(() => registry.registerAsset({}), TypeError);
  assert.throws(() => registry.registerAsset({ projectId: "p1" }), TypeError);
  assert.throws(() => registry.registerAsset({ projectId: "p1", type: "logotipo" }), TypeError);
  assert.throws(() => registry.registerAsset({ projectId: "p1", type: "logotipo", name: "Logo" }), TypeError);
});

test("registerAsset devuelve un registro con id único, createdAt y el contenido preservado", () => {
  const registry = cp04CreateAssetRegistry();
  const asset = registry.registerAsset({ projectId: "p1", type: "logotipo", name: "Logo principal", format: "SVG", content: "<svg/>" });
  assert.ok(asset.id);
  assert.equal(asset.format, "svg", "el formato se normaliza a minúsculas");
  assert.ok(asset.createdAt);
  assert.equal(asset.content, "<svg/>");
});

test("dos assets registrados consecutivamente tienen ids distintos (sin colisión)", () => {
  const registry = cp04CreateAssetRegistry();
  const a = registry.registerAsset({ projectId: "p1", type: "icono", name: "A", format: "svg" });
  const b = registry.registerAsset({ projectId: "p1", type: "icono", name: "B", format: "svg" });
  assert.notEqual(a.id, b.id);
});

test("listAssets filtra por proyecto; sin argumento devuelve todos", () => {
  const registry = cp04CreateAssetRegistry();
  registry.registerAsset({ projectId: "p1", type: "icono", name: "A", format: "svg" });
  registry.registerAsset({ projectId: "p2", type: "icono", name: "B", format: "svg" });
  assert.equal(registry.listAssets("p1").length, 1);
  assert.equal(registry.listAssets("p2").length, 1);
  assert.equal(registry.listAssets().length, 2);
});

test("listAssetsByType filtra por proyecto y tipo a la vez", () => {
  const registry = cp04CreateAssetRegistry();
  registry.registerAsset({ projectId: "p1", type: "icono", name: "A", format: "svg" });
  registry.registerAsset({ projectId: "p1", type: "logotipo", name: "B", format: "svg" });
  assert.equal(registry.listAssetsByType("p1", "icono").length, 1);
});

test("getAsset/removeAsset/count funcionan sobre el registro real, no una copia", () => {
  const registry = cp04CreateAssetRegistry();
  const asset = registry.registerAsset({ projectId: "p1", type: "icono", name: "A", format: "svg" });
  assert.equal(registry.count(), 1);
  assert.deepEqual(registry.getAsset(asset.id), asset);
  assert.equal(registry.removeAsset(asset.id), true);
  assert.equal(registry.count(), 0);
  assert.equal(registry.getAsset(asset.id), null);
});

test("dos registros creados con cp04CreateAssetRegistry están completamente aislados entre sí", () => {
  const r1 = cp04CreateAssetRegistry();
  const r2 = cp04CreateAssetRegistry();
  r1.registerAsset({ projectId: "p1", type: "icono", name: "A", format: "svg" });
  assert.equal(r1.count(), 1);
  assert.equal(r2.count(), 0);
});

test("el registro devuelto está congelado (Object.freeze) — no se puede mutar tras crearlo", () => {
  const registry = cp04CreateAssetRegistry();
  const asset = registry.registerAsset({ projectId: "p1", type: "icono", name: "A", format: "svg" });
  assert.throws(() => { asset.name = "otro"; }, TypeError);
});
