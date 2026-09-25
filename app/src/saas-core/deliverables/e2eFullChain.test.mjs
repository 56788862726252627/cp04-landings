// App 3 · Prompt 6/6 — Validación end-to-end de la cadena completa.
//
// Encadena de verdad, en un único directorio, los 3 flujos de
// generación (DemoOrchestrator Prompt 2/6 → texto/SVG,
// CaptureOrchestrator Prompt 3/6 → capturas reales con Chromium) y el
// empaquetado final (ExportPackageManager Prompt 5/6) — nunca probado
// como una sola cadena hasta ahora (Prompt 5/6 solo probó cada origen
// por separado). Usa Chromium real (1 instancia, serializado, sin
// concurrencia) — es la validación de cierre de producción pedida
// explícitamente por el Prompt 6/6, no un test más.
import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm, readFile, readdir } from "node:fs/promises";

import { cp04RunDemoFlow } from "./demo/demoOrchestrator.js";
import { cp04RunMockupCaptureFlow } from "./capture/captureOrchestrator.js";
import { cp04IsBrowserCaptureAvailable } from "./capture/browserCaptureAdapter.js";
import { cp04BuildFinalExportPackage } from "./packaging/exportPackageManager.js";
import { cp04ListZipEntries } from "./packaging/packageZip.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-e2e-full-chain-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const browserAvailable = cp04IsBrowserCaptureAvailable();
const maybeTest = (name, fn) => test(name, { skip: !browserAvailable && "Chromium no disponible en este entorno" }, fn);

maybeTest("cadena completa: generación (Prompt 2/6) + capturas reales (Prompt 3/6) + empaquetado final (Prompt 5/6), sin ningún fallo", async () => {
  await withTempDir(async (sourceDir) => {
    const demoResult = await cp04RunDemoFlow({ baseDir: sourceDir, skipArchive: true });
    assert.equal(demoResult.denylistValid !== false, true);

    const captureResult = await cp04RunMockupCaptureFlow({ baseDir: sourceDir, deviceIds: ["android-mobile", "macos"] });
    assert.equal(captureResult.status, "completed");
    assert.equal(captureResult.failed.length, 0, JSON.stringify(captureResult.failed));

    const packageResult = await cp04BuildFinalExportPackage({
      sourceBaseDir: sourceDir,
      targetBaseDir: path.join(sourceDir, "..", "target-full-chain"),
      projectName: demoResult.project.displayName,
    });

    assert.equal(packageResult.failed.length, 0, JSON.stringify(packageResult.failed));
    // El paquete debe contener tanto entregables de texto/SVG (Prompt 2/6) como capturas reales PNG (Prompt 3/6).
    const formats = new Set(packageResult.manifest.items.map((i) => i.format));
    assert.ok(formats.has("markdown") || formats.has("html"));
    assert.ok(formats.has("svg"));
    assert.ok(formats.has("png"), "el paquete final debe incluir al menos una captura real PNG");

    const zipBuffer = await readFile(path.join(sourceDir, "..", "target-full-chain", packageResult.zipPath));
    const entries = await cp04ListZipEntries(zipBuffer);
    assert.ok(entries.some((e) => e.endsWith(".png")));
    assert.ok(entries.some((e) => e.endsWith(".md") || e.endsWith(".html")));

    const folders = (await readdir(path.join(sourceDir, "..", "target-full-chain"), { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name);
    // Las 11 carpetas estándar (FolderStructure.js) + "manifest" (el manifiesto final).
    assert.equal(folders.length, 12, "las 11 carpetas estándar + manifest deben existir en la entrega final");

    await rm(path.join(sourceDir, "..", "target-full-chain"), { recursive: true, force: true });
  });
});

maybeTest("cadena completa: repetir sobre el mismo origen sin cambios produce un .zip final idéntico (idempotencia de extremo a extremo)", async () => {
  await withTempDir(async (sourceDir) => {
    await cp04RunDemoFlow({ baseDir: sourceDir, skipArchive: true });
    await cp04RunMockupCaptureFlow({ baseDir: sourceDir, deviceIds: ["windows"] });

    const targetDir = path.join(sourceDir, "..", "target-idempotent");
    const first = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: "Cadena Completa Demo" });
    const second = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: "Cadena Completa Demo" });

    assert.equal(second.hasChanges, false);
    assert.equal(second.zipChecksum, first.zipChecksum);

    await rm(targetDir, { recursive: true, force: true });
  });
});
