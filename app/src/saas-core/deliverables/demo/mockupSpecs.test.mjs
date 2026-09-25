import { test } from "node:test";
import assert from "node:assert/strict";
import { CP04_MOCKUP_SPEC_LIST, cp04GetMockupSpec, cp04ListMockupSpecsWithStatus } from "./mockupSpecs.js";

const EXPECTED_NAMES = [
  "movil-android-vertical", "movil-ios-vertical", "tablet-android-horizontal", "ipad-horizontal",
  "escritorio-windows", "escritorio-macos", "escritorio-linux", "web-pwa-responsive",
];

test("existen exactamente las 8 especificaciones de mockup pedidas por el enunciado", () => {
  assert.equal(CP04_MOCKUP_SPEC_LIST.length, 8);
  const names = CP04_MOCKUP_SPEC_LIST.map((s) => s.normalizedName);
  assert.deepEqual([...names].sort(), [...EXPECTED_NAMES].sort());
});

test("cada especificación declara dispositivo, sistema, resolución, orientación, ruta de captura futura y metadatos", () => {
  for (const spec of CP04_MOCKUP_SPEC_LIST) {
    assert.ok(spec.device, `${spec.normalizedName} sin device`);
    assert.ok(spec.system, `${spec.normalizedName} sin system`);
    assert.ok(spec.orientation, `${spec.normalizedName} sin orientation`);
    assert.ok(spec.resolution?.width > 0 && spec.resolution?.height > 0, `${spec.normalizedName} sin resolución válida`);
    assert.ok(spec.futureCapturePath, `${spec.normalizedName} sin ruta de captura futura`);
    assert.ok(spec.metadata, `${spec.normalizedName} sin metadata`);
  }
});

test("los nombres normalizados no tienen espacios ni mayúsculas (aptos como nombre de archivo)", () => {
  for (const spec of CP04_MOCKUP_SPEC_LIST) {
    assert.equal(/^[a-z0-9-]+$/.test(spec.normalizedName), true, `${spec.normalizedName} no está normalizado`);
  }
});

test("cp04GetMockupSpec encuentra una especificación existente y devuelve null para una inexistente", () => {
  assert.ok(cp04GetMockupSpec("ipad-horizontal"));
  assert.equal(cp04GetMockupSpec("smartwatch"), null);
});

test("cp04ListMockupSpecsWithStatus añade placeholderStatus='completed' y captureStatus='not_implemented' a las 8", () => {
  const withStatus = cp04ListMockupSpecsWithStatus();
  assert.equal(withStatus.length, 8);
  for (const spec of withStatus) {
    assert.equal(spec.placeholderStatus, "completed");
    assert.equal(spec.captureStatus, "not_implemented");
    assert.ok(spec.captureStatusReason);
  }
});

test("las especificaciones base están congeladas (Object.freeze) — no se pueden mutar", () => {
  assert.throws(() => { CP04_MOCKUP_SPEC_LIST[0].device = "otro"; }, TypeError);
});
