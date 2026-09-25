import { test } from "node:test";
import assert from "node:assert/strict";

import { buildRolesAndPermissions, getRoleTier } from "./roleEngine.js";
import { getSectorPresetById } from "./sectorLexicon.js";
import { resolveModules } from "./moduleDependencyEngine.js";

test("getRoleTier clasifica roles conocidos y cae a 'reception' para un rol desconocido", () => {
  assert.equal(getRoleTier("paciente"), "client");
  assert.equal(getRoleTier("direccion"), "admin");
  assert.equal(getRoleTier("soporte"), "support");
  assert.equal(getRoleTier("rol-inventado-que-no-existe"), "reception");
});

test("el rol cliente/paciente nunca recibe el módulo de expedientes aunque esté habilitado", () => {
  const physio = getSectorPresetById("physiotherapy");
  const { modules } = resolveModules("clínica de fisioterapia con reservas y expedientes clínicos de pacientes", physio);
  const { permissions } = buildRolesAndPermissions(physio, modules);
  assert.ok(!permissions.paciente.includes("expedientes"));
  assert.ok(permissions.fisioterapeuta.includes("expedientes"));
  assert.ok(permissions.direccion.includes("expedientes"));
});

test("recepción nunca recibe expedientes aunque esté habilitado (permisos reforzados)", () => {
  const dental = getSectorPresetById("dental");
  const { modules } = resolveModules("clínica dental con expedientes clínicos", dental);
  const { permissions } = buildRolesAndPermissions(dental, modules);
  assert.ok(!permissions.recepcion.includes("expedientes"));
});

test("dirección/administración tienen acceso a todos los módulos habilitados (tier admin = ALL)", () => {
  const law = getSectorPresetById("law");
  const { modules } = resolveModules("despacho de abogados con citas, documentos y facturación", law);
  const { permissions } = buildRolesAndPermissions(law, modules);
  const enabledIds = modules.filter((m) => m.status === "enabled").map((m) => m.id);
  assert.deepEqual([...permissions.direccion].sort(), [...enabledIds].sort());
});

test("permissions solo contiene módulos realmente habilitados (nunca 'suggested' ni 'rejected')", () => {
  const padel = getSectorPresetById("padel-sports");
  const { modules } = resolveModules("club de pádel con reservas de pistas", padel);
  const { permissions } = buildRolesAndPermissions(padel, modules);
  const enabledIds = new Set(modules.filter((m) => m.status === "enabled").map((m) => m.id));
  for (const role of Object.keys(permissions)) {
    for (const moduleId of permissions[role]) {
      assert.ok(enabledIds.has(moduleId), `${role} tiene acceso a "${moduleId}" que no está enabled`);
    }
  }
});

test("roles preserva el orden y el conjunto exacto del preset sectorial", () => {
  const restaurant = getSectorPresetById("restaurant");
  const { modules } = resolveModules("restaurante con reservas de mesa", restaurant);
  const { roles } = buildRolesAndPermissions(restaurant, modules);
  assert.deepEqual(roles, restaurant.roles);
});

test("determinista: misma entrada produce la misma matriz de permisos", () => {
  const dental = getSectorPresetById("dental");
  const { modules } = resolveModules("clínica dental con citas y pagos", dental);
  const run1 = buildRolesAndPermissions(dental, modules);
  const run2 = buildRolesAndPermissions(dental, modules);
  assert.deepEqual(run1, run2);
});

test("soporte nunca recibe módulos operativos de negocio (solo soporte/incidencias/notificaciones/auditoría)", () => {
  const dental = getSectorPresetById("dental");
  const { modules } = resolveModules("clínica dental con citas, pagos, facturación e informes", dental);
  const { permissions } = buildRolesAndPermissions(dental, modules);
  for (const moduleId of permissions.soporte) {
    assert.ok(["soporte", "incidencias", "notificaciones", "auditoria"].includes(moduleId));
  }
});
