import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm, mkdir, writeFile, readFile, readdir } from "node:fs/promises";
import { deflateSync } from "node:zlib";
import { Buffer } from "node:buffer";
import { createHash } from "node:crypto";

import { cp04BuildFinalExportPackage, resolveStandardFolder } from "./exportPackageManager.js";
import { cp04ListZipEntries } from "./packageZip.js";
import { cp04RunDemoFlow } from "../demo/demoOrchestrator.js";
import {
  cp04RunPrompt4DemoFlow, cp04BuildClinicaDentalNovaPlan, cp04BuildClinicaDentalNovaBrief,
} from "../demo/demo4Orchestrator.js";

function sha(buf) {
  return createHash("sha256").update(buf).digest("hex");
}

// Mismo PNG mínimo real y válido que screenshotEngine.test.mjs — sin necesitar Chromium.
function buildTinyValidPng(width, height, fillByte = 128) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crc = Buffer.alloc(4);
    return Buffer.concat([len, typeBuf, data, crc]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 2;
  const raw = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset] = 0;
    offset += 1;
    for (let x = 0; x < width; x++) {
      raw[offset] = (fillByte + ((x + y) % 7)) % 256;
      raw[offset + 1] = fillByte;
      raw[offset + 2] = fillByte;
      offset += 3;
    }
  }
  const idatData = deflateSync(raw);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idatData), chunk("IEND", Buffer.alloc(0))]);
}

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-package-test-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

/** Construye un directorio de origen sintético con manifest.json (texto) + mockups-manifest.json (captura), sin Chromium. */
async function buildSyntheticSourceDir(dir) {
  await mkdir(path.join(dir, "contratos"), { recursive: true });
  await mkdir(path.join(dir, "manifest"), { recursive: true });
  await mkdir(path.join(dir, "mockups", "android-mobile"), { recursive: true });

  const contractContent = "# Contrato\n\nTexto real del contrato.\n";
  const contractChecksum = sha(Buffer.from(contractContent, "utf8"));
  await writeFile(path.join(dir, "contratos", "contrato.md"), contractContent, "utf8");
  const manifest = {
    manifestVersion: 1, projectId: "p1", projectName: "Proyecto Sintético", generatedAt: new Date().toISOString(), version: 1, itemCount: 1,
    items: [{ id: "contrato_md", deliverableType: "contrato", format: "markdown", path: "contratos/contrato.md", status: "validated", checksum: contractChecksum }],
  };
  await writeFile(path.join(dir, "manifest", "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

  const png = buildTinyValidPng(20, 20);
  const pngChecksum = sha(png);
  await writeFile(path.join(dir, "mockups", "android-mobile", "android-mobile-index-raw.png"), png);
  const mockupsManifest = {
    manifestVersion: 1, projectId: "p1", projectName: "Proyecto Sintético", generatedAt: new Date().toISOString(), version: 1, itemCount: 1,
    items: [{ id: "android-mobile-index_raw", deliverableType: "mockup_raw_capture", format: "png", path: "mockups/android-mobile/android-mobile-index-raw.png", status: "validated", checksum: pngChecksum }],
  };
  await writeFile(path.join(dir, "mockups", "mockups-manifest.json"), JSON.stringify(mockupsManifest, null, 2), "utf8");

  return { contractChecksum, pngChecksum };
}

test("resolveStandardFolder mapea tipos conocidos y cae a Documentación para desconocidos", () => {
  assert.equal(resolveStandardFolder("contrato"), "Contratos");
  assert.equal(resolveStandardFolder("mockup_raw_capture"), "Mockups");
  assert.equal(resolveStandardFolder("documentacion_comercial_preview"), "Documentación");
  assert.equal(resolveStandardFolder("tipo-totalmente-desconocido"), "Documentación");
});

test("sin sourceBaseDir/targetBaseDir/projectName, falla explicando qué falta", async () => {
  await assert.rejects(() => cp04BuildFinalExportPackage({}), /sourceBaseDir/);
  await assert.rejects(() => cp04BuildFinalExportPackage({ sourceBaseDir: "/x" }), /targetBaseDir/);
  await assert.rejects(() => cp04BuildFinalExportPackage({ sourceBaseDir: "/x", targetBaseDir: "/y" }), /projectName/);
});

test("sin ningún manifiesto de origen, falla con un mensaje claro (nunca produce un paquete vacío silencioso)", async () => {
  await withTempDir(async (dir) => {
    await assert.rejects(
      () => cp04BuildFinalExportPackage({ sourceBaseDir: path.join(dir, "no-existe"), targetBaseDir: path.join(dir, "target"), projectName: "X" }),
      /no se encontró ningún manifiesto de origen/
    );
  });
});

test("agrega texto (manifest.json) + captura (mockups-manifest.json) del mismo proyecto en un único paquete final", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    await buildSyntheticSourceDir(sourceDir);
    const result = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: path.join(dir, "target"), projectName: "Proyecto Sintético" });
    assert.equal(result.failed.length, 0, JSON.stringify(result.failed));
    assert.equal(result.packagedCount, 2);
    const types = result.manifest.items.map((i) => i.deliverableType).sort();
    assert.deepEqual(types, ["contrato", "mockup_raw_capture"]);
  });
});

