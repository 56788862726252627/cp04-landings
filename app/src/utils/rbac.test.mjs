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

// RBAC V2 (2026-08-27): lista_espera pasa a ser accesible también para PLAYER —
// es el formulario de inscripción en lista de espera que un jugador necesita.
// cierre_pistas sigue siendo solo STAFF/ADMIN/SUPPORT.
test("PLAYER puede acceder a lista_espera (RBAC V2)", () => {
  assert.equal(cp04CanAccessSection("PLAYER", "lista_espera"), true);
});

test("PLAYER no puede acceder a cierre_pistas (operación administrativa)", () => {
  assert.equal(cp04CanAccessSection("PLAYER", "cierre_pistas"), false);
});

test("STAFF, ADMIN y SUPPORT pueden acceder a lista_espera", () => {
  for (const role of ["STAFF", "ADMIN", "SUPPORT"]) {
    assert.equal(cp04CanAccessSection(role, "lista_espera"), true, `${role} debería poder acceder a lista_espera`);
  }
});

// RBAC V2 (2026-08-27): control_qr y pistas_recordatorios pasan también a
// PLAYER (módulos de uso personal del jugador). dashboard_kpi y
// backups_seguridad siguen restringidos a ADMIN+SUPPORT.
test("PLAYER puede acceder a control_qr y pistas_recordatorios (RBAC V2)", () => {
  for (const section of ["control_qr", "pistas_recordatorios"]) {
    assert.equal(cp04CanAccessSection("PLAYER", section), true, `PLAYER debería poder acceder a ${section}`);
  }
});

