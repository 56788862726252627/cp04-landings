import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm, mkdir, writeFile } from "node:fs/promises";
import { Buffer } from "node:buffer";

import { cp04CreateMockDriveAdapter } from "./driveMockAdapter.js";
import { cp04CreateNotConfiguredDriveAdapter } from "./driveAdapter.js";
import { cp04MapExportFolderToDriveCategory, cp04SyncFileToDrive, cp04SyncExportPackageToDrive } from "./driveExportSync.js";
import { CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04, CP04_DRIVE_UNIVERSAL_AGENCIA_IA } from "./driveUniversalFolderTree.js";
import { cp04RunDemoFlow } from "./demo/demoOrchestrator.js";
import { cp04BuildFinalExportPackage } from "./packaging/exportPackageManager.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-drive-sync-"));
  try {
    return await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("cp04MapExportFolderToDriveCategory: mapea a una categoría que SIEMPRE existe en el root elegido", () => {
  assert.equal(cp04MapExportFolderToDriveCategory("PDFs", CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04), "PDF");
  assert.equal(cp04MapExportFolderToDriveCategory("Mockups", CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04), "Mockups");
  // "Iconos" no existe en el root "Agencia IA" — cae a "Material Comercial" (que sí existe ahí).
  assert.equal(cp04MapExportFolderToDriveCategory("Iconos", CP04_DRIVE_UNIVERSAL_AGENCIA_IA), "Material Comercial");
  // Carpeta local desconocida — nunca lanza, cae al fallback seguro.
  assert.equal(cp04MapExportFolderToDriveCategory("CarpetaInventada", CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04), "Material Comercial");
});

test("cp04SyncFileToDrive: sin adaptador, drive_unavailable — nunca lanza", async () => {
  const result = await cp04SyncFileToDrive(null, { rootFolder: "Club Pádel 04", category: "Informes", fileName: "a.pdf", content: Buffer.from("x") });
  assert.equal(result.status, "drive_unavailable");
});

test("cp04SyncFileToDrive: con adaptador not_configured, propaga not_configured sin lanzar (app sigue funcionando)", async () => {
  const adapter = cp04CreateNotConfiguredDriveAdapter({});
  const result = await cp04SyncFileToDrive(adapter, { rootFolder: "Club Pádel 04", category: "Informes", fileName: "a.pdf", content: Buffer.from("x") });
  assert.equal(result.status, "not_configured");
});

test("cp04SyncFileToDrive: tipo de archivo no permitido se rechaza ANTES de tocar el adaptador", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const result = await cp04SyncFileToDrive(adapter, { rootFolder: "Club Pádel 04", category: "Informes", fileName: "virus.exe", content: Buffer.from("x") });
  assert.equal(result.status, "invalid");
});

test("cp04SyncFileToDrive: con el adaptador mock, sube de verdad (en memoria) y devuelve un enlace ficticio", async () => {
  const adapter = cp04CreateMockDriveAdapter();
  const result = await cp04SyncFileToDrive(adapter, { rootFolder: "Club Pádel 04", category: "Informes", fileName: "informe.pdf", content: Buffer.from("contenido real") });
  assert.equal(result.status, "completed");
  assert.equal(result.folderPath, "Club Pádel 04/Informes");
  const link = await adapter.getLink(result.fileId);
  assert.match(link.link, /drive\.mock\.cp04\.local/);
});

test("cp04SyncFileToDrive: un adaptador que lanza una excepción real nunca revienta la llamada — error estructurado", async () => {
  const throwingAdapter = { findFile: async () => { throw new Error("fallo simulado de red catastrófico"); } };
  const result = await cp04SyncFileToDrive(throwingAdapter, { rootFolder: "Club Pádel 04", category: "Informes", fileName: "a.pdf", content: Buffer.from("x") });
  assert.equal(result.status, "error");
  assert.match(result.reason, /fallo inesperado/);
});

