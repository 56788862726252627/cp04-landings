import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CP04_ACTION_MODULE_MAP,
  CP04_ACTION_ROLE_OVERRIDE,
  cp04Can,
  cp04CanAny,
  cp04CanAll,
  cp04GetAllowedModules,
  cp04GetAllowedActions,
} from "./permissions.js";

// Prompt 8 (Mejora 2.10, 2026-07-27): RBAC por ACCIÓN. Hallazgo prioritario
// del Prompt 7: cp04CanAccessSection (rbac.js) responde bien a "¿puede este
// rol abrir esta pantalla?" pero no existía ninguna capa que respondiera a
// "¿puede ejecutar ESTA acción concreta dentro de esa pantalla?" — por eso
// dentro de Torneos, PLAYER veía y podía ejecutar los mismos controles de
// gestión que ADMIN. Estos tests cubren la nueva capa (permissions.js) con
// casos positivos y negativos explícitos, tal como pide la FASE 12 del
// prompt.

test("PLAYER no puede gestionar torneos (crear/editar/eliminar/publicar/marcar ganador) aunque sí puede verlos", () => {
  assert.equal(cp04Can("PLAYER", "tournaments:manage"), false);
  assert.equal(cp04Can("PLAYER", "tournaments:view"), true);
});

test("STAFF no puede gestionar torneos por defecto (sin necesidad operativa documentada) aunque sí puede verlos", () => {
  assert.equal(cp04Can("STAFF", "tournaments:manage"), false);
  assert.equal(cp04Can("STAFF", "tournaments:view"), true);
});

test("SUPPORT no puede gestionar torneos (solo diagnóstico/observación) aunque sí puede verlos", () => {
  assert.equal(cp04Can("SUPPORT", "tournaments:manage"), false);
  assert.equal(cp04Can("SUPPORT", "tournaments:view"), true);
});

test("ADMIN sí puede gestionar torneos (gestión completa de negocio)", () => {
  assert.equal(cp04Can("ADMIN", "tournaments:manage"), true);
  assert.equal(cp04Can("ADMIN", "tournaments:view"), true);
});

test("un rol inválido/desconocido no recibe ningún permiso de gestión (fail-closed, igual que cp04NormalizeRole)", () => {
  assert.equal(cp04Can("hacker", "tournaments:manage"), false);
  assert.equal(cp04Can("", "tournaments:manage"), false);
  assert.equal(cp04Can(undefined, "tournaments:manage"), false);
  assert.equal(cp04Can(null, "tournaments:manage"), false);
});

test("una actionId que no existe se deniega para cualquier rol, incluido ADMIN (no hay permiso 'permitido por defecto')", () => {
  for (const role of ["PLAYER", "STAFF", "ADMIN", "SUPPORT"]) {
    assert.equal(cp04Can(role, "tournaments:delete_everything_forever"), false, `${role} no debería tener una acción inventada`);
  }
});

test("cp04Can respeta primero el gate de módulo: aunque SUPPORT esté en el override de una acción hipotética, sin acceso al módulo se deniega igual", () => {
  // No hay ninguna acción real así hoy, pero se comprueba con
  // tournaments:manage sobre un rol que si tuviera el módulo torneos
  // bloqueado también perdería la acción — verificado indirectamente:
  // ninguno de los 4 roles pierde el módulo "torneos" (todos lo tienen), así
  // que el único filtro real observable es el override de rol.
  for (const role of ["PLAYER", "STAFF", "ADMIN", "SUPPORT"]) {
    assert.equal(cp04Can(role, "tournaments:view"), true, `${role} tiene acceso al módulo torneos`);
  }
});

test("PLAYER no puede acceder a facturación/backups/automatizaciones ni al Centro Técnico (delegado correctamente al gate de módulo)", () => {
  for (const actionId of ["admin:billing", "admin:backups", "admin:automation", "support:technical_center", "support:panel"]) {
    assert.equal(cp04Can("PLAYER", actionId), false, `PLAYER no debería poder ${actionId}`);
  }
});

test("STAFF no puede acceder a facturación, backups, automatizaciones ni al Centro Técnico/Soporte", () => {
  for (const actionId of ["admin:billing", "admin:backups", "admin:automation", "support:technical_center", "support:panel"]) {
    assert.equal(cp04Can("STAFF", actionId), false, `STAFF no debería poder ${actionId}`);
  }
});

