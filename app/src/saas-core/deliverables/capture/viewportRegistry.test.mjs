import { test } from "node:test";
import assert from "node:assert/strict";
import { CP04_VIEWPORT_REGISTRY, CP04_VIEWPORT_IDS, cp04GetViewport, cp04ListViewportIds } from "./viewportRegistry.js";

const EXPECTED = {
  "android-mobile": { width: 412, height: 915, orientation: "vertical" },
  "ios-mobile": { width: 390, height: 844, orientation: "vertical" },
  "android-tablet": { width: 1194, height: 834, orientation: "horizontal" },
  ipad: { width: 1194, height: 834, orientation: "horizontal" },
  windows: { width: 1920, height: 1080, orientation: "horizontal" },
  macos: { width: 1440, height: 900, orientation: "horizontal" },
  linux: { width: 1920, height: 1080, orientation: "horizontal" },
  "web-pwa": { width: 1024, height: 768, orientation: "responsive" },
};

test("Fase 10 #1: existen exactamente los 8 viewports pedidos, con las dimensiones exactas del enunciado", () => {
  assert.equal(CP04_VIEWPORT_IDS.length, 8);
  for (const [id, expected] of Object.entries(EXPECTED)) {
    const viewport = CP04_VIEWPORT_REGISTRY[id];
    assert.ok(viewport, `falta el viewport ${id}`);
    assert.equal(viewport.width, expected.width, `${id}: ancho incorrecto`);
    assert.equal(viewport.height, expected.height, `${id}: alto incorrecto`);
    assert.equal(viewport.orientation, expected.orientation, `${id}: orientación incorrecta`);
  }
});

test("cada viewport declara device, system y deviceScaleFactor", () => {
  for (const id of CP04_VIEWPORT_IDS) {
    const viewport = CP04_VIEWPORT_REGISTRY[id];
    assert.ok(viewport.device);
    assert.ok(viewport.system);
    assert.ok(viewport.deviceScaleFactor > 0);
  }
});

test("cp04GetViewport devuelve null para un id inexistente", () => {
  assert.equal(cp04GetViewport("smartwatch"), null);
  assert.ok(cp04GetViewport("windows"));
});

test("cp04ListViewportIds devuelve una copia (mutarla no afecta el registro)", () => {
  const ids = cp04ListViewportIds();
  ids.push("inventado");
  assert.equal(cp04ListViewportIds().length, 8);
});

test("el registro está congelado (Object.freeze)", () => {
  assert.throws(() => { CP04_VIEWPORT_REGISTRY.windows.width = 1; }, TypeError);
});
