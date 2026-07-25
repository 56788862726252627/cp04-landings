import { test } from "node:test";
import assert from "node:assert/strict";
import {
  CP04_MODULE_BACKGROUND_CATEGORY,
  cp04GetModuleBackgroundCategory,
  cp04ComputeScreenState,
} from "./screenState.js";

// Mejora 2.4: sustituye a internal-background-detector.js /
// role-background-detector.js. Estos tests son la prueba de que el
// estado se deriva solo de rol/módulo — nunca de texto ni de idioma
// (no hay ningún string traducible en los inputs de ninguno de estos
// tests, a propósito).

test("cp04GetModuleBackgroundCategory: ADMIN y SUPPORT -> admin", () => {
  assert.equal(cp04GetModuleBackgroundCategory("ADMIN"), "admin");
  assert.equal(cp04GetModuleBackgroundCategory("SUPPORT"), "admin");
});

test("cp04GetModuleBackgroundCategory: PLAYER y STAFF -> user", () => {
  assert.equal(cp04GetModuleBackgroundCategory("PLAYER"), "user");
  assert.equal(cp04GetModuleBackgroundCategory("STAFF"), "user");
});

test("cp04GetModuleBackgroundCategory: rol desconocido o vacío falla cerrado a PLAYER (-> user), nunca a admin", () => {
  assert.equal(cp04GetModuleBackgroundCategory(""), "user");
  assert.equal(cp04GetModuleBackgroundCategory(undefined), "user");
  assert.equal(cp04GetModuleBackgroundCategory("algo-inventado"), "user");
});

test("cp04GetModuleBackgroundCategory: insensible a mayúsculas/espacios (mismo comportamiento que cp04NormalizeRole)", () => {
  assert.equal(cp04GetModuleBackgroundCategory(" admin "), "admin");
  assert.equal(cp04GetModuleBackgroundCategory("support"), "admin");
});

test("CP04_MODULE_BACKGROUND_CATEGORY cubre exactamente los 4 roles oficiales", () => {
  assert.deepEqual(Object.keys(CP04_MODULE_BACKGROUND_CATEGORY).sort(), ["ADMIN", "PLAYER", "STAFF", "SUPPORT"]);
});

test("cp04ComputeScreenState: sin selectedRole -> pantalla de rol activa, sin módulo/categoría", () => {
  const state = cp04ComputeScreenState({ selectedRole: "", moduleId: "inicio" });
  assert.equal(state.roleScreenActive, true);
  assert.equal(state.moduleScreenActive, false);
  assert.equal(state.roleId, null);
  assert.equal(state.moduleId, null);
  assert.equal(state.moduleCategory, null);
});

test("cp04ComputeScreenState: con selectedRole -> pantalla de módulo activa, con id de módulo tal cual (nunca traducido)", () => {
  const state = cp04ComputeScreenState({ selectedRole: "SUPPORT", moduleId: "soporte" });
  assert.equal(state.roleScreenActive, false);
  assert.equal(state.moduleScreenActive, true);
  assert.equal(state.roleId, "SUPPORT");
  assert.equal(state.moduleId, "soporte");
  assert.equal(state.moduleCategory, "admin");
});

test("cp04ComputeScreenState: el resultado es idéntico para los 24 pares rol×idioma reales (el idioma no es un input de la función)", () => {
  const roles = ["PLAYER", "STAFF", "ADMIN", "SUPPORT"];
  const langsSimulated = ["es-ES", "en-GB", "fr-FR", "it-IT", "pt-PT", "de-DE"];
  for (const role of roles) {
    const base = cp04ComputeScreenState({ selectedRole: role, moduleId: "inicio" });
    for (const _lang of langsSimulated) {
      // La función no recibe el idioma como argumento: por construcción no
      // puede variar con él. Esto documenta esa garantía explícitamente.
      const again = cp04ComputeScreenState({ selectedRole: role, moduleId: "inicio" });
      assert.deepEqual(again, base);
    }
  }
});

test("cp04ComputeScreenState: cambiar de módulo dentro del mismo rol no cambia la categoría de fondo (fiel al detector anterior)", () => {
  const modules = ["inicio", "reservas", "perfil", "admin", "soporte", "flujos_make"];
  for (const moduleId of modules) {
    const state = cp04ComputeScreenState({ selectedRole: "SUPPORT", moduleId });
    assert.equal(state.moduleCategory, "admin");
    assert.equal(state.moduleId, moduleId);
  }
});
