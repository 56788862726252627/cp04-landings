import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm, writeFile } from "node:fs/promises";

import { cp04RunDemoFlow } from "../demo/demoOrchestrator.js";
import { cp04RunMockupCaptureFlow } from "./captureOrchestrator.js";
import { cp04IsBrowserCaptureAvailable } from "./browserCaptureAdapter.js";
import { cp04ValidateMockupsOutput } from "./mockupsValidator.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-app3-mockups-validate-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const browserAvailable = cp04IsBrowserCaptureAvailable();
const maybeTest = (name, fn) => test(name, { skip: !browserAvailable && "Chromium no disponible en este entorno" }, fn);

test("sin manifiesto de capturas, devuelve inválido con mensaje claro, sin lanzar", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04ValidateMockupsOutput({ baseDir: dir });
    assert.equal(result.valid, false);
    assert.match(result.errors[0], /mockups-manifest\.json/);
  });
});

maybeTest("un conjunto de capturas recién generado valida correctamente (checksums + PNG válidos)", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["android-mobile"] });
    const result = await cp04ValidateMockupsOutput({ baseDir: dir });
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.ok(result.checkedFiles > 0);
  });
});

maybeTest("detecta un PNG corrompido tras la generación (checksum no coincide)", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const flow = await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["macos"] });
    const rawItem = flow.manifest.items.find((i) => i.deliverableType === "mockup_raw_capture");
    await writeFile(path.join(dir, rawItem.path), Buffer.from("contenido corrompido"));
    const result = await cp04ValidateMockupsOutput({ baseDir: dir });
    assert.equal(result.valid, false);
  });
});
