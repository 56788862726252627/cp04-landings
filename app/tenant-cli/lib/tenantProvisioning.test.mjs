import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, readFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import {
  parseCliArgs,
  slugify,
  buildTenantConfig,
  createTenant,
  validateTenantOnDisk,
  listTenantsOnDisk,
  previewTenantOnDisk,
  TenantProvisioningError,
} from "./tenantProvisioning.mjs";
import { validateTenantConfig } from "../../src/saas-core/tenant/tenantSchema.js";

async function withTempDir(fn) {
  const dir = await mkdtemp(path.join(tmpdir(), "cp04-tenant-cli-"));
  try {
    await fn(dir);
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}

test("parseCliArgs soporta --key=value, --key value y flags booleanos", () => {
  const args = parseCliArgs(["--template=dental-clinic", "--name", "Clínica Demo", "--force"]);
  assert.equal(args.template, "dental-clinic");
  assert.equal(args.name, "Clínica Demo");
  assert.equal(args.force, true);
});

test("slugify produce siempre kebab-case en minúsculas sin acentos", () => {
  assert.equal(slugify("Clínica Dental Demo #2"), "clinica-dental-demo-2");
  assert.equal(slugify("  Café & Té  "), "cafe-te");
});

test("buildTenantConfig exige --name", () => {
  assert.throws(() => buildTenantConfig({ template: "padel-club", name: "" }), TenantProvisioningError);
});

test("buildTenantConfig exige --template o --preset", () => {
  assert.throws(() => buildTenantConfig({ name: "X" }), TenantProvisioningError);
});

test("buildTenantConfig con plantilla desconocida falla con mensaje claro", () => {
  assert.throws(() => buildTenantConfig({ template: "no-existe", name: "X" }), /Plantilla desconocida/);
});

test("buildTenantConfig con preset produce una config válida contra el esquema central", () => {
  const { tenantConfig } = buildTenantConfig({ preset: "dental-clinic", name: "Clínica Demo Norte" });
  const { valid, errors } = validateTenantConfig(tenantConfig);
  assert.deepEqual(errors, []);
  assert.equal(valid, true);
  assert.equal(tenantConfig.sector, "dental");
  assert.equal(tenantConfig.policies.regulatedSector, true);
});

test("buildTenantConfig nunca escribe un valor en envVars, solo nombres", () => {
  const { tenantConfig } = buildTenantConfig({ template: "padel-club", name: "Club Demo" });
  for (const entry of Object.values(tenantConfig.integrations)) {
    assert.equal(entry.status, "not_configured");
    for (const envVar of entry.envVars) {
      assert.equal(/^[A-Z0-9_]+$/.test(envVar), true, `envVar "${envVar}" no parece solo un nombre`);
    }
  }
});

test("createTenant escribe exactamente 4 archivos permitidos y ninguno contiene secretos", async () => {
  await withTempDir(async (dir) => {
    const result = await createTenant({ template: "padel-club", name: "Club Demo Norte", baseDir: dir });
    assert.equal(result.filesWritten.length, 4);
    const names = result.filesWritten.map((f) => path.basename(f)).sort();
    assert.deepEqual(names, ["checklist.md", "env.example", "summary.md", "tenant.config.json"]);

    const envContent = await readFile(path.join(result.outputDir, "env.example"), "utf8");
    assert.doesNotMatch(envContent, /=.+/); // ninguna línea de env var tiene valor tras el "="
    assert.doesNotMatch(envContent, /sk_live|sk_test|whsec_/);
  });
});

test("createTenant es idempotente por seguridad: la segunda llamada sin --force falla en vez de sobrescribir", async () => {
  await withTempDir(async (dir) => {
    await createTenant({ template: "padel-club", name: "Club Demo Dup", baseDir: dir });
    await assert.rejects(
      createTenant({ template: "padel-club", name: "Club Demo Dup", baseDir: dir }),
      TenantProvisioningError,
    );
  });
});

test("createTenant con --force permite regenerar el mismo tenant", async () => {
  await withTempDir(async (dir) => {
    await createTenant({ template: "padel-club", name: "Club Demo Force", baseDir: dir });
    const second = await createTenant({ template: "padel-club", name: "Club Demo Force", baseDir: dir, force: true });
    assert.equal(second.filesWritten.length, 4);
  });
});

test("validateTenantOnDisk valida el tenant.config.json generado por createTenant", async () => {
  await withTempDir(async (dir) => {
    const created = await createTenant({ preset: "hair-salon", name: "Peluquería Demo", baseDir: dir });
    const result = await validateTenantOnDisk({ tenantId: created.tenantId, baseDir: dir });
    assert.equal(result.valid, true);
  });
});

test("validateTenantOnDisk detecta un tenant.config.json corrupto sin lanzar", async () => {
  await withTempDir(async (dir) => {
    const result = await validateTenantOnDisk({ tenantId: "no-existe", baseDir: dir });
    assert.equal(result.valid, false);
    assert.ok(result.errors.length > 0);
  });
});

test("validateTenantOnDisk('club-padel-04') valida el tenant de producción sin tocar disco", async () => {
  const result = await validateTenantOnDisk({ tenantId: "club-padel-04", baseDir: "/no/existe" });
  assert.equal(result.valid, true);
});

test("listTenantsOnDisk siempre incluye club-padel-04 como tenant de producción por defecto", async () => {
  await withTempDir(async (dir) => {
    const tenants = await listTenantsOnDisk({ baseDir: dir });
    assert.ok(tenants.some((t) => t.tenantId === "club-padel-04" && t.kind === "production_default"));
  });
});

test("listTenantsOnDisk lista los tenants demo generados además del default", async () => {
  await withTempDir(async (dir) => {
    await createTenant({ preset: "veterinarian", name: "Veterinaria Demo", baseDir: dir });
    const tenants = await listTenantsOnDisk({ baseDir: dir });
    assert.ok(tenants.some((t) => t.tenantId === "veterinaria-demo" && t.kind === "demo"));
  });
});

test("previewTenantOnDisk devuelve navegación por rol y aviso normativo cuando aplica", async () => {
  await withTempDir(async (dir) => {
    const created = await createTenant({ preset: "psychology-practice", name: "Consulta Demo", baseDir: dir });
    const preview = await previewTenantOnDisk({ tenantId: created.tenantId, baseDir: dir });
    assert.equal(preview.valid, true);
    assert.ok(preview.navigationByRole.ADMIN.length > 0);
    assert.notEqual(preview.regulatoryNotice, null);
  });
});

test("createTenant sanea un nombre inseguro a un slug válido y no crea rutas fuera de baseDir", async () => {
  await withTempDir(async (dir) => {
    const result = await createTenant({ template: "local-service", name: "../../etc Demo!!", baseDir: dir });
    assert.doesNotMatch(result.tenantId, /\.\./);
    assert.ok(result.outputDir.startsWith(dir));
  });
});
