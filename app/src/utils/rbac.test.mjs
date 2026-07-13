import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CP04_ROLE_PERMISSIONS,
  CP04_SUPPORT_ONLY_SECTIONS,
  cp04NormalizeRole,
  cp04CanAccessSection,
  cp04GetSafeStartSection,
  cp04IsSupportOnlySection,
  cp04CanEditTournament,
} from "./rbac.js";

test("PLAYER no puede acceder a flujos_make ni a soporte", () => {
  assert.equal(cp04CanAccessSection("PLAYER", "flujos_make"), false);
  assert.equal(cp04CanAccessSection("PLAYER", "soporte"), false);
});

test("STAFF no puede acceder a flujos_make ni a soporte", () => {
  assert.equal(cp04CanAccessSection("STAFF", "flujos_make"), false);
  assert.equal(cp04CanAccessSection("STAFF", "soporte"), false);
});

test("ADMIN no puede acceder al Centro Técnico ni a soporte, pero sí a admin", () => {
  assert.equal(cp04CanAccessSection("ADMIN", "flujos_make"), false);
  assert.equal(cp04CanAccessSection("ADMIN", "soporte"), false);
  assert.equal(cp04CanAccessSection("ADMIN", "admin"), true);
});

test("SUPPORT es el único rol con acceso a flujos_make y soporte", () => {
  assert.equal(cp04CanAccessSection("SUPPORT", "flujos_make"), true);
  assert.equal(cp04CanAccessSection("SUPPORT", "soporte"), true);
  for (const role of ["PLAYER", "STAFF", "ADMIN"]) {
    for (const section of CP04_SUPPORT_ONLY_SECTIONS) {
      assert.equal(cp04CanAccessSection(role, section), false, `${role} no debería poder acceder a ${section}`);
    }
  }
});

test("un rol desconocido o vacío se deniega (fail-closed a PLAYER), nunca se degrada a un rol más privilegiado", () => {
  assert.equal(cp04NormalizeRole("hacker"), "PLAYER");
  assert.equal(cp04NormalizeRole(""), "PLAYER");
  assert.equal(cp04NormalizeRole(undefined), "PLAYER");
  assert.equal(cp04NormalizeRole("support; DROP TABLE"), "PLAYER");
  assert.equal(cp04CanAccessSection("hacker", "flujos_make"), false);
  assert.equal(cp04CanAccessSection(null, "soporte"), false);
});

test("normalización de rol es insensible a mayúsculas/espacios", () => {
  assert.equal(cp04NormalizeRole("  support  "), "SUPPORT");
  assert.equal(cp04NormalizeRole("Support"), "SUPPORT");
});

test("cp04GetSafeStartSection nunca devuelve una sección protegida para roles de negocio", () => {
  assert.equal(cp04GetSafeStartSection("PLAYER"), "inicio");
  assert.equal(cp04GetSafeStartSection("STAFF"), "inicio");
  assert.equal(cp04GetSafeStartSection("ADMIN"), "inicio");
  assert.equal(cp04GetSafeStartSection("hacker"), "inicio");
});

test("cp04IsSupportOnlySection identifica exactamente flujos_make y soporte", () => {
  assert.equal(cp04IsSupportOnlySection("flujos_make"), true);
  assert.equal(cp04IsSupportOnlySection("soporte"), true);
  assert.equal(cp04IsSupportOnlySection("admin"), false);
  assert.equal(cp04IsSupportOnlySection("inicio"), false);
});

test("simulación de navegación manual por URL/hash: cambiar de sección a mano no salta el guard", () => {
  // Esto simula lo que hace App.jsx: aunque el usuario fuerce `current` a
  // "flujos_make" manualmente (URL, hash, devtools), el guard final debe
  // seguir negando el render real para roles no autorizados.
  for (const role of ["PLAYER", "STAFF", "ADMIN"]) {
    const forcedSection = "flujos_make";
    const safeSection = cp04CanAccessSection(role, forcedSection) ? forcedSection : cp04GetSafeStartSection(role);
    assert.notEqual(safeSection, "flujos_make", `${role} no debería terminar en flujos_make aunque lo fuerce`);
  }
});

test("CP04_ROLE_PERMISSIONS: ningún rol de negocio (PLAYER/STAFF/ADMIN) incluye secciones SUPPORT-only", () => {
  for (const role of ["PLAYER", "STAFF", "ADMIN"]) {
    for (const section of CP04_SUPPORT_ONLY_SECTIONS) {
      assert.equal(CP04_ROLE_PERMISSIONS[role].includes(section), false);
    }
  }
});

// cp04CanEditTournament — cierre del hallazgo de auditoría "Torneos sin
// distinción viewer/editor" (audit/multi-tenant-role-wiring/ROLE_CAPABILITY_WIRING_AUDIT.md
// §2): edición de bracket (añadir/editar/eliminar pareja, formato,
// reordenar, autoasignar, guardar, publicar, marcar ganador,
// deshacer/rehacer/restaurar) es operación de STAFF/ADMIN/SUPPORT. PLAYER
// conserva la sección "torneos" (vista de solo lectura), nunca la capacidad
// de editar.

test("PLAYER no puede editar el bracket de torneos", () => {
  assert.equal(cp04CanEditTournament("PLAYER"), false);
});

test("ADMIN puede editar el bracket de torneos", () => {
  assert.equal(cp04CanEditTournament("ADMIN"), true);
});

test("STAFF puede editar el bracket de torneos", () => {
  assert.equal(cp04CanEditTournament("STAFF"), true);
});

test("SUPPORT puede editar el bracket de torneos", () => {
  assert.equal(cp04CanEditTournament("SUPPORT"), true);
});

test("cp04CanEditTournament: rol desconocido/vacío se deniega (fail-closed a PLAYER, nunca se degrada a un rol más privilegiado)", () => {
  assert.equal(cp04CanEditTournament("hacker"), false);
  assert.equal(cp04CanEditTournament(""), false);
  assert.equal(cp04CanEditTournament(undefined), false);
  assert.equal(cp04CanEditTournament(null), false);
});

test("cp04CanEditTournament: insensible a mayúsculas/espacios (misma normalización que el resto del RBAC)", () => {
  assert.equal(cp04CanEditTournament("  admin  "), true);
  assert.equal(cp04CanEditTournament("Staff"), true);
  assert.equal(cp04CanEditTournament("player"), false);
});

test("CP04_TOURNAMENT_EDITOR_ROLES es exactamente STAFF/ADMIN/SUPPORT, sin PLAYER", () => {
  for (const role of ["STAFF", "ADMIN", "SUPPORT"]) {
    assert.equal(cp04CanEditTournament(role), true, `${role} debería poder editar`);
  }
  assert.equal(cp04CanEditTournament("PLAYER"), false, "PLAYER no debería poder editar");
});
