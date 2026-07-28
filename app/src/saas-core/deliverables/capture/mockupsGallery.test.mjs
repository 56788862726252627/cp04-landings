import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm, readFile } from "node:fs/promises";

import { cp04RunDemoFlow } from "../demo/demoOrchestrator.js";
import { cp04RunMockupCaptureFlow } from "./captureOrchestrator.js";
import { cp04IsBrowserCaptureAvailable } from "./browserCaptureAdapter.js";
import { cp04BuildMockupsGalleryHtml, cp04WriteMockupsGallery } from "./mockupsGallery.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-app3-gallery-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const browserAvailable = cp04IsBrowserCaptureAvailable();
const maybeTest = (name, fn) => test(name, { skip: !browserAvailable && "Chromium no disponible en este entorno" }, fn);

maybeTest("cp04BuildMockupsGalleryHtml incluye un <figure> por cada mockup con marco (mockup_framed)", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["android-mobile", "ipad"] });
    const html = await cp04BuildMockupsGalleryHtml({ baseDir: dir });
    const figures = html.match(/<figure>/g) || [];
    assert.equal(figures.length, 2);
  });
});

maybeTest("cp04WriteMockupsGallery escribe galeria-capturas-reales.html en disco, legible", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["windows"] });
    const outPath = await cp04WriteMockupsGallery({ baseDir: dir });
    const content = await readFile(outPath, "utf8");
    assert.match(content, /<!doctype html>/);
  });
});