test("crea la estructura estándar completa de 11 carpetas (FolderStructure, Prompt 1/6), incluida Vídeos vacía", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    await buildSyntheticSourceDir(sourceDir);
    const targetDir = path.join(dir, "target");
    await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: "Proyecto Sintético" });
    const folders = (await readdir(targetDir, { withFileTypes: true })).filter((e) => e.isDirectory()).map((e) => e.name).sort();
    assert.deepEqual(folders, ["Contratos", "Documentación", "Fondos", "Iconos", "Informes", "Logos", "Marketing", "Mockups", "PDFs", "Presentaciones", "Vídeos", "manifest"].sort());
    const videos = await readdir(path.join(targetDir, "Vídeos"));
    assert.deepEqual(videos, [], "Vídeos existe pero está vacía (sin motor de vídeo todavía)");
  });
});

test("un item con checksum de origen corrupto (no coincide con el manifiesto) se excluye del paquete, nunca se empaqueta silenciosamente", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    await buildSyntheticSourceDir(sourceDir);
    // Corromper el contrato en disco DESPUÉS de escribir el manifiesto con el checksum bueno.
    await writeFile(path.join(sourceDir, "contratos", "contrato.md"), "contenido alterado, no coincide con el checksum", "utf8");

    const result = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: path.join(dir, "target"), projectName: "X" });
    assert.equal(result.packagedCount, 1, "solo el PNG (sin alterar) debería empaquetarse");
    assert.equal(result.failed.length, 1);
    assert.match(result.failed[0].reason, /checksum no coincide/);
  });
});

test("un item cuyo archivo de origen no existe en disco se excluye con un motivo explícito", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    await buildSyntheticSourceDir(sourceDir);
    const manifestPath = path.join(sourceDir, "manifest", "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.items.push({ id: "fantasma", deliverableType: "informe", format: "markdown", path: "no-existe/fantasma.md", status: "validated", checksum: "x".repeat(64) });
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

    const result = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: path.join(dir, "target"), projectName: "X" });
    assert.ok(result.failed.some((f) => f.id === "fantasma" && /no encontrado/.test(f.reason)));
  });
});

test("un PNG corrompido (bytes reales corruptos, mismo checksum registrado) se excluye por fallar su propia validación de formato", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    const { pngChecksum: _pngChecksum } = await buildSyntheticSourceDir(sourceDir);
    // Sustituir el PNG por bytes con la MISMA longitud+checksum recalculado pero estructura PNG inválida.
    const fakePngLikeBuffer = Buffer.from("no soy un PNG real aunque tenga bytes");
    const fakeChecksum = sha(fakePngLikeBuffer);
    const manifestPath = path.join(sourceDir, "mockups", "mockups-manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.items[0].checksum = fakeChecksum; // el checksum SÍ coincide con el archivo corrupto (simula corrupción consistente)
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");
    await writeFile(path.join(sourceDir, manifest.items[0].path), fakePngLikeBuffer);

    const result = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: path.join(dir, "target"), projectName: "X" });
    assert.ok(result.failed.some((f) => f.deliverableType === "mockup_raw_capture" && /validación de formato/.test(f.reason)));
  });
});

test("idempotencia: repetir sobre el mismo origen sin cambios no duplica, no sube de versión, y produce un .zip byte a byte idéntico", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    await buildSyntheticSourceDir(sourceDir);
    const targetDir = path.join(dir, "target");
    const first = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: "Proyecto Sintético" });
    const second = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: "Proyecto Sintético" });
    assert.equal(second.hasChanges, false);
    assert.equal(second.manifest.version, first.manifest.version);
    assert.equal(second.zipChecksum, first.zipChecksum, "el .zip debe ser byte a byte idéntico si el origen no cambió");
  });
});

