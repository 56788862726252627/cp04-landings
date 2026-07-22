import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile, writeFile, mkdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import { runResearchAudit, RequestValidationError, PolicyViolationError, AuditCollisionError, StrictModeBlockedError, RESEARCH_MANIFEST_FILENAME } from "./auditOrchestrator.js";
import { buildResearchRequest } from "./researchRequestSchema.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(os.tmpdir(), "cp04-research-audit-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("runResearchAudit lanza RequestValidationError para un request inválido", async () => {
  await assert.rejects(() => runResearchAudit({}), RequestValidationError);
});

test("runResearchAudit lanza PolicyViolationError si una URL viola la política (SSRF)", async () => {
  const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, mode: "online", inputs: { urls: ["http://127.0.0.1/"] } });
  await assert.rejects(() => runResearchAudit(request), PolicyViolationError);
});

test("runResearchAudit --dry-run no escribe ningún archivo", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Negocio Dry Run", sector: "dental" }, inputs: { fixtures: ["dental-branding-inconsistente"] } });
    const result = await runResearchAudit(request, { dryRun: true, outputBaseDir: dir });
    assert.equal(result.dryRun, true);
    assert.ok(result.filesCreated.length > 0);
    await assert.rejects(() => readFile(path.join(dir, result.auditId, RESEARCH_MANIFEST_FILENAME)));
  });
});

test("runResearchAudit --dry-run NUNCA realiza red real aunque se pida allowNetwork:true (Paso 13, Fase 4)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Negocio Dry Run Red", sector: "dental" }, mode: "public-web", inputs: { urls: ["https://ejemplo-no-deberia-tocarse.invalid/"] } });
    const result = await runResearchAudit(request, { dryRun: true, allowNetwork: true, outputBaseDir: dir });
    assert.equal(result.networkUsed, false);
    const unavailable = result.evidence.find((e) => e.classification === "unavailable");
    assert.ok(unavailable, "en dry-run, la URL debe quedar 'unavailable' — nunca se consulta de verdad");
  });
});

test("runResearchAudit produce evidencia real y scores a partir de una fixture (padel-web-anticuada)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel Test", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir });
    assert.ok(result.evidence.length > 0);
    assert.ok(result.scores.global.score !== null);
    assert.equal(result.filesCreated.length > 0, true);
    const manifest = JSON.parse(await readFile(path.join(dir, result.auditId, RESEARCH_MANIFEST_FILENAME), "utf8"));
    assert.equal(manifest.auditId, result.auditId);
  });
});

test("runResearchAudit es idempotente: segunda ejecución sobre el mismo request produce 0 creados/0 actualizados", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Pádel Idempotente", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada"] } });
    const first = await runResearchAudit(request, { outputBaseDir: dir });
    const second = await runResearchAudit(request, { outputBaseDir: dir });
    assert.ok(first.filesCreated.length > 0);
    assert.equal(second.filesCreated.length, 0);
    assert.equal(second.filesUpdated.length, 0);
    assert.equal(second.filesPreserved.length, first.filesCreated.length);
  });
});

test("runResearchAudit detecta colisión si un archivo ya existe sin haber sido generado por la auditoría", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Colision", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada"] } });
    const auditId = "club-colision";
    await mkdir(path.join(dir, auditId), { recursive: true });
    await writeFile(path.join(dir, auditId, "research-request.json"), "archivo manual preexistente", "utf8");
    await assert.rejects(() => runResearchAudit(request, { outputBaseDir: dir }), AuditCollisionError);
  });
});

test("runResearchAudit con force:true sobrescribe una colisión explícitamente", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Force", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada"] } });
    const auditId = "club-force";
    await mkdir(path.join(dir, auditId), { recursive: true });
    await writeFile(path.join(dir, auditId, "research-request.json"), "archivo manual preexistente", "utf8");
    const result = await runResearchAudit(request, { outputBaseDir: dir, force: true });
    assert.ok(result.filesCreated.includes("research-request.json") || result.filesUpdated.includes("research-request.json"));
  });
});