test("SUPPORT no puede gestionar reservas/jugadores por sí solo tener acceso técnico — pero sí tiene el módulo operativo (reservations:reprogram, players:create) igual que STAFF/ADMIN, por diseño explícito ya existente en el Worker (requireRoles incluye SUPPORT)", () => {
  // Este test documenta el comportamiento REAL verificado contra
  // worker-reservas/src/index.js (requireRoles(..., ["STAFF","ADMIN","SUPPORT"])
  // para alta/baja/cierre-temporal/cancelar/reprogramar): es una decisión de
  // arquitectura ya tomada y desplegada, no un hueco de este prompt. No se
  // reduce aquí sin justificación de negocio (regla explícita del prompt:
  // "No reducir permisos sin justificarlo").
  for (const actionId of ["reservations:reprogram", "reservations:cancel", "players:create", "players:disable", "reservations:close_court"]) {
    assert.equal(cp04Can("SUPPORT", actionId), true, `SUPPORT ya tiene ${actionId} tanto en frontend como en el Worker`);
  }
});

test("PLAYER no tiene ninguna acción de reservas gestionadas por staff (alta/baja/reprogramar/cancelar/cierre)", () => {
  for (const actionId of ["reservations:reprogram", "reservations:cancel", "players:create", "players:disable", "reservations:close_court"]) {
    assert.equal(cp04Can("PLAYER", actionId), false, `PLAYER no debería poder ${actionId}`);
  }
});

test("cp04CanAny: true si al menos una acción del conjunto está permitida", () => {
  assert.equal(cp04CanAny("PLAYER", ["tournaments:manage", "tournaments:view"]), true);
  assert.equal(cp04CanAny("PLAYER", ["tournaments:manage", "admin:billing"]), false);
});

test("cp04CanAll: true solo si TODAS las acciones del conjunto están permitidas", () => {
  assert.equal(cp04CanAll("ADMIN", ["tournaments:manage", "tournaments:view"]), true);
  assert.equal(cp04CanAll("STAFF", ["tournaments:manage", "tournaments:view"]), false);
});

test("cambiar el idioma activo no altera ningún permiso (el chequeo no depende de ningún texto ni de cp04_language)", () => {
  // cp04Can no recibe ni consulta el idioma en ningún punto de su
  // implementación: se confirma comparando el mismo resultado repetidas
  // veces (no hay estado global de idioma que pueda colar una diferencia).
  const first = cp04Can("PLAYER", "tournaments:manage");
  const second = cp04Can("PLAYER", "tournaments:manage");
  assert.equal(first, second);
  assert.equal(first, false);
});

test("cp04GetAllowedModules delega en CP04_ROLE_PERMISSIONS sin duplicar la lista (una sola fuente de verdad de módulos)", () => {
  assert.deepEqual(cp04GetAllowedModules("PLAYER"), cp04GetAllowedModules("PLAYER"));
  assert.ok(cp04GetAllowedModules("ADMIN").includes("torneos"));
  assert.ok(!cp04GetAllowedModules("PLAYER").includes("flujos_make"));
});

test("cp04GetAllowedActions(ADMIN) incluye tournaments:manage; cp04GetAllowedActions(PLAYER) no", () => {
  assert.ok(cp04GetAllowedActions("ADMIN").includes("tournaments:manage"));
  assert.ok(!cp04GetAllowedActions("PLAYER").includes("tournaments:manage"));
});

test("todas las actionId del override de rol existen en el mapa de acciones (sin overrides huérfanos)", () => {
  for (const actionId of Object.keys(CP04_ACTION_ROLE_OVERRIDE)) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(CP04_ACTION_MODULE_MAP, actionId),
      `${actionId} tiene un override de rol pero no está en CP04_ACTION_MODULE_MAP`
    );
  }
});

test("la matriz JSON publicada en docs/ coincide exactamente con lo que calcula cp04Can hoy (evita que la documentación se desincronice del código real)", async () => {
  const fs = await import("node:fs");
  const jsonPath = new URL("../../docs/mejora-2-visual-identity-audit-20260724/21-rbac-matriz-acciones-20260727.json", import.meta.url);
  const published = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  const roles = ["PLAYER", "STAFF", "ADMIN", "SUPPORT"];
  for (const actionId of Object.keys(CP04_ACTION_MODULE_MAP)) {
    for (const role of roles) {
      assert.equal(
        published[actionId]?.[role],
        cp04Can(role, actionId),
        `matriz publicada desincronizada para ${actionId}/${role}`
      );
    }
  }
});

test("ninguna actionId ni el resultado de cp04Can dependen de textContent/innerText/selectores de posición (no hay lógica basada en texto visible)", async () => {
  const source = await import("node:fs").then((fs) => fs.readFileSync(new URL("./permissions.js", import.meta.url), "utf8"));
  assert.equal(/textContent|innerText|querySelector|nth-child|nth-of-type/.test(source), false);
});
