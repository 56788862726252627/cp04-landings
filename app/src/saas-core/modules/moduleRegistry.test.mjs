import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CORE_MODULE_CATALOG,
  GENERIC_ROLES,
  isModuleEnabled,
  getEnabledSectionsForRole,
  canAccessModule,
  assertRouteAllowed,
  buildSidebarNavigation,
  isModuleOperational,
  deriveGenericRolePermissions,
} from "./moduleRegistry.js";
import { CLUB_PADEL_04_TENANT } from "../tenant/defaultTenant.js";
import { CP04_ROLES, CP04_ROLE_PERMISSIONS, cp04CanAccessSection } from "../../utils/rbac.js";

test("EQUIVALENCIA: getEnabledSectionsForRole(club-padel-04, rol) == CP04_ROLE_PERMISSIONS[rol] para los 4 roles", () => {
  for (const role of CP04_ROLES) {
    const generic = getEnabledSectionsForRole(CLUB_PADEL_04_TENANT, role);
    assert.deepEqual(generic, CP04_ROLE_PERMISSIONS[role], `mismatch para el rol ${role}`);
  }
});

test("EQUIVALENCIA: canAccessModule coincide con cp04CanAccessSection para una muestra de secciones", () => {
  const sampleSections = ["inicio", "reservas", "flujos_make", "soporte", "torneos", "admin", "ranking"];
  for (const role of CP04_ROLES) {
    for (const section of sampleSections) {
      assert.equal(
        canAccessModule(CLUB_PADEL_04_TENANT, role, section),
        cp04CanAccessSection(role, section),
        `mismatch rol=${role} seccion=${section}`,
      );
    }
  }
});

test("ningún id concedido por rol en CP04 queda fuera de modulesEnabled (sin permisos huérfanos)", () => {
  const enabledSet = new Set(CLUB_PADEL_04_TENANT.modulesEnabled);
  for (const role of CP04_ROLES) {
    for (const id of CP04_ROLE_PERMISSIONS[role]) {
      assert.ok(enabledSet.has(id), `id "${id}" concedido a ${role} pero ausente de modulesEnabled`);
    }
  }
});

test("PLAYER de CP04 no puede acceder a flujos_make ni soporte vía el motor genérico", () => {
  assert.equal(canAccessModule(CLUB_PADEL_04_TENANT, "PLAYER", "flujos_make"), false);
  assert.equal(canAccessModule(CLUB_PADEL_04_TENANT, "PLAYER", "soporte"), false);
});

test("assertRouteAllowed bloquea un módulo deshabilitado en el tenant aunque el rol lo tuviera concedido", () => {
  const tenantWithModuleOff = {
    ...CLUB_PADEL_04_TENANT,
    modulesEnabled: CLUB_PADEL_04_TENANT.modulesEnabled.filter((id) => id !== "torneos"),
  };
  const verdict = assertRouteAllowed(tenantWithModuleOff, "ADMIN", "torneos");
  assert.equal(verdict.allowed, false);
  assert.equal(verdict.reason, "module_disabled");
});

test("assertRouteAllowed bloquea acceso directo por URL cuando el rol no tiene permiso, aunque el módulo esté activo", () => {
  const verdict = assertRouteAllowed(CLUB_PADEL_04_TENANT, "PLAYER", "flujos_make");
  assert.equal(verdict.allowed, false);
  assert.equal(verdict.reason, "role_not_permitted");
});

test("assertRouteAllowed permite acceso cuando módulo activo + rol autorizado", () => {
  const verdict = assertRouteAllowed(CLUB_PADEL_04_TENANT, "ADMIN", "admin");
  assert.equal(verdict.allowed, true);
  assert.equal(verdict.reason, null);
});

test("assertRouteAllowed falla de forma segura sin tenant", () => {
  assert.equal(assertRouteAllowed(null, "ADMIN", "admin").allowed, false);
  assert.equal(assertRouteAllowed(undefined, "ADMIN", "admin").allowed, false);
});

test("un rol desconocido (fuera de tenant.roles) no obtiene ningún módulo", () => {
  assert.deepEqual(getEnabledSectionsForRole(CLUB_PADEL_04_TENANT, "SUPERADMIN"), []);
  assert.equal(canAccessModule(CLUB_PADEL_04_TENANT, "SUPERADMIN", "inicio"), false);
});

test("el catálogo genérico no contiene ids duplicados", () => {
  const ids = CORE_MODULE_CATALOG.map((m) => m.id);
  assert.equal(new Set(ids).size, ids.length);
});

test("un módulo pending nunca se marca como operativo", () => {
  assert.equal(isModuleOperational("campanas"), false);
  assert.equal(isModuleOperational("citas"), true);
  assert.equal(isModuleOperational("no-existe"), false);
});

test("buildSidebarNavigation para club-padel-04 devuelve items legacy (fuera del catálogo genérico) marcados coherentemente", () => {
  const nav = buildSidebarNavigation(CLUB_PADEL_04_TENANT, "SUPPORT");
  assert.ok(nav.length > 0);
  const item = nav.find((n) => n.id === "flujos_make");
  assert.equal(item.group, "legacy");
});

test("isModuleEnabled es fail-closed ante modulesEnabled ausente", () => {
  assert.equal(isModuleEnabled({}, "inicio"), false);
});

test("deriveGenericRolePermissions solo incluye módulos habilitados y respeta jerarquía CLIENT⊆STAFF⊆ADMIN", () => {
  const perms = deriveGenericRolePermissions(["inicio", "citas", "profesionales", "centro_tecnico"]);
  assert.deepEqual(Object.keys(perms).sort(), [...GENERIC_ROLES].sort());
  assert.ok(!perms.CLIENT.includes("profesionales"));
  assert.ok(perms.ADMIN.includes("profesionales"));
  assert.ok(!perms.ADMIN.includes("centro_tecnico"));
  assert.ok(perms.SUPPORT.includes("centro_tecnico"));
  assert.ok(!perms.CLIENT.includes("no-tal-modulo"));
});

test("deriveGenericRolePermissions ignora ids fuera del catálogo genérico (p.ej. ids legacy de CP04)", () => {
  const perms = deriveGenericRolePermissions(["inicio", "flujos_make"]);
  for (const role of GENERIC_ROLES) {
    assert.ok(!perms[role].includes("flujos_make"));
  }
});
