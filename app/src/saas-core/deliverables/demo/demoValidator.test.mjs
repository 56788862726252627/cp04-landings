import { test } from "node:test";
import assert from "node:assert/strict";
import path from "node:path";
import { tmpdir } from "node:os";
import { mkdtemp, rm, writeFile, mkdir } from "node:fs/promises";

import { cp04RunDemoFlow } from "./demoOrchestrator.js";
import { cp04ValidateDemoOutput } from "./demoValidator.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-app3-validate-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("sin baseDir devuelve inválido sin lanzar", async () => {
  const result = await cp04ValidateDemoOutput({});
  assert.equal(result.valid, false);
});

test("sobre un directorio sin manifiesto devuelve inválido con un mensaje claro", async () => {
  await withTempDir(async (dir) => {
    const result = await cp04ValidateDemoOutput({ baseDir: dir });
    assert.equal(result.valid, false);
    assert.match(result.errors[0], /manifest\.json/);
  });
});

test("sobre un paquete recién generado, la validación es válida y comprueba todos los archivos con path", async () => {
  await withTempDir(async (dir) => {
    const flow = await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    const result = await cp04ValidateDemoOutput({ baseDir: dir });
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.equal(result.checkedFiles, flow.manifest.items.filter((i) => i.path).length);
  });
});

test("detecta corrupción: si un archivo se edita manualmente después de generarse, el checksum ya no coincide", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    await writeFile(path.join(dir, "contratos", "contrato-demo.md"), "# contenido manipulado\n", "utf8");
    const result = await cp04ValidateDemoOutput({ baseDir: dir });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes("contrato-demo.md")));
  });
});

test("detecta un archivo faltante referenciado por el manifiesto", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    await rm(path.join(dir, "logos", "logo.svg"));
    const result = await cp04ValidateDemoOutput({ baseDir: dir });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes("logo.svg")));
  });
});

test("detecta un archivo denylisted colado en el árbol de salida, aunque no esté en el manifiesto", async () => {
  await withTempDir(async (dir) => {
    await cp04RunDemoFlow({ baseDir: dir, skipArchive: true });
    await mkdir(path.join(dir, "secretos"), { recursive: true });
    await writeFile(path.join(dir, "secretos", "credentials.json"), "{}", "utf8");
    const result = await cp04ValidateDemoOutput({ baseDir: dir });
    assert.equal(result.valid, false);
    assert.ok(result.deniedFiles.some((f) => f.includes("credentials.json")));
  });
});
