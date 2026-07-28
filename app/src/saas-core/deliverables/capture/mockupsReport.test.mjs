import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm } from "node:fs/promises";

import { cp04RunDemoFlow } from "../demo/demoOrchestrator.js";
import { cp04RunMockupCaptureFlow } from "./captureOrchestrator.js";
import { cp04IsBrowserCaptureAvailable } from "./browserCaptureAdapter.js";
import { cp04BuildMockupsReportText } from "./mockupsReport.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-app3-mockups-report-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const browserAvailable = cp04IsBrowserCaptureAvailable();
const maybeTest = (name, fn) => test(name, { skip: !browserAvailable && "Chromium no disponible en este entorno" }, fn);

test("sin baseDir devuelve un mensaje de error legible", async () => {
  const text = await cp04BuildMockupsReportText({});
  assert.match(text, /baseDir es obligatorio/);
});

test("sin capturas generadas, indica qué comando ejecutar", async () => {
  await withTempDir(async (dir) => {
    const text = await cp04BuildMockupsReportText({ baseDir: dir });
    assert.match(text, /app3:mockups/);
  });
});

maybeTest("tras generar capturas, el informe incluye versión, recuento por tipo y el aviso de validación física pendiente", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["linux"] });
    const text = await cp04BuildMockupsReportText({ baseDir: dir });
    assert.match(text, /Versión del manifiesto de capturas: 1/);
    assert.match(text, /mockup_raw_capture/);
    assert.match(text, /Validación física pendiente/);
  });
});
