// Paso 09 · Fase 10/13 — Verifica los 7 tenants demo generados por el CLI
// (npm run tenant:create) directamente desde disco, como parte de la
// suite de tests del repo. No genera nada nuevo: solo lee lo ya creado.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateTenantConfig } from "../../tenant/tenantSchema.js";
import { buildSidebarNavigation } from "../../modules/moduleRegistry.js";
import { findLeakedSportsTerms, buildTerminology } from "../../terminology/terminology.js";

const DEMO_DIR = path.dirname(fileURLToPath(import.meta.url));

const EXPECTED_TENANT_IDS = [
  "padel-sur-estepona",
  "clinica-dental-sonrisas-malaga",
  "fisioterapia-activa-granada",
  "consulta-psicologica-mente-clara",
  "despacho-juridico-rivas-y-asociados",
  "peluqueria-estilo-urbano",
  "clinica-veterinaria-patitas-felices",
];

async function loadTenant(tenantId) {
  const raw = await readFile(path.join(DEMO_DIR, tenantId, "tenant.config.json"), "utf8");
  return JSON.parse(raw);
}

test("existen exactamente los 7 tenants demo requeridos por la Fase 10", async () => {
  const dirs = (await readdir(DEMO_DIR, { withFileTypes: true }))
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .sort();
  assert.deepEqual(dirs, [...EXPECTED_TENANT_IDS].sort());
});

test("cada tenant demo tiene los 4 archivos generados (config, env example, checklist, summary)", async () => {
  for (const tenantId of EXPECTED_TENANT_IDS) {
    const files = (await readdir(path.join(DEMO_DIR, tenantId))).sort();
    assert.deepEqual(files, ["checklist.md", "env.example", "summary.md", "tenant.config.json"]);
  }
});

test("cada tenant demo valida contra el esquema central", async () => {
  for (const tenantId of EXPECTED_TENANT_IDS) {
    const config = await loadTenant(tenantId);
    const { valid, errors } = validateTenantConfig(config);
    assert.deepEqual(errors, [], `${tenantId} inválido`);
    assert.equal(valid, true);
  }
});

test("ningún tenant demo activa centro_tecnico (interno de agencia)", async () => {
  for (const tenantId of EXPECTED_TENANT_IDS) {
    const config = await loadTenant(tenantId);
    assert.ok(!config.modulesEnabled.includes("centro_tecnico"), `${tenantId} no debería activar centro_tecnico`);
  }
});

test("ningún env.example de un tenant demo contiene un valor (solo nombres de variable)", async () => {
  for (const tenantId of EXPECTED_TENANT_IDS) {
    const content = await readFile(path.join(DEMO_DIR, tenantId, "env.example"), "utf8");
    const varLines = content.split("\n").filter((l) => /^[A-Z0-9_]+=/.test(l));
    assert.ok(varLines.length > 0, `${tenantId}: se esperaban variables de entorno`);
    for (const line of varLines) assert.match(line, /^[A-Z0-9_]+=$/);
  }
});

test("los tenants no deportivos no filtran terminología de pádel", async () => {
  for (const tenantId of EXPECTED_TENANT_IDS) {
    if (tenantId === "padel-sur-estepona") continue;
    const config = await loadTenant(tenantId);
    const { dictionary } = buildTerminology(config.terminologyOverrides);
    const offenders = findLeakedSportsTerms(config.sector, dictionary);
    assert.deepEqual(offenders, [], `${tenantId} filtra vocabulario de pádel: ${offenders.join(", ")}`);
  }
});

test("padel-sur-estepona conserva terminología de pádel (jugador/pista) como su plantilla base", async () => {
  const config = await loadTenant("padel-sur-estepona");
  const { dictionary } = buildTerminology(config.terminologyOverrides);
  assert.equal(dictionary.customer.singular, "jugador");
  assert.equal(dictionary.resource.singular, "pista");
});

test("los 5 tenants de sector regulado (salud/legal/veterinaria) exigen revisión normativa", async () => {
  const regulatedTenantIds = [
    "clinica-dental-sonrisas-malaga", "fisioterapia-activa-granada", "consulta-psicologica-mente-clara",
    "despacho-juridico-rivas-y-asociados", "clinica-veterinaria-patitas-felices",
  ];
  for (const tenantId of regulatedTenantIds) {
    const config = await loadTenant(tenantId);
    assert.equal(config.policies.regulatedSector, true, `${tenantId} debería ser regulado`);
  }
  const nonRegulated = ["padel-sur-estepona", "peluqueria-estilo-urbano"];
  for (const tenantId of nonRegulated) {
    const config = await loadTenant(tenantId);
    assert.equal(config.policies.regulatedSector, false, `${tenantId} no debería ser regulado`);
  }
});

test("cada tenant demo produce navegación no vacía para ADMIN a través del motor genérico", async () => {
  for (const tenantId of EXPECTED_TENANT_IDS) {
    const config = await loadTenant(tenantId);
    const nav = buildSidebarNavigation(config, "ADMIN");
    assert.ok(nav.length > 0, `${tenantId}: ADMIN sin navegación`);
  }
});

test("cada rol distinto de ADMIN/SUPPORT tiene estrictamente menos o igual acceso que ADMIN (jerarquía respetada)", async () => {
  for (const tenantId of EXPECTED_TENANT_IDS) {
    const config = await loadTenant(tenantId);
    const adminNav = new Set(buildSidebarNavigation(config, "ADMIN").map((n) => n.id));
    const clientNav = buildSidebarNavigation(config, "CLIENT").map((n) => n.id);
    for (const moduleId of clientNav) {
      assert.ok(adminNav.has(moduleId), `${tenantId}: CLIENT ve "${moduleId}" que ADMIN no ve`);
    }
  }
});
