import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { cp04BuildDeviceCapturePlan, cp04BuildGalleryCapturePlan, cp04BuildClubPadel04CapturePlan, cp04BuildFullCapturePlan } from "./capturePlan.js";

test("cp04BuildDeviceCapturePlan produce exactamente 8 jobs, uno por viewport, apuntando al index.html del paquete", () => {
  const plan = cp04BuildDeviceCapturePlan({ baseDir: "/tmp/demo" });
  assert.equal(plan.length, 8);
  for (const job of plan) {
    assert.equal(job.kind, "device");
    assert.match(job.url, /^file:\/\/.*index\.html$/);
    assert.ok(job.viewport);
    assert.equal(job.folder, path.join("mockups", job.viewport.folderName));
  }
});

test("los 8 jobs de dispositivo tienen viewportId únicos (sin duplicados)", () => {
  const plan = cp04BuildDeviceCapturePlan({ baseDir: "/tmp/demo" });
  const ids = plan.map((j) => j.viewportId);
  assert.equal(new Set(ids).size, 8);
});

test("cp04BuildGalleryCapturePlan produce 1 job apuntando a mockups/galeria.html", () => {
  const plan = cp04BuildGalleryCapturePlan({ baseDir: "/tmp/demo" });
  assert.equal(plan.length, 1);
  assert.equal(plan[0].kind, "gallery");
  assert.match(plan[0].url, /mockups\/galeria\.html$/);
});

test("cp04BuildClubPadel04CapturePlan apunta a localhost:5175 por defecto, sin lanzar un servidor nuevo", () => {
  const plan = cp04BuildClubPadel04CapturePlan({});
  assert.ok(plan.length > 0);
  for (const job of plan) {
    assert.equal(job.kind, "club-padel-04");
    assert.equal(job.url, "http://localhost:5175");
  }
});

test("cp04BuildFullCapturePlan combina los 3 planes sin perder ningún job", () => {
  const full = cp04BuildFullCapturePlan({ baseDir: "/tmp/demo", appUrl: "http://localhost:5175" });
  const devices = cp04BuildDeviceCapturePlan({ baseDir: "/tmp/demo" });
  const gallery = cp04BuildGalleryCapturePlan({ baseDir: "/tmp/demo" });
  const cp04 = cp04BuildClubPadel04CapturePlan({ appUrl: "http://localhost:5175" });
  assert.equal(full.length, devices.length + gallery.length + cp04.length);
});