test("runResearchAudit sobre una URL sin fixture produce evidencia 'unavailable', nunca una conexión real", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, mode: "offline", inputs: { urls: ["https://ejemplo-sin-fixture.invalid/"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir });
    const unavailable = result.evidence.find((e) => e.classification === "unavailable");
    assert.ok(unavailable);
  });
});

test("runResearchAudit con mode='public-web' pero SIN --allow-network sigue produciendo evidencia 'unavailable' (seguro por defecto)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, mode: "public-web", inputs: { urls: ["https://ejemplo-sin-fixture.invalid/"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir }); // allowNetwork NO se pasa (default false)
    assert.equal(result.networkUsed, false);
    const unavailable = result.evidence.find((e) => e.classification === "unavailable");
    assert.ok(unavailable);
  });
});

test("runResearchAudit con allowNetwork:true pero mode='offline' NO activa red (el modo manda)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, mode: "offline", inputs: { urls: ["https://ejemplo-sin-fixture.invalid/"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir, allowNetwork: true });
    assert.equal(result.networkUsed, false);
  });
});

test("runResearchAudit con mode='public-web' y allowNetwork:true bloquea SSRF para una URL privada YA en la capa de política (antes de intentar recolectar)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "X", sector: "dental" }, mode: "public-web", inputs: { urls: ["http://127.0.0.1/"] } });
    await assert.rejects(() => runResearchAudit(request, { outputBaseDir: dir, allowNetwork: true }), PolicyViolationError);
  });
});

test("runResearchAudit detecta contradicción cuando HTML y JSON de una misma fixture se contradicen (fuentes-contradictorias)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Peluquería Contraste Test", sector: "hair-beauty" }, inputs: { fixtures: ["fuentes-contradictorias"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir });
    const booking = result.dimensionResults.bookingCapability;
    assert.ok(booking.contradictions.length > 0, "se esperaba una contradicción detectada en bookingCapability");
  });
});

test("runResearchAudit con un negocio sin ninguna fuente produce mayoritariamente dimensiones 'unknown', no falsas conclusiones", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Negocio Sin Datos Test", sector: "generic-local-service" } });
    const result = await runResearchAudit(request, { outputBaseDir: dir });
    const unknownCount = Object.values(result.dimensionResults).filter((d) => d.status === "unknown").length;
    assert.ok(unknownCount > 30, `se esperaban muchas dimensiones unknown, hubo ${unknownCount}`);
    assert.equal(result.evidence.length, 0);
  });
});

test("runResearchAudit --strict bloquea (sin escribir nada) cuando hay contradicciones sin resolver (fuentes-contradictorias)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Peluquería Contraste Strict", sector: "hair-beauty" }, inputs: { fixtures: ["fuentes-contradictorias"] } });
    await assert.rejects(() => runResearchAudit(request, { outputBaseDir: dir, strict: true }), StrictModeBlockedError);
    await assert.rejects(() => readFile(path.join(dir, "peluqueria-contraste-strict", RESEARCH_MANIFEST_FILENAME)));
  });
});

test("runResearchAudit --strict NO bloquea cuando no hay contradicciones (caso normal)", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Strict OK", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir, strict: true });
    assert.ok(result.filesCreated.length > 0);
  });
});

test("runResearchAudit continúa (fail-soft) cuando una fixture desconocida se declara junto a una válida, registrando la limitación en vez de lanzar", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Club Fixture Parcial", sector: "padel-sports" }, inputs: { fixtures: ["padel-web-anticuada", "fixture-inventada-que-no-existe"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir });
    assert.ok(result.evidence.length > 0);
    assert.ok(result.limitations.some((l) => l.includes("fixture-inventada-que-no-existe")));
  });
});

test("runResearchAudit sobre datos insuficientes no lanza y produce un resultado válido pero limitado", async () => {
  await withTempDir(async (dir) => {
    const request = buildResearchRequest({ business: { name: "Negocio Ficticio Sin Datos", sector: "generic-local-service" }, inputs: { fixtures: ["negocio-datos-insuficientes"] } });
    const result = await runResearchAudit(request, { outputBaseDir: dir });
    assert.ok(result.limitations.length > 0);
  });
});
