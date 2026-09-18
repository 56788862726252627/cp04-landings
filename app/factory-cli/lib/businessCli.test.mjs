import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  parseCliArgs,
  resolveBlueprintFromArgs,
  validateBusinessDeep,
  listGeneratedBusinesses,
  listCatalog,
  buildPreview,
  runDoctorChecks,
  diffBusiness,
  runFactoryPipeline,
  loadGeneratedBusinessStatusInputs,
  loadAllGeneratedBusinessStatusInputs,
  BusinessCliError,
} from "./businessCli.mjs";
import { FULL_BUSINESS_BLUEPRINT, INVALID_BUSINESS_BLUEPRINT_EXAMPLES } from "../../src/saas-core/factory/businessBlueprintExamples.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "one-prompt-factory-cli-test-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("resolveBlueprintFromArgs con --example=full devuelve el blueprint de clínica dental", async () => {
  const blueprint = await resolveBlueprintFromArgs(parseCliArgs(["--example=full"]));
  assert.equal(blueprint.sector, "dental");
});

test("resolveBlueprintFromArgs sin ningún flag lanza BusinessCliError", async () => {
  await assert.rejects(() => resolveBlueprintFromArgs(parseCliArgs([])), BusinessCliError);
});

test("resolveBlueprintFromArgs con --blueprint=<archivo inexistente> lanza BusinessCliError legible", async () => {
  await assert.rejects(() => resolveBlueprintFromArgs(parseCliArgs(["--blueprint=/no/existe.json"])), BusinessCliError);
});

test("resolveBlueprintFromArgs con --blueprint=<archivo real> lo carga correctamente", async () => {
  await withTempDir(async (dir) => {
    const file = path.join(dir, "b.json");
    await writeFile(file, JSON.stringify(FULL_BUSINESS_BLUEPRINT), "utf8");
    const blueprint = await resolveBlueprintFromArgs(parseCliArgs([`--blueprint=${file}`]));
    assert.equal(blueprint.businessId, FULL_BUSINESS_BLUEPRINT.businessId);
  });
});

test("validateBusinessDeep acepta el blueprint completo y detecta ausencia de warnings de contraste", () => {
  const { valid, warnings } = validateBusinessDeep(FULL_BUSINESS_BLUEPRINT);
  assert.equal(valid, true);
  assert.deepEqual(warnings, []);
});

test("validateBusinessDeep rechaza un blueprint con campos obligatorios ausentes", () => {
  const { valid, errors } = validateBusinessDeep(INVALID_BUSINESS_BLUEPRINT_EXAMPLES.missingRequiredFields);
  assert.equal(valid, false);
  assert.ok(errors.length > 0);
});

test("listCatalog devuelve plantillas y presets no vacíos", () => {
  const { templates, presets } = listCatalog();
  assert.ok(templates.length > 0);
  assert.ok(presets.length > 0);
});

test("buildPreview no escribe nada y devuelve navegación + branding + landing", () => {
  const preview = buildPreview(FULL_BUSINESS_BLUEPRINT);
  assert.ok(preview.navigationByRole.ADMIN.length > 0);
  assert.ok(preview.brandTokens.colors.primary);
  assert.ok(preview.landingConfig.sectionsEnabled.length > 0);
});

test("listGeneratedBusinesses en un directorio vacío devuelve []", async () => {
  await withTempDir(async (dir) => {
    const list = await listGeneratedBusinesses({ baseDir: path.join(dir, "no-existe") });
    assert.deepEqual(list, []);
  });
});

test("listGeneratedBusinesses lista un negocio tras generarlo", async () => {
  await withTempDir(async (dir) => {
    await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir });
    const list = await listGeneratedBusinesses({ baseDir: dir });
    assert.equal(list.length, 1);
    assert.equal(list[0].businessId, FULL_BUSINESS_BLUEPRINT.businessId);
  });
});

