import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm, readFile, writeFile, access } from "node:fs/promises";

import { cp04RunDemoFlow } from "../demo/demoOrchestrator.js";
import { cp04RunMockupCaptureFlow } from "./captureOrchestrator.js";
import { cp04IsBrowserCaptureAvailable } from "./browserCaptureAdapter.js";
import { cp04ValidatePngBuffer } from "./captureValidator.js";
import { cp04IsPathDenied } from "../demo/denylist.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-app3-capture-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

const browserAvailable = cp04IsBrowserCaptureAvailable();
const maybeTest = (name, fn) => test(name, { skip: !browserAvailable && "Chromium no disponible en este entorno" }, fn);

maybeTest("Fase 10 #10/#13: captura las 8 vistas de dispositivo (solo device jobs) y las clasifica en mockups/<carpeta-dispositivo>", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const result = await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["android-mobile", "windows"] });
    assert.equal(result.status, "completed");
    assert.equal(result.failed.length, 0, JSON.stringify(result.failed));
    await access(path.join(dir, "mockups", "android-mobile", "android-mobile-index-raw.png"));
    await access(path.join(dir, "mockups", "windows", "windows-index-raw.png"));
  });
});

maybeTest("Fase 10 #14: cada captura queda registrada en mockups-manifest.json con checksum", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const result = await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["ipad"] });
    const raw = result.manifest.items.find((i) => i.deliverableType === "mockup_raw_capture");
    assert.ok(raw);
    assert.equal(raw.checksum.length, 64);
    const onDisk = JSON.parse(await readFile(path.join(dir, "mockups", "mockups-manifest.json"), "utf8"));
    assert.equal(onDisk.itemCount, result.manifest.itemCount);
  });
});

maybeTest("Fase 10 #15/#16: repetir sin cambios no duplica ni sube de versión; forzar un cambio sí sube de versión", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const first = await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["macos"] });
    const second = await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["macos"] });
    assert.equal(second.hasChanges, false);
    assert.equal(second.manifest.version, first.manifest.version);
    assert.equal(second.manifest.itemCount, first.manifest.itemCount);

    // Forzar un cambio real: alterar el checksum previo para simular contenido
    // distinto. La comparación de versión usa versionChecksum (que excluye
    // campos volátiles como capturedAt; ver captureOrchestrator.js) — hay
    // que alterar ese campo, no solo `checksum` (el hash de integridad del
    // archivo en disco, que es un asunto distinto: ver mockupsValidator.js).
    const manifestPath = path.join(dir, "mockups", "mockups-manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.items[0].checksum = "0".repeat(64);
    manifest.items[0].versionChecksum = "0".repeat(64);
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));
    const third = await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["macos"] });
    assert.equal(third.hasChanges, true);
    assert.equal(third.manifest.version, first.manifest.version + 1);
  });
});

maybeTest("Fase 10 #17: genera la galería HTML de capturas reales, distinta de la galería de previews del Prompt 2", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["linux"] });
    const { cp04WriteMockupsGallery } = await import("./mockupsGallery.js");
    const galleryPath = await cp04WriteMockupsGallery({ baseDir: dir });
    const html = await readFile(galleryPath, "utf8");
    assert.match(html, /Capturas reales/);
    assert.notEqual(path.basename(galleryPath), "galeria.html");
  });
});

maybeTest("Fase 10 #18-25: las 8 combinaciones de dispositivo producen una captura válida cada una", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const result = await cp04RunMockupCaptureFlow({ baseDir: dir, includeGallery: false, includeClubPadel04: false });
    assert.equal(result.failed.length, 0, JSON.stringify(result.failed));
    const rawItems = result.manifest.items.filter((i) => i.deliverableType === "mockup_raw_capture" && i.path.includes("-index-raw.png"));
    assert.equal(rawItems.length, 8);
    for (const item of rawItems) {
      const buffer = await readFile(path.join(dir, item.path));
      const validation = cp04ValidatePngBuffer(buffer);
      assert.equal(validation.valid, true, `${item.path}: ${JSON.stringify(validation.errors)}`);
    }
  });
});

maybeTest("Fase 10 #26/#27: la cola de Drive queda en dry-run, sin llamadas externas ni subidas", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const result = await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["android-tablet"] });
    assert.ok(result.driveDryRun.length > 0);
    assert.ok(result.driveDryRun.every((r) => r.demoStatus === "dry_run"));
  });
});

maybeTest("Fase 10 #28: ningún artefacto generado contiene rutas de la denylist de secretos", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const result = await cp04RunMockupCaptureFlow({ baseDir: dir, deviceIds: ["ios-mobile"] });
    for (const item of result.manifest.items) {
      assert.equal(cp04IsPathDenied(item.path), false, `${item.path} no debería estar en la denylist`);
    }
  });
});

maybeTest("Fase 10 #30: dos proyectos (baseDir distintos) no mezclan sus capturas", async () => {
  await withTempDir(async (dirA) => {
    await withTempDir(async (dirB) => {
      await cp04RunDemoFlow({ baseDir: dirA, skipArchive: true });
      await cp04RunDemoFlow({ baseDir: dirB, skipArchive: true });
      const resultA = await cp04RunMockupCaptureFlow({ baseDir: dirA, deviceIds: ["windows"] });
      const resultB = await cp04RunMockupCaptureFlow({ baseDir: dirB, deviceIds: ["macos"] });
      const pathsA = resultA.manifest.items.map((i) => i.path);
      const pathsB = resultB.manifest.items.map((i) => i.path);
      assert.equal(pathsA.some((p) => p.includes("macos")), false);
      assert.equal(pathsB.some((p) => p.includes("windows")), false);
    });
  });
});

maybeTest("captura además las 3 pantallas reales de Club Pádel 04 (login/inicio/perfil) sin modificar su código", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const result = await cp04RunMockupCaptureFlow({ baseDir: dir, includeGallery: false });
    const cp04Items = result.manifest.items.filter((i) => i.path.includes("club-padel-04-screens"));
    assert.ok(cp04Items.length > 0, "debería haber capturado al menos una pantalla de Club Pádel 04");
  });
});

test("sin Chromium disponible, el flujo devuelve status:'unavailable' en vez de fingir capturas", async () => {
  if (browserAvailable) return; // este test solo aplica cuando de verdad no hay navegador — no se simula la ausencia para no dar un falso resultado
  await withTempDir(async (dir) => {
    const result = await cp04RunMockupCaptureFlow({ baseDir: dir });
    assert.equal(result.status, "unavailable");
  });
});
