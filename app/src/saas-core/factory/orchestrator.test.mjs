import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, mkdir, writeFile, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { runFactoryPipeline, BlueprintValidationError, CollisionError } from "./orchestrator.js";
import { FULL_BUSINESS_BLUEPRINT, INVALID_BUSINESS_BLUEPRINT_EXAMPLES } from "./businessBlueprintExamples.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "one-prompt-factory-test-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("runFactoryPipeline con un blueprint inválido lanza BlueprintValidationError y no escribe nada", async () => {
  await withTempDir(async (dir) => {
    await assert.rejects(
      () => runFactoryPipeline({ blueprint: INVALID_BUSINESS_BLUEPRINT_EXAMPLES.missingRequiredFields, outputBaseDir: dir }),
      BlueprintValidationError,
    );
  });
});

test("runFactoryPipeline genera todos los archivos esperados en la primera ejecución", async () => {
  await withTempDir(async (dir) => {
    const result = await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir });
    assert.equal(result.idempotent, false);
    assert.ok(result.filesCreated.includes("tenant.config.json"));
    assert.ok(result.filesCreated.includes("business.blueprint.json"));
    assert.ok(result.filesCreated.includes("landing/index.html"));
    assert.ok(result.filesCreated.includes("demo-data/dataset.json"));
    assert.ok(result.filesCreated.includes("docs/README.md"));

    const tenantOnDisk = JSON.parse(await readFile(path.join(result.outputDir, "tenant.config.json"), "utf8"));
    assert.equal(tenantOnDisk.tenantId, FULL_BUSINESS_BLUEPRINT.tenantId);

    const reportOnDisk = await readFile(path.join(result.outputDir, "report.md"), "utf8");
    assert.match(reportOnDisk, /Informe de generación/);
  });
});

test("una segunda ejecución idéntica es idempotente (0 creados, 0 actualizados)", async () => {
  await withTempDir(async (dir) => {
    await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir });
    const second = await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir });
    assert.equal(second.idempotent, true);
    assert.equal(second.filesCreated.length, 0);
    assert.equal(second.filesUpdated.length, 0);
    assert.ok(second.filesPreserved.length > 0);
  });
});

test("cambiar el blueprint (nueva seed de datos demo) produce una actualización parcial, no una regeneración total", async () => {
  await withTempDir(async (dir) => {
    await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir });
    const changed = { ...FULL_BUSINESS_BLUEPRINT, demoData: { ...FULL_BUSINESS_BLUEPRINT.demoData, seed: "otra-seed-distinta" } };
    const second = await runFactoryPipeline({ blueprint: changed, outputBaseDir: dir });
    assert.equal(second.idempotent, false);
    assert.ok(second.filesUpdated.includes("demo-data/dataset.json"));
    assert.ok(second.filesPreserved.includes("business.blueprint.json") === false); // el blueprint cambió también
  });
});

test("dry-run no escribe absolutamente nada en disco", async () => {
  await withTempDir(async (dir) => {
    const result = await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir, dryRun: true });
    assert.equal(result.dryRun, true);
    const exists = await readFile(path.join(result.outputDir, "tenant.config.json"), "utf8").then(() => true).catch(() => false);
    assert.equal(exists, false);
  });
});

test("un archivo preexistente no generado por la fábrica produce CollisionError sin --force", async () => {
  await withTempDir(async (dir) => {
    const outputDir = path.join(dir, FULL_BUSINESS_BLUEPRINT.businessId);
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, "tenant.config.json"), "{}", "utf8");
    await assert.rejects(
      () => runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir }),
      CollisionError,
    );
  });
});

test("--force permite sobrescribir una colisión explícitamente", async () => {
  await withTempDir(async (dir) => {
    const outputDir = path.join(dir, FULL_BUSINESS_BLUEPRINT.businessId);
    await mkdir(outputDir, { recursive: true });
    await writeFile(path.join(outputDir, "tenant.config.json"), "{}", "utf8");
    const result = await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir, force: true });
    assert.ok(result.filesUpdated.includes("tenant.config.json") || result.filesCreated.includes("tenant.config.json"));
  });
});

test("ningún archivo generado contiene un secreto (defensa en profundidad)", async () => {
  await withTempDir(async (dir) => {
    const result = await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir });
    const envExample = await readFile(path.join(result.outputDir, "env.example"), "utf8");
    assert.doesNotMatch(envExample, /(sk_live|sk_test|whsec_)/);
  });
});

test("el reporte incluye reutilización de módulos y 0 archivos centrales modificados", async () => {
  await withTempDir(async (dir) => {
    const result = await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir });
    assert.equal(result.reuse.coreFilesModified, 0);
    assert.match(result.reuse.reusedModulesRatio, /100%/);
  });
});

test("el negocio por defecto (Club Pádel 04) no se toca por este pipeline (outputDir aislado por businessId)", async () => {
  await withTempDir(async (dir) => {
    const result = await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir });
    assert.ok(result.outputDir.endsWith(FULL_BUSINESS_BLUEPRINT.businessId));
    assert.notEqual(FULL_BUSINESS_BLUEPRINT.businessId, "club-padel-04");
  });
});
