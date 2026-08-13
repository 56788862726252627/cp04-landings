import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm } from "node:fs/promises";

import { cp04RunDemoFlow } from "./demoOrchestrator.js";
import { cp04BuildDemoReportText } from "./demoReport.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-app3-report-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("sin baseDir devuelve un mensaje de error legible, sin lanzar", async () => {
  const text = await cp04BuildDemoReportText({});
  assert.match(text, /baseDir es obligatorio/);
});

test("sin ningún paquete generado todavía, indica claramente qué comando ejecutar", async () => {
  await withTempDir(async (dir) => {
    const text = await cp04BuildDemoReportText({ baseDir: dir });
    assert.match(text, /app3:demo/);
  });
});

test("tras generar el paquete, el informe incluye versión, recuento por estado e historial", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const text = await cp04BuildDemoReportText({ baseDir: dir });
    assert.match(text, /Versión del paquete: 1/);
    assert.match(text, /validated/);
    assert.match(text, /Ejecuciones registradas en el historial: 1/);
  });
});

test("tras dos ejecuciones sin cambios, el historial refleja 2 ejecuciones pero la misma versión", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const text = await cp04BuildDemoReportText({ baseDir: dir });
    assert.match(text, /Ejecuciones registradas en el historial: 2/);
    assert.match(text, /Versión del paquete: 1/);
  });
});
