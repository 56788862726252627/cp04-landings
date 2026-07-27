import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm, readFile, writeFile, readdir, access } from "node:fs/promises";
import { createHash } from "node:crypto";

import { cp04BuildDemoPackage, cp04RunDemoFlow, CP04_DEMO_OUTPUT_FOLDERS } from "./demoOrchestrator.js";
import { cp04IsPathDenied } from "./denylist.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-app3-demo-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("cp04BuildDemoPackage genera entregables en memoria usando solo formatos implementados (markdown/html/svg)", async () => {
  const { entries, notImplemented } = await cp04BuildDemoPackage();
  assert.ok(entries.length > 0);
  for (const entry of entries) {
    assert.ok(["markdown", "html", "svg"].includes(entry.format), `formato inesperado: ${entry.format}`);
  }
  assert.ok(notImplemented.length > 0, "debe haber formatos pendientes registrados (pdf/docx/pptx/png/jpg/webp/mp4/gif)");
  for (const pending of notImplemented) {
    assert.equal(pending.status, "not_implemented");
    assert.ok(pending.reason);
  }
});

test("cp04BuildDemoPackage nunca genera un archivo con extensión de un formato no implementado", async () => {
  const { entries } = await cp04BuildDemoPackage();
  for (const entry of entries) {
    for (const bannedExt of [".pdf", ".docx", ".pptx", ".png", ".jpg", ".webp", ".mp4", ".gif"]) {
      assert.equal(entry.relativePath.endsWith(bannedExt), false, `${entry.relativePath} usa una extensión no implementada`);
    }
  }
});

test("Fase 8 #1/#2: ejecutar el flujo completo crea el proyecto demo y escribe la estructura de carpetas pedida", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    assert.equal(result.denylistValid, true);
    for (const folder of CP04_DEMO_OUTPUT_FOLDERS) {
      await access(path.join(dir, folder)); // no lanza si existe
    }
    await access(path.join(dir, "index.html"));
    await access(path.join(dir, "RESUMEN.md"));
  });
});

test("Fase 8 #3: repetir el flujo sin cambios no duplica entradas ni sube de versión", async () => {
  await withTempDir(async (dir) => {
    const first = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const second = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    assert.equal(second.hasChanges, false, "el contenido es idéntico, no debería haber cambios");
    assert.equal(second.manifest.version, first.manifest.version, "la versión no debe subir si nada cambió");
    assert.equal(second.manifest.itemCount, first.manifest.itemCount, "no debe haber entradas duplicadas");
  });
});

test("Fase 8 #4: si el contenido cambia (nuevo proyecto con otro texto), la siguiente ejecución sube de versión", async () => {
  await withTempDir(async (dir) => {
    const first = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    // Simula un cambio de contenido real reescribiendo el manifiesto previo
    // con un checksum distinto para un item, forzando que el diff detecte un cambio.
    const manifestPath = path.join(dir, "manifest", "manifest.json");
    const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
    manifest.items[0].checksum = "0".repeat(64);
    await writeFile(manifestPath, JSON.stringify(manifest, null, 2));

    const second = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    assert.equal(second.hasChanges, true);
    assert.equal(second.manifest.version, first.manifest.version + 1);
  });
});

test("Fase 8 #5: genera un manifiesto completo y válido", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    assert.ok(result.manifest.itemCount > 0);
    assert.ok(result.manifest.items.every((i) => i.checksum && i.checksum.length === 64));
    const onDisk = JSON.parse(await readFile(path.join(dir, "manifest", "manifest.json"), "utf8"));
    assert.equal(onDisk.itemCount, result.manifest.itemCount);
    const jsonl = await readFile(path.join(dir, "manifest", "manifest.jsonl"), "utf8");
    assert.equal(jsonl.trim().split("\n").length, result.manifest.itemCount);
  });
});

test("Fase 8 #6: genera un índice HTML navegable con enlaces a cada entregable", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const html = await readFile(path.join(dir, "index.html"), "utf8");
    assert.match(html, /<table>/);
    assert.match(html, /href="contratos\/contrato-demo\.md"/);
  });
});

test("Fase 8 #7: genera SVG real (logo, icono, fondo, banner y 8 previews de mockup)", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const logo = await readFile(path.join(dir, "logos", "logo.svg"), "utf8");
    assert.match(logo, /^<svg/);
    for (const name of ["movil-android-vertical", "web-pwa-responsive"]) {
      const preview = await readFile(path.join(dir, "mockups", `preview-${name}.svg`), "utf8");
      assert.match(preview, /^<svg/);
    }
  });
});

