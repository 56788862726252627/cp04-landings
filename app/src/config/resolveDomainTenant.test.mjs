import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveDomainTenant } from "./resolveDomainTenant.js";
import { loadTenantRegistry } from "./loadTenantRegistry.js";
import { repoPath } from "./paths.js";

function registry() {
  return loadTenantRegistry(repoPath("config", "tenant-registry.example.valid.json"));
}

test("resolveDomainTenant: dominio de un tenant active resuelve status active", () => {
  const result = resolveDomainTenant("club-padel-04.pages.dev", registry());
  assert.deepEqual(result, {
    status: "active",
    hostname: "club-padel-04.pages.dev",
    tenantId: "cp04",
    verticalId: "padel",
    slug: "club-padel-04",
  });
});

test("resolveDomainTenant: dominio de un tenant staging resuelve status staging", () => {
  const result = resolveDomainTenant("club-deportivo-fixture-dos.pages.dev", registry());
  assert.equal(result.status, "staging");
  assert.equal(result.tenantId, "fixture-club-02");
});

test("resolveDomainTenant: dominio de un tenant disabled resuelve status disabled", () => {
  const result = resolveDomainTenant("club-deportivo-fixture-tres.pages.dev", registry());
  assert.equal(result.status, "disabled");
});

test("resolveDomainTenant: dominio de un tenant maintenance resuelve status maintenance", () => {
  const result = resolveDomainTenant("club-deportivo-fixture-cuatro.pages.dev", registry());
  assert.equal(result.status, "maintenance");
});

test("resolveDomainTenant: dominio no registrado resuelve unknown_domain, sin tenantId", () => {
  const result = resolveDomainTenant("no-existe-este-dominio.pages.dev", registry());
  assert.deepEqual(result, {
    status: "unknown_domain",
    hostname: "no-existe-este-dominio.pages.dev",
    tenantId: null,
    verticalId: null,
    slug: null,
  });
});

test("resolveDomainTenant: lanza sin hostname", () => {
  assert.throws(() => resolveDomainTenant(undefined, registry()), /requiere un hostname/);
});

test("resolveDomainTenant: lanza sin registry.tenants", () => {
  assert.throws(() => resolveDomainTenant("club-padel-04.pages.dev", {}), /requiere un tenant-registry/);
});

test("resolveDomainTenant: hostname malformado (espacios, mayúsculas, caracteres inválidos) resuelve unknown_domain, nunca lanza ni hace match parcial", () => {
  for (const malformed of ["  club-padel-04.pages.dev  ", "CLUB-PADEL-04.PAGES.DEV", "club padel 04.pages.dev", "http://club-padel-04.pages.dev", "club-padel-04.pages.dev/"]) {
    const result = resolveDomainTenant(malformed, registry());
    assert.equal(result.status, "unknown_domain", `"${malformed}" no debería matchear (match es string exacto, sin normalizar)`);
    assert.equal(result.tenantId, null);
  }
});

test("resolveDomainTenant: hostname con puerto no matchea el dominio sin puerto — el llamador debe stripear el puerto antes de llamar (no lo hace esta función)", () => {
  const result = resolveDomainTenant("club-padel-04.pages.dev:8788", registry());
  assert.equal(result.status, "unknown_domain");
  assert.equal(result.tenantId, null);
});

test("resolveDomainTenant: localhost sin entrada en el registry resuelve unknown_domain — ningún fallback implícito a ningún tenant (el fallback explícito vive en resolveRuntimeTenant, no aquí)", () => {
  for (const local of ["localhost", "localhost:5173", "127.0.0.1"]) {
    const result = resolveDomainTenant(local, registry());
    assert.equal(result.status, "unknown_domain", `"${local}" no debe resolver a ningún tenant sin configuración explícita`);
    assert.equal(result.tenantId, null);
  }
});

test("resolveDomainTenant: no cross-tenant leakage — cada hostname conocido resuelve exclusivamente a su propio tenantId, nunca al de otro", () => {
  const reg = registry();
  const cases = [
    ["club-padel-04.pages.dev", "cp04"],
    ["club-deportivo-fixture-dos.pages.dev", "fixture-club-02"],
    ["club-deportivo-fixture-tres.pages.dev", "fixture-club-03"],
    ["club-deportivo-fixture-cuatro.pages.dev", "fixture-club-04"],
  ];
  for (const [hostname, expectedTenantId] of cases) {
    const result = resolveDomainTenant(hostname, reg);
    assert.equal(result.tenantId, expectedTenantId);
    const others = cases.filter(([, id]) => id !== expectedTenantId).map(([, id]) => id);
    assert.ok(!others.includes(result.tenantId), `resolver "${hostname}" no debe devolver el tenantId de otro tenant`);
  }
});
