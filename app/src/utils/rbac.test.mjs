import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CP04_ROLE_PERMISSIONS,
  CP04_SUPPORT_ONLY_SECTIONS,
  cp04NormalizeRole,
  cp04CanAccessSection,
  cp04GetSafeStartSection,
  cp04IsSupportOnlySection,
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

// PASO 07G (2026-07-19): "cierre_pistas" (Cierre Temporal de Pistas, Paso
// 07E) ahora tiene acceso directo en el sidebar, no solo un card embebido
// en "gestion" — mismo gate de rol que "gestion" (STAFF/ADMIN/SUPPORT).
test("PLAYER no puede acceder a cierre_pistas", () => {
  assert.equal(cp04CanAccessSection("PLAYER", "cierre_pistas"), false);
});

test("STAFF, ADMIN y SUPPORT pueden acceder a cierre_pistas", () => {
  for (const role of ["STAFF", "ADMIN", "SUPPORT"]) {
    assert.equal(cp04CanAccessSection(role, "cierre_pistas"), true, `${role} debería poder acceder a cierre_pistas`);
  }
});

test("simulación de navegación manual por URL/hash: PLAYER forzando 'cierre_pistas' no salta el guard", () => {
  const forcedSection = "cierre_pistas";
  const safeSection = cp04CanAccessSection("PLAYER", forcedSection) ? forcedSection : cp04GetSafeStartSection("PLAYER");
  assert.notEqual(safeSection, "cierre_pistas");
  assert.equal(safeSection, "inicio");
});

// PASO 07I (2026-07-19): "baja_jugador" tiene ahora acceso directo en el
// sidebar (mismo componente AltaJugador() del Paso 07C, solo cambia la
// pestaña inicial) — mismo gate de rol que "alta_jugador" (STAFF/ADMIN/SUPPORT).
test("PLAYER no puede acceder a baja_jugador", () => {
  assert.equal(cp04CanAccessSection("PLAYER", "baja_jugador"), false);
});

test("STAFF, ADMIN y SUPPORT pueden acceder a baja_jugador", () => {
  for (const role of ["STAFF", "ADMIN", "SUPPORT"]) {
    assert.equal(cp04CanAccessSection(role, "baja_jugador"), true, `${role} debería poder acceder a baja_jugador`);
  }
});

test("simulación de navegación manual por URL/hash: PLAYER forzando 'baja_jugador' no salta el guard", () => {
  const forcedSection = "baja_jugador";
  const safeSection = cp04CanAccessSection("PLAYER", forcedSection) ? forcedSection : cp04GetSafeStartSection("PLAYER");
  assert.notEqual(safeSection, "baja_jugador");
  assert.equal(safeSection, "inicio");
});

// PASO 07N (2026-07-20): "lista_espera" (módulo visual preparado para
// Gestión Lista de Espera, Make ID 5791113) — mismo gate de rol que
// "cierre_pistas" (STAFF/ADMIN/SUPPORT).
test("PLAYER no puede acceder a lista_espera", () => {
  assert.equal(cp04CanAccessSection("PLAYER", "lista_espera"), false);
});

test("STAFF, ADMIN y SUPPORT pueden acceder a lista_espera", () => {
  for (const role of ["STAFF", "ADMIN", "SUPPORT"]) {
    assert.equal(cp04CanAccessSection(role, "lista_espera"), true, `${role} debería poder acceder a lista_espera`);
  }
});

test("simulación de navegación manual por URL/hash: PLAYER forzando 'lista_espera' no salta el guard", () => {
  const forcedSection = "lista_espera";
  const safeSection = cp04CanAccessSection("PLAYER", forcedSection) ? forcedSection : cp04GetSafeStartSection("PLAYER");
  assert.notEqual(safeSection, "lista_espera");
  assert.equal(safeSection, "inicio");
});

// PASO 07O (2026-07-20): consolidación de 4 módulos visuales nuevos.
// "control_qr" y "pistas_recordatorios" son operación diaria (mismo gate
// que "cierre_pistas"/"lista_espera": STAFF/ADMIN/SUPPORT). "dashboard_kpi"
// y "backups_seguridad" son métricas/infraestructura (mismo nivel que
// "admin": ADMIN + SUPPORT, sin STAFF).
test("PLAYER no puede acceder a ninguno de los 4 módulos nuevos del Paso 07O", () => {
  for (const section of ["control_qr", "pistas_recordatorios", "dashboard_kpi", "backups_seguridad"]) {
    assert.equal(cp04CanAccessSection("PLAYER", section), false, `PLAYER no debería poder acceder a ${section}`);
  }
});

test("STAFF, ADMIN y SUPPORT pueden acceder a control_qr y pistas_recordatorios", () => {
  for (const section of ["control_qr", "pistas_recordatorios"]) {
    for (const role of ["STAFF", "ADMIN", "SUPPORT"]) {
      assert.equal(cp04CanAccessSection(role, section), true, `${role} debería poder acceder a ${section}`);
    }
  }
});

test("solo ADMIN y SUPPORT pueden acceder a dashboard_kpi y backups_seguridad — STAFF no", () => {
  for (const section of ["dashboard_kpi", "backups_seguridad"]) {
    assert.equal(cp04CanAccessSection("STAFF", section), false, `STAFF no debería poder acceder a ${section}`);
    assert.equal(cp04CanAccessSection("ADMIN", section), true, `ADMIN debería poder acceder a ${section}`);
    assert.equal(cp04CanAccessSection("SUPPORT", section), true, `SUPPORT debería poder acceder a ${section}`);
  }
});

test("simulación de navegación manual por URL/hash: PLAYER y STAFF forzando los 4 módulos nuevos del Paso 07O no saltan el guard", () => {
  for (const section of ["control_qr", "pistas_recordatorios"]) {
    const safeSection = cp04CanAccessSection("PLAYER", section) ? section : cp04GetSafeStartSection("PLAYER");
    assert.equal(safeSection, "inicio");
  }
  for (const section of ["dashboard_kpi", "backups_seguridad"]) {
    const safeForPlayer = cp04CanAccessSection("PLAYER", section) ? section : cp04GetSafeStartSection("PLAYER");
    assert.equal(safeForPlayer, "inicio");
    const safeForStaff = cp04CanAccessSection("STAFF", section) ? section : cp04GetSafeStartSection("STAFF");
    assert.notEqual(safeForStaff, section);
  }
});
