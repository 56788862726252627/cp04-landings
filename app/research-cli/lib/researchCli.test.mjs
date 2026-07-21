import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { resolveResearchRequestFromArgs, resolveFormat, loadResearchRequestFromFile, ResearchCliError, writeOutputOrPrint, runResearchDoctorChecks } from "./researchCli.mjs";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-research-cli-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("resolveResearchRequestFromArgs construye un request válido desde --demo", async () => {
  const request = await resolveResearchRequestFromArgs({ demo: "padel-web-anticuada" });
  assert.equal(request.business.sector, "padel-sports");
  assert.equal(request.mode, "offline");
  assert.ok(request.inputs.fixtures.includes("padel-web-anticuada"));
});

test("resolveResearchRequestFromArgs lanza para --demo desconocido", async () => {
  await assert.rejects(() => resolveResearchRequestFromArgs({ demo: "no-existe" }), ResearchCliError);
});

test("resolveResearchRequestFromArgs lanza si falta business-name/sector y no hay --request/--demo", async () => {
  await assert.rejects(() => resolveResearchRequestFromArgs({}), ResearchCliError);
});

test("resolveResearchRequestFromArgs construye desde flags inline (business-name/sector/fixtures)", async () => {
  const request = await resolveResearchRequestFromArgs({ "business-name": "Negocio CLI Test", sector: "dental", fixtures: "dental-branding-inconsistente" });
  assert.equal(request.business.name, "Negocio CLI Test");
  assert.deepEqual(request.inputs.fixtures, ["dental-branding-inconsistente"]);
});

test("resolveResearchRequestFromArgs respeta --online para cambiar el modo", async () => {
  const request = await resolveResearchRequestFromArgs({ "business-name": "X", sector: "dental", online: true });
  assert.equal(request.mode, "online");
});

test("resolveFormat acepta json/markdown/summary y rechaza otros valores", () => {
  assert.equal(resolveFormat({ format: "json" }), "json");
  assert.equal(resolveFormat({}), "summary");
  assert.throws(() => resolveFormat({ format: "pdf" }), ResearchCliError);
});

test("loadResearchRequestFromFile valida el contenido y lanza ResearchCliError ante JSON inválido", async () => {
  await withTempDir(async (dir) => {
    const filePath = path.join(dir, "roto.json");
    await writeFile(filePath, "{ no es json", "utf8");
    await assert.rejects(() => loadResearchRequestFromFile(filePath), ResearchCliError);
  });
});

test("loadResearchRequestFromFile carga un Research Request válido desde disco", async () => {
  await withTempDir(async (dir) => {
    const request = await resolveResearchRequestFromArgs({ "business-name": "X", sector: "dental" });
    const filePath = path.join(dir, "request.json");
    await writeFile(filePath, JSON.stringify(request), "utf8");
    const loaded = await loadResearchRequestFromFile(filePath);
    assert.equal(loaded.business.name, "X");
  });
});

test("runResearchDoctorChecks reporta salud completa cuando no hay auditorías previas (directorio inexistente no es un fallo)", async () => {
  await withTempDir(async (dir) => {
    const { ok, checks } = await runResearchDoctorChecks({ auditsDir: path.join(dir, "no-existe-todavia") });
    assert.equal(ok, true);
    assert.ok(checks.some((c) => c.id === "source_adapters_loaded" && c.ok));
    assert.ok(checks.some((c) => c.id === "dimension_registry_complete" && c.ok));
    assert.ok(checks.some((c) => c.id === "offline_default_enforced" && c.ok));
  });
});

test("runResearchDoctorChecks detecta un research-request.json corrupto en una auditoría generada", async () => {
  await withTempDir(async (dir) => {
    await import("node:fs/promises").then(({ mkdir }) => mkdir(path.join(dir, "negocio-roto"), { recursive: true }));
    await writeFile(path.join(dir, "negocio-roto", "research-request.json"), "{ esto no es json", "utf8");
    const { ok, checks } = await runResearchDoctorChecks({ auditsDir: dir });
    assert.equal(ok, false);
    assert.ok(checks.find((c) => c.id === "generated_audits_requests_still_valid" && !c.ok));
  });
});

test("writeOutputOrPrint escribe a --output cuando se indica, sin sobrescribir rutas implícitas", async () => {
  await withTempDir(async (dir) => {
    const outputPath = path.join(dir, "sub", "resultado.json");
    await writeOutputOrPrint({ output: outputPath }, '{"ok":true}');
    const { readFile } = await import("node:fs/promises");
    const content = await readFile(outputPath, "utf8");
    assert.equal(content, '{"ok":true}');
  });
});