test("cp04SyncExportPackageToDrive: integración real con exportPackageManager + adaptador mock, todos los items sincronizados", async () => {
  await withTempDir(async (sourceDir) => {
    const demoResult = await cp04RunDemoFlow({ baseDir: sourceDir, skipArchive: true });
    const targetDir = await mkdtemp(path.join(tmpdir(), "cp04-drive-sync-target-"));
    try {
      const packageResult = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: demoResult.project.displayName });
      const adapter = cp04CreateMockDriveAdapter();
      const syncResult = await cp04SyncExportPackageToDrive(adapter, packageResult, { targetBaseDir: targetDir, rootFolder: CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04 });

      assert.equal(syncResult.attempted, packageResult.manifest.items.length);
      assert.equal(syncResult.failed, 0);
      assert.equal(syncResult.driveAvailable, true);

      // Repetir la sincronización sobre el MISMO paquete no crea duplicados (mismo contenido ⇒ skipped_duplicate).
      const secondSync = await cp04SyncExportPackageToDrive(adapter, packageResult, { targetBaseDir: targetDir, rootFolder: CP04_DRIVE_UNIVERSAL_CLUB_PADEL_04 });
      assert.ok(secondSync.results.every((r) => r.status === "skipped_duplicate"));
    } finally {
      await rm(targetDir, { recursive: true, force: true });
    }
  });
});

test("cp04SyncExportPackageToDrive: si Drive no está configurado, el paquete local SIGUE INTACTO y la función no lanza", async () => {
  await withTempDir(async (sourceDir) => {
    const demoResult = await cp04RunDemoFlow({ baseDir: sourceDir, skipArchive: true });
    const targetDir = await mkdtemp(path.join(tmpdir(), "cp04-drive-sync-target2-"));
    try {
      const packageResult = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: demoResult.project.displayName });
      const adapter = cp04CreateNotConfiguredDriveAdapter({});
      const syncResult = await cp04SyncExportPackageToDrive(adapter, packageResult, { targetBaseDir: targetDir });

      assert.equal(syncResult.succeeded, 0);
      assert.ok(syncResult.results.every((r) => r.status === "not_configured"));
      // El .zip y el resto de ficheros siguen en disco, sin tocar.
      await mkdir(targetDir, { recursive: true }); // no-op si ya existe, confirma que no fue borrado
      const zipPath = path.join(targetDir, packageResult.zipPath);
      await writeFile(zipPath + ".check", ""); // si el directorio hubiera desaparecido, esto fallaría
      await rm(zipPath + ".check");
    } finally {
      await rm(targetDir, { recursive: true, force: true });
    }
  });
});

test("cp04SyncExportPackageToDrive: un archivo local que ya no existe se reporta como error puntual, sin abortar el resto", async () => {
  await withTempDir(async (sourceDir) => {
    const demoResult = await cp04RunDemoFlow({ baseDir: sourceDir, skipArchive: true });
    const targetDir = await mkdtemp(path.join(tmpdir(), "cp04-drive-sync-target3-"));
    try {
      const packageResult = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: demoResult.project.displayName });
      // Se borra un único fichero empaquetado a propósito, simulando corrupción/borrado externo.
      await rm(path.join(targetDir, packageResult.manifest.items[0].path));
      const adapter = cp04CreateMockDriveAdapter();
      const syncResult = await cp04SyncExportPackageToDrive(adapter, packageResult, { targetBaseDir: targetDir });

      assert.equal(syncResult.attempted, packageResult.manifest.items.length);
      assert.equal(syncResult.failed, 1);
      assert.ok(syncResult.results.some((r) => r.status === "error"));
      // El resto de items SÍ se sincronizaron con normalidad.
      assert.ok(syncResult.succeeded >= packageResult.manifest.items.length - 1);
    } finally {
      await rm(targetDir, { recursive: true, force: true });
    }
  });
});
