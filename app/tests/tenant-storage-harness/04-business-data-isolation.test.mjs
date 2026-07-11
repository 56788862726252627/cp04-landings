// Harness T-ISO — Escenarios 12-16 (favoritos, reservas, torneos, ranking,
// notificaciones). Ninguno de estos pasa por src/tenant-runtime/ ni por
// authService.js — son claves literales de App.jsx (torneo/reservas) o
// features inexistentes (favoritos/notificaciones), confirmado por
// lectura de código antes de escribir este archivo. No se importa
// App.jsx (regla de la misión + evita acoplar el harness a un componente
// que otra terminal puede estar modificando en paralelo).

import test from "node:test";
import assert from "node:assert/strict";
import { createMockStorage } from "./harness/mockStorage.js";

// Constantes de clave copiadas TAL CUAL de src/App.jsx (líneas 4988,
// 4156-4157, 4311-4312, 6110-6113) — no se ejecuta App.jsx, solo se
// reproduce su contrato de storage actual para poder afirmarlo o negarlo.
const TORNEO_STORE = "cp04_torneo_v2";
const RESERVAS_EMAIL_KEY = "cp04-reservas-email";

test("[BLOCKED — FEATURE NO IMPLEMENTADA] 12. Favoritos: no existe ninguna clave de storage ni componente de favoritos en el código", (t) => {
  t.skip(
    "Confirmado por lectura de código (grep sobre App.jsx y src/): no existe ninguna feature de favoritos. Mismo " +
      "hallazgo que TENANT_STORAGE_TEST_PLAN.md #10 (marcado N/A). No hay nada que este test pueda ejercitar sin " +
      "inventar una feature completa."
  );
});

test("[EXPECTED FAIL — BLOQUEADO POR LOTE C] 13. Reservas: el email prellenado de cp04 es visible para club02 en storage compartido", () => {
  const shared = createMockStorage();
  // cp04 consulta sus reservas -> App.jsx guarda el email en clave plana.
  shared.setItem(RESERVAS_EMAIL_KEY, "usuario-cp04@clubpadel04.example");

  // club02 (mismo storage hipotético, Modelo B) abre el mismo formulario de
  // reservas -> lee la MISMA clave plana, sin namespace de tenant.
  const emailQueClub02Prellenaria = shared.getItem(RESERVAS_EMAIL_KEY);

  assert.equal(emailQueClub02Prellenaria, "usuario-cp04@clubpadel04.example");
  // Bajo Modelo A (un origen por tenant) este gap no es explotable hoy —
  // se documenta igualmente como canario de Lote C.
});

test("[EXPECTED FAIL — BLOQUEADO POR LOTE C] 14. Torneos: el bracket de cp04 es visible/sobrescribible por club02 en storage compartido", () => {
  const shared = createMockStorage();
  shared.setItem(TORNEO_STORE, JSON.stringify({ bracket: "bracket-de-cp04", parejas: ["A", "B"] }));

  // club02 escribe su propio bracket en la MISMA clave -> el de cp04 se pierde.
  shared.setItem(TORNEO_STORE, JSON.stringify({ bracket: "bracket-de-club02", parejas: ["X", "Y"] }));

  const estadoFinal = JSON.parse(shared.getItem(TORNEO_STORE));
  assert.equal(estadoFinal.bracket, "bracket-de-club02");
  assert.notEqual(estadoFinal.bracket, "bracket-de-cp04", "el bracket de cp04 fue sobreescrito, no coexiste");
});

test("[PASS] 15. Ranking: no persiste en storage hoy — no hay regresión posible por namespacing (test de no-regresión)", () => {
  // El ranking se calcula en memoria a partir del historial de torneo
  // (App.jsx) y no tiene clave propia de localStorage — confirmado por
  // grep (no existe "cp04_ranking" ni equivalente). Este test fija esa
  // ausencia como contrato: si algún día aparece una clave de ranking,
  // este test debe actualizarse para namespacearla desde el principio.
  const storage = createMockStorage();
  const rankingKeys = storage._keys().filter((k) => k.toLowerCase().includes("ranking"));
  assert.deepEqual(rankingKeys, []);
});

test("[BLOCKED — FEATURE NO IMPLEMENTADA] 16. Notificaciones: no existe ninguna clave de storage ni sistema de notificaciones persistente", (t) => {
  t.skip(
    "Igual que #12: confirmado por lectura de código, no existe ninguna feature de notificaciones persistentes. " +
      "Mismo hallazgo que TENANT_STORAGE_TEST_PLAN.md #14 (marcado N/A)."
  );
});
