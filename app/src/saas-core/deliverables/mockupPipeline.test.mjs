import { test } from "node:test";
import assert from "node:assert/strict";
import { CP04_MOCKUP_DEVICES, CP04_MOCKUP_DEVICE_IDS, cp04GenerateMockup, cp04GenerateAllDeviceMockups } from "./mockupPipeline.js";

test("existen exactamente los 8 dispositivos pedidos por el enunciado", () => {
  assert.equal(CP04_MOCKUP_DEVICE_IDS.length, 8);
  for (const id of ["movil", "tablet", "escritorio", "android", "iphone", "ipad", "windows", "macos"]) {
    assert.ok(CP04_MOCKUP_DEVICES[id], `falta el dispositivo "${id}"`);
  }
});

test("cada dispositivo declara width/height positivos (medidas representativas, no exactas)", () => {
  for (const id of CP04_MOCKUP_DEVICE_IDS) {
    const device = CP04_MOCKUP_DEVICES[id];
    assert.ok(device.width > 0 && device.height > 0, `${id} debería tener dimensiones positivas`);
  }
});

test("cp04GenerateMockup en SVG produce contenido real con las dimensiones del dispositivo", () => {
  const result = cp04GenerateMockup({ deviceId: "movil", format: "svg" });
  assert.equal(result.status, "completed");
  assert.match(result.content, /width="390" height="844"/);
});

test("cp04GenerateMockup en HTML envuelve el SVG en una página", () => {
  const result = cp04GenerateMockup({ deviceId: "escritorio", format: "html" });
  assert.equal(result.status, "completed");
  assert.match(result.content, /<!doctype html>/);
});

test("cp04GenerateMockup con un dispositivo desconocido falla con un mensaje claro, sin lanzar", () => {
  const result = cp04GenerateMockup({ deviceId: "smartwatch" });
  assert.equal(result.status, "failed");
  assert.match(result.reason, /desconocido/);
});

test("cp04GenerateMockup en PNG declara not_implemented (sin motor de rasterizado real)", () => {
  const result = cp04GenerateMockup({ deviceId: "android", format: "png" });
  assert.equal(result.status, "not_implemented");
  assert.ok(result.reason);
});

test("cp04GenerateAllDeviceMockups genera los 8 mockups de una vez", () => {
  const results = cp04GenerateAllDeviceMockups({ format: "svg" });
  assert.equal(results.length, 8);
  assert.ok(results.every((r) => r.status === "completed"));
});