test("diffBusiness contra un directorio vacío reporta todo como 'a crear' y no escribe nada", async () => {
  await withTempDir(async (dir) => {
    const diff = await diffBusiness({ blueprint: FULL_BUSINESS_BLUEPRINT, baseDir: dir });
    assert.ok(diff.wouldCreate.includes("tenant.config.json"));
    const list = await listGeneratedBusinesses({ baseDir: dir });
    assert.deepEqual(list, []);
  });
});

test("loadGeneratedBusinessStatusInputs carga report.json + tenant.config.json de un negocio ya generado", async () => {
  await withTempDir(async (dir) => {
    await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir });
    const { report, tenantConfig } = await loadGeneratedBusinessStatusInputs({ businessId: FULL_BUSINESS_BLUEPRINT.businessId, baseDir: dir });
    assert.equal(report.businessId, FULL_BUSINESS_BLUEPRINT.businessId);
    assert.equal(tenantConfig.tenantId, FULL_BUSINESS_BLUEPRINT.tenantId);
  });
});

test("loadGeneratedBusinessStatusInputs de un negocio inexistente lanza BusinessCliError legible", async () => {
  await withTempDir(async (dir) => {
    await assert.rejects(() => loadGeneratedBusinessStatusInputs({ businessId: "no-existe", baseDir: dir }), BusinessCliError);
  });
});

// --- loadAllGeneratedBusinessStatusInputs (Prompt Agencia IA 5/7) ---

test("loadAllGeneratedBusinessStatusInputs en directorio vacío devuelve {loaded:[], errors:[]}", async () => {
  await withTempDir(async (dir) => {
    const { loaded, errors } = await loadAllGeneratedBusinessStatusInputs({ baseDir: dir });
    assert.deepEqual(loaded, []);
    assert.deepEqual(errors, []);
  });
});

test("loadAllGeneratedBusinessStatusInputs carga todos los negocios disponibles sin lanzar", async () => {
  await withTempDir(async (dir) => {
    await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir });
    const { loaded, errors } = await loadAllGeneratedBusinessStatusInputs({ baseDir: dir });
    assert.equal(loaded.length, 1);
    assert.equal(errors.length, 0);
    assert.equal(loaded[0].businessId, FULL_BUSINESS_BLUEPRINT.businessId);
    assert.ok(loaded[0].report);
    assert.ok(loaded[0].tenantConfig);
  });
});

test("loadAllGeneratedBusinessStatusInputs documenta los negocios corruptos en 'errors', nunca lanza", async () => {
  await withTempDir(async (dir) => {
    // Un negocio con business.blueprint.json pero sin report.json ni tenant.config.json:
    // listGeneratedBusinesses lo encontrará, pero loadGeneratedBusinessStatusInputs fallará.
    const { mkdir: _mkdir } = await import("node:fs/promises");
    const corruptDir = path.join(dir, "negocio-corrupto");
    await _mkdir(corruptDir, { recursive: true });
    await writeFile(
      path.join(corruptDir, "business.blueprint.json"),
      JSON.stringify({ businessId: "negocio-corrupto", commercialName: "Corrupto", sector: "padel", plan: "starter" }),
      "utf8"
    );
    // Generar uno real para confirmar que sigue funcionando en paralelo
    await runFactoryPipeline({ blueprint: FULL_BUSINESS_BLUEPRINT, outputBaseDir: dir });
    const { loaded, errors } = await loadAllGeneratedBusinessStatusInputs({ baseDir: dir });
    assert.equal(loaded.length, 1);
    assert.equal(errors.length, 1);
    assert.equal(errors[0].businessId, "negocio-corrupto");
    assert.ok(typeof errors[0].error === "string");
  });
});

test("runDoctorChecks se ejecuta sin lanzar y siempre marca las integraciones como not_implemented", async () => {
  await withTempDir(async (dir) => {
    const { ok, checks } = await runDoctorChecks({ baseDir: path.join(dir, "businesses") });
    assert.equal(typeof ok, "boolean");
    const extCheck = checks.find((c) => c.id === "all_extension_points_not_implemented");
    assert.equal(extCheck.ok, true);
  });
});