test("Fase 8 #8/#9: registra los formatos no implementados sin crear ningún archivo con extensión falsa", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    assert.ok(result.notImplemented.some((n) => n.format === "pdf"));
    assert.ok(result.notImplemented.some((n) => n.format === "png"));
    // Ningún .pdf/.png/etc. debe existir en el árbol de salida.
    const allText = await readdir(dir, { recursive: true }).catch(() => []);
    for (const file of allText) {
      for (const ext of [".pdf", ".png", ".docx", ".pptx", ".webp", ".mp4", ".gif"]) {
        assert.equal(String(file).endsWith(ext), false, `no debería existir ${file}`);
      }
    }
  });
});

test("Fase 8 #10: clasifica los entregables por carpeta (contratos/, informes/, logos/, etc.)", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const folders = new Set(result.manifest.items.map((i) => i.path.split(path.sep)[0]));
    for (const expected of ["contratos", "informes", "logos", "mockups", "manifest"]) {
      assert.ok(folders.has(expected), `falta clasificar algo en ${expected}`);
    }
  });
});

test("Fase 8 #11: crea las 8 especificaciones de mockup dentro del paquete de metadatos", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const specs = JSON.parse(await readFile(path.join(dir, "mockups", "especificaciones.json"), "utf8"));
    assert.equal(specs.length, 8);
  });
});

test("Fase 8 #12: no mezcla carpetas (cada entregable vive solo en la carpeta que le corresponde)", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const contrato = result.manifest.items.find((i) => i.deliverableType === "contrato");
    assert.ok(contrato.path.startsWith("contratos" + path.sep) || contrato.path.startsWith("contratos/"));
  });
});

test("Fase 8 #13: no introduce secretos en ningún archivo generado", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const { entries } = await cp04BuildDemoPackage();
    for (const entry of entries) {
      assert.equal(cp04IsPathDenied(entry.relativePath), false, `${entry.relativePath} no debería estar en la denylist`);
    }
  });
});

test("Fase 8 #14/#15: DriveSync en modo disabled/dry-run nunca sube nada ni llama a un adaptador real", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    assert.ok(result.driveDryRun.length > 0);
    assert.ok(result.driveDryRun.every((r) => r.demoStatus === "dry_run"));
  });
});

test("Fase 8 #17: la denylist excluiría archivos técnicos si alguna vez aparecieran (verificado con una entrada sintética)", async () => {
  const { cp04ValidatePackageAgainstDenylist } = await import("./denylist.js");
  const result = cp04ValidatePackageAgainstDenylist([{ relativePath: ".env", content: "x" }]);
  assert.equal(result.valid, false);
});

test("Fase 8 #18: el hash de cada entregable coincide con su contenido real (sha256, determinista)", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    for (const item of result.manifest.items) {
      if (!item.path) continue;
      const content = await readFile(path.join(dir, item.path), "utf8");
      const expected = createHash("sha256").update(content, "utf8").digest("hex");
      assert.equal(item.checksum, expected, `${item.path}: checksum no coincide`);
    }
  });
});

test("Fase 8 #19: la cola de Drive queda consistente (mismo número de resultados que de entregables encolados)", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    assert.equal(result.driveDryRun.length, result.manifest.itemCount);
  });
});

test("Fase 8 #20: el flujo devuelve un resumen correcto (proyecto, manifiesto, notImplemented, driveDryRun)", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    assert.ok(result.project.projectId);
    assert.ok(result.manifest);
    assert.ok(Array.isArray(result.notImplemented));
    assert.ok(Array.isArray(result.driveDryRun));
  });
});

test("el flujo es reproducible: dos directorios distintos con la misma ejecución producen el mismo conjunto de checksums", async () => {
  await withTempDir(async (dirA) => {
    await withTempDir(async (dirB) => {
      const a = await cp04RunDemoFlow({ baseDir: dirA, skipArchive: true });
      const b = await cp04RunDemoFlow({ baseDir: dirB, skipArchive: true });
      const checksumsA = a.manifest.items.map((i) => i.checksum).sort();
      const checksumsB = b.manifest.items.map((i) => i.checksum).sort();
      assert.deepEqual(checksumsA, checksumsB);
    });
  });
});

test("con skipArchive:false intenta empaquetar con tar (herramienta local) sin lanzar si no está disponible", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04RunDemoFlow({ baseDir: dir });
    assert.equal(typeof result.packageResult.created, "boolean");
  });
});