test("PLAYER no puede acceder a dashboard_kpi ni backups_seguridad (métricas/infraestructura)", () => {
  for (const section of ["dashboard_kpi", "backups_seguridad"]) {
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

test("simulación: PLAYER forzando dashboard_kpi o backups_seguridad no salta el guard", () => {
  for (const section of ["dashboard_kpi", "backups_seguridad"]) {
    const safeForPlayer = cp04CanAccessSection("PLAYER", section) ? section : cp04GetSafeStartSection("PLAYER");
    assert.equal(safeForPlayer, "inicio");
    const safeForStaff = cp04CanAccessSection("STAFF", section) ? section : cp04GetSafeStartSection("STAFF");
    assert.notEqual(safeForStaff, section);
  }
});

// RBAC V2 (2026-08-27): calendario_disponibilidad pasa a PLAYER (consulta
// personal de disponibilidad). comunicaciones_socio sigue en STAFF+.
// automatizaciones_bots sigue en ADMIN+SUPPORT — nunca PLAYER ni STAFF.
test("PLAYER puede acceder a calendario_disponibilidad (RBAC V2)", () => {
  assert.equal(cp04CanAccessSection("PLAYER", "calendario_disponibilidad"), true);
});

test("PLAYER no puede acceder a comunicaciones_socio (operación interna)", () => {
  assert.equal(cp04CanAccessSection("PLAYER", "comunicaciones_socio"), false);
});

test("PLAYER no puede acceder a facturacion_pagos ni automatizaciones_bots", () => {
  for (const section of ["facturacion_pagos", "automatizaciones_bots"]) {
    assert.equal(cp04CanAccessSection("PLAYER", section), false, `PLAYER no debería poder acceder a ${section}`);
  }
});

test("STAFF, ADMIN y SUPPORT pueden acceder a comunicaciones_socio y calendario_disponibilidad", () => {
  for (const section of ["comunicaciones_socio", "calendario_disponibilidad"]) {
    for (const role of ["STAFF", "ADMIN", "SUPPORT"]) {
      assert.equal(cp04CanAccessSection(role, section), true, `${role} debería poder acceder a ${section}`);
    }
  }
});

test("solo ADMIN y SUPPORT pueden acceder a facturacion_pagos y automatizaciones_bots — STAFF no", () => {
  for (const section of ["facturacion_pagos", "automatizaciones_bots"]) {
    assert.equal(cp04CanAccessSection("STAFF", section), false, `STAFF no debería poder acceder a ${section}`);
    assert.equal(cp04CanAccessSection("ADMIN", section), true, `ADMIN debería poder acceder a ${section}`);
    assert.equal(cp04CanAccessSection("SUPPORT", section), true, `SUPPORT debería poder acceder a ${section}`);
  }
});

test("simulación: PLAYER forzando comunicaciones_socio, facturacion_pagos o automatizaciones_bots no salta el guard", () => {
  for (const section of ["comunicaciones_socio", "facturacion_pagos", "automatizaciones_bots"]) {
    const safeForPlayer = cp04CanAccessSection("PLAYER", section) ? section : cp04GetSafeStartSection("PLAYER");
    assert.equal(safeForPlayer, "inicio", `${section}: PLAYER debe redirigir a inicio`);
  }
  for (const section of ["facturacion_pagos", "automatizaciones_bots"]) {
    const safeForStaff = cp04CanAccessSection("STAFF", section) ? section : cp04GetSafeStartSection("STAFF");
    assert.notEqual(safeForStaff, section, `STAFF no debería llegar a ${section}`);
  }
});

test("Centro Técnico sigue siendo exclusivo de SUPPORT tras el Paso 07P (ni ADMIN ni los nuevos roles de negocio lo reciben)", () => {
  for (const role of ["PLAYER", "STAFF", "ADMIN"]) {
    assert.equal(cp04CanAccessSection(role, "flujos_make"), false, `${role} no debería poder acceder a flujos_make`);
  }
  assert.equal(cp04CanAccessSection("SUPPORT", "flujos_make"), true);
});

// ─── RBAC V2 (2026-08-27): asistente_ia + nueva matriz PLAYER ───────────────

test("todos los roles pueden acceder a asistente_ia", () => {
  for (const role of ["PLAYER", "STAFF", "ADMIN", "SUPPORT"]) {
    assert.equal(cp04CanAccessSection(role, "asistente_ia"), true, `${role} debería poder acceder a asistente_ia`);
  }
});

test("automatizaciones_bots sigue siendo solo ADMIN+SUPPORT — PLAYER y STAFF no", () => {
  assert.equal(cp04CanAccessSection("PLAYER", "automatizaciones_bots"), false);
  assert.equal(cp04CanAccessSection("STAFF", "automatizaciones_bots"), false);
  assert.equal(cp04CanAccessSection("ADMIN", "automatizaciones_bots"), true);
  assert.equal(cp04CanAccessSection("SUPPORT", "automatizaciones_bots"), true);
});

test("PLAYER puede acceder a reprogramar y cancelar (módulos propios del jugador)", () => {
  assert.equal(cp04CanAccessSection("PLAYER", "reprogramar"), true);
  assert.equal(cp04CanAccessSection("PLAYER", "cancelar"), true);
});

test("PLAYER ve todos sus módulos propios y no ve los administrativos", () => {
  const player = CP04_ROLE_PERMISSIONS.PLAYER;
  // Debe tener
  for (const s of ["inicio", "reservas", "reprogramar", "cancelar", "lista_espera", "control_qr", "pistas_recordatorios", "calendario_disponibilidad", "torneos", "ranking", "comunidad", "asistente_ia", "perfil"]) {
    assert.ok(player.includes(s), `PLAYER debe tener ${s}`);
  }
  // No debe tener
  for (const s of ["alta_jugador", "baja_jugador", "cierre_pistas", "gestion", "admin", "dashboard_kpi", "backups_seguridad", "facturacion_pagos", "comunicaciones_socio", "automatizaciones_bots", "flujos_make", "soporte"]) {
    assert.ok(!player.includes(s), `PLAYER no debe tener ${s}`);
  }
});

test("STAFF tiene asistente_ia pero no automatizaciones_bots ni flujos_make", () => {
  assert.equal(cp04CanAccessSection("STAFF", "asistente_ia"), true);
  assert.equal(cp04CanAccessSection("STAFF", "automatizaciones_bots"), false);
  assert.equal(cp04CanAccessSection("STAFF", "flujos_make"), false);
});

test("ADMIN tiene asistente_ia y automatizaciones_bots pero no flujos_make ni soporte", () => {
  assert.equal(cp04CanAccessSection("ADMIN", "asistente_ia"), true);
  assert.equal(cp04CanAccessSection("ADMIN", "automatizaciones_bots"), true);
  assert.equal(cp04CanAccessSection("ADMIN", "flujos_make"), false);
  assert.equal(cp04CanAccessSection("ADMIN", "soporte"), false);
});

test("SUPPORT tiene todo — asistente_ia, automatizaciones_bots, flujos_make, soporte", () => {
  for (const s of ["asistente_ia", "automatizaciones_bots", "flujos_make", "soporte"]) {
    assert.equal(cp04CanAccessSection("SUPPORT", s), true, `SUPPORT debe tener ${s}`);
  }
});

test("todos los roles tienen acceso a perfil", () => {
  for (const role of ["PLAYER", "STAFF", "ADMIN", "SUPPORT"]) {
    assert.equal(cp04CanAccessSection(role, "perfil"), true, `${role} debe tener acceso a perfil`);
  }
});

test("ningún rol pierde acceso a reservas, torneos o comunidad por la nueva matriz", () => {
  for (const role of ["PLAYER", "STAFF", "ADMIN", "SUPPORT"]) {
    for (const s of ["reservas", "torneos", "comunidad"]) {
      assert.equal(cp04CanAccessSection(role, s), true, `${role} debe mantener acceso a ${s}`);
    }
  }
});

test("simulación: PLAYER forzando automatizaciones_bots no salta el guard (asistente_ia es diferente)", () => {
  const safeSection = cp04CanAccessSection("PLAYER", "automatizaciones_bots")
    ? "automatizaciones_bots"
    : cp04GetSafeStartSection("PLAYER");
  assert.equal(safeSection, "inicio");
  // asistente_ia sí es accesible para PLAYER (ruta legítima)
  assert.equal(cp04CanAccessSection("PLAYER", "asistente_ia"), true);
});