test("un cambio real en el origen sí sube de versión y produce un .zip distinto", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    await buildSyntheticSourceDir(sourceDir);
    const targetDir = path.join(dir, "target");
    const first = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: "Proyecto Sintético" });

    // Cambio real: nuevo contenido + su checksum actualizado en el manifiesto de origen.
    const newContent = "# Contrato\n\nTexto real del contrato, ACTUALIZADO.\n";
    await writeFile(path.join(sourceDir, "contratos", "contrato.md"), newContent, "utf8");
    const manifestPath = path.join(sourceDir, "manifest", "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.items[0].checksum = sha(Buffer.from(newContent, "utf8"));
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf8");

    const second = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: "Proyecto Sintético" });
    assert.equal(second.hasChanges, true);
    assert.equal(second.manifest.version, first.manifest.version + 1);
    assert.notEqual(second.zipChecksum, first.zipChecksum);
  });
});

test("el manifiesto final (paquete-final.json) es válido y contiene checksum + versionChecksum por item", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    await buildSyntheticSourceDir(sourceDir);
    const targetDir = path.join(dir, "target");
    await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: "X" });
    const manifest = JSON.parse(await readFile(path.join(targetDir, "manifest", "paquete-final.json"), "utf8"));
    assert.equal(manifest.manifestVersion, 1);
    for (const item of manifest.items) {
      assert.ok(item.checksum);
      assert.ok(item.versionChecksum);
    }
  });
});

test("el .zip final contiene todos los entregables + index.html + README.md + manifiesto, y es un ZIP real abrible", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    await buildSyntheticSourceDir(sourceDir);
    const targetDir = path.join(dir, "target");
    const result = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: targetDir, projectName: "X" });
    const zipBuffer = await readFile(path.join(targetDir, result.zipPath));
    const entries = await cp04ListZipEntries(zipBuffer);
    assert.ok(entries.includes("index.html"));
    assert.ok(entries.includes("README.md"));
    assert.ok(entries.includes("manifest/paquete-final.json"));
    assert.ok(entries.some((e) => e.startsWith("Contratos/")));
    assert.ok(entries.some((e) => e.startsWith("Mockups/")));
  });
});

test("colisión de nombres de archivo dentro de la misma carpeta destino: ambos se conservan con nombres únicos, ninguno se pierde", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    await mkdir(path.join(sourceDir, "informes"), { recursive: true });
    await mkdir(path.join(sourceDir, "documentacion"), { recursive: true });
    await mkdir(path.join(sourceDir, "manifest"), { recursive: true });
    const c1 = "contenido informe 1";
    const c2 = "contenido informe 2, de otro tipo pero mismo nombre base";
    await writeFile(path.join(sourceDir, "informes", "reporte.md"), c1, "utf8");
    await writeFile(path.join(sourceDir, "documentacion", "reporte.md"), c2, "utf8");
    const manifest = {
      manifestVersion: 1, projectId: "p1", projectName: "X", generatedAt: new Date().toISOString(), version: 1, itemCount: 2,
      items: [
        { id: "i1", deliverableType: "informe", format: "markdown", path: "informes/reporte.md", status: "validated", checksum: sha(Buffer.from(c1)) },
        { id: "i2", deliverableType: "documentacion_tecnica", format: "markdown", path: "documentacion/reporte.md", status: "validated", checksum: sha(Buffer.from(c2)) },
      ],
    };
    await writeFile(path.join(sourceDir, "manifest", "manifest.json"), JSON.stringify(manifest, null, 2), "utf8");

    const result = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: path.join(dir, "target"), projectName: "X" });
    assert.equal(result.failed.length, 0);
    assert.equal(result.packagedCount, 2);
    const paths = result.manifest.items.map((i) => i.path);
    assert.equal(new Set(paths).size, 2, "las dos rutas finales deben ser distintas entre sí");
  });
});

test("integración real: empaqueta el output real de Demo4Orchestrator (Prompt 4/6, binarios reales) sin ningún fallo", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    const brief = cp04BuildClinicaDentalNovaBrief();
    const plan = cp04BuildClinicaDentalNovaPlan(brief);
    await cp04RunPrompt4DemoFlow({ baseDir: sourceDir, brief, plan });

    const result = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: path.join(dir, "target"), projectName: brief.displayName });
    assert.equal(result.failed.length, 0, JSON.stringify(result.failed));
    assert.equal(result.packagedCount, 12);
  });
});

test("integración real: empaqueta el output real de DemoOrchestrator (Prompt 2/6, texto/SVG) sin ningún fallo", async () => {
  await withTempDir(async (dir) => {
    const sourceDir = path.join(dir, "source");
    await cp04RunDemoFlow({ baseDir: sourceDir, skipArchive: true });
    const result = await cp04BuildFinalExportPackage({ sourceBaseDir: sourceDir, targetBaseDir: path.join(dir, "target"), projectName: "Clínica De Fisioterapia Málaga (demo)" });
    assert.equal(result.failed.length, 0, JSON.stringify(result.failed));
    assert.ok(result.packagedCount > 0);
  });
});
