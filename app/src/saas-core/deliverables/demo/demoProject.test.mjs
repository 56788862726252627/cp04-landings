import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04BuildDemoProject, CP04_DEMO_CLIENT_SLUG } from "./demoProject.js";

test("el proyecto demo declara un projectId estable, cliente y sector claramente ficticios", () => {
  const project = cp04BuildDemoProject();
  assert.ok(project.projectId);
  assert.match(project.client, /ficticio/i);
  assert.ok(project.sector);
  assert.ok(project.sectorLabel);
});

test("dos llamadas a cp04BuildDemoProject devuelven el mismo projectId (estable, no aleatorio)", () => {
  assert.equal(cp04BuildDemoProject().projectId, cp04BuildDemoProject().projectId);
  assert.equal(cp04BuildDemoProject().projectId, `demo_${CP04_DEMO_CLIENT_SLUG}`);
});

test("declara los 8 dispositivos objetivo y los sistemas operativos objetivo pedidos", () => {
  const project = cp04BuildDemoProject();
  assert.equal(project.targetDevices.length, 8);
  for (const os of ["Android", "iOS", "Windows", "macOS", "Linux", "Web/PWA"]) {
    assert.ok(project.targetOperatingSystems.includes(os), `falta el sistema operativo ${os}`);
  }
});

test("declara branding ficticio con colores válidos y ninguna credencial", () => {
  const project = cp04BuildDemoProject();
  assert.match(project.branding.primaryColor, /^#[0-9a-f]{6}$/i);
  assert.equal(JSON.stringify(project).toLowerCase().includes("api_key"), false);
});

test("el objeto del proyecto está congelado (Object.freeze)", () => {
  const project = cp04BuildDemoProject();
  assert.throws(() => { project.client = "otro"; }, TypeError);
});
