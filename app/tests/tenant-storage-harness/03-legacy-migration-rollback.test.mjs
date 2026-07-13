// Harness T-ISO — Escenarios 9-11 (claves legacy cp04_*, migración futura,
// rollback). Usa fixtures/tenant-storage-harness/storage-legacy.snapshot.json
// como estado de partida: un navegador con datos de un build ANTERIOR al
// Lote A/D.
//
// Cobertura real hoy: solo accessToken/refreshToken/user (Lote A) tienen
// lectura de compatibilidad + migración lazy-on-write + rollback seguro.
// El resto de claves legacy (perfil/torneo/registro) no tiene ninguna
// lógica de migración todavía (Lote C/G/I no implementados) — se marca
// BLOCKED, no EXPECTED FAIL, porque no hay ningún comportamiento de
// migración que ejercitar todavía (ni bueno ni malo: simplemente no existe).

import test from "node:test";
import assert from "node:assert/strict";
import { createMockStorage } from "./harness/mockStorage.js";
import legacySnapshot from "../../fixtures/tenant-storage-harness/storage-legacy.snapshot.json" with { type: "json" };

let importCounter = 0;

async function freshAuthService(storage) {
  globalThis.window = { localStorage: storage, location: { hostname: "unknown-host.example" } };
  importCounter += 1;
  return import(`../../src/auth/authService.js?tHarness3=${importCounter}`);
}

function legacyStorageFixture() {
  // Copia deliberada (no referencia) para que cada test parta del snapshot intacto.
  const { _comment, ...keys } = legacySnapshot;
  return createMockStorage(keys);
}

test("[PASS] 9. Claves legacy cp04_*: una sesión guardada solo en formato antiguo se restaura igual sin volver a loguearse", async () => {
  const storage = legacyStorageFixture();
  const authService = await freshAuthService(storage);

  assert.equal(authService.getAccessToken(), legacySnapshot.cp04_access_token);
  assert.equal(authService.getCurrentUser().user.email, "veterano@clubpadel04.example");
  assert.equal(authService.getCurrentUser().role, "STAFF");
  // La clave legacy no se toca solo por leerla.
  assert.equal(storage.getItem("cp04_access_token"), legacySnapshot.cp04_access_token);
  assert.equal(storage.getItem("tenant:cp04:cp04_access_token"), null);
});

test("[PASS] 10a. Migración (auth, Lote A): la siguiente escritura real migra a la clave namespaced sin tocar todavía la legacy", async () => {
  const storage = legacyStorageFixture();
  const authService = await freshAuthService(storage);

  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({ ok: true, user: { email: "veterano@clubpadel04.example", role: "ADMIN" }, role: "ADMIN" }),
      { status: 200 }
    );
  try {
    await authService.getSession();
  } finally {
    globalThis.fetch = original;
  }

  const dump = storage._dump();
  assert.equal(JSON.parse(dump["tenant:cp04:cp04_user"]).role, "ADMIN");
  assert.equal(dump.cp04_access_token, legacySnapshot.cp04_access_token, "legacy intacta, no se sobreescribe todavía");
});

test("[BLOCKED — LOTE C/G] 10b. Migración de datos de negocio (torneo/perfil/registro): sin lógica de migración que ejercitar todavía", (t) => {
  t.skip(
    "Lote C (business data namespacing) y Lote G (migración legacy general) no están implementados en App.jsx hoy " +
      "(confirmado por lectura de código: TORNEO_STORE/cp04_avatar/cp04_register_* siguen usando claves planas sin " +
      "ninguna función de migración). No existe ningún comportamiento — correcto ni incorrecto — que este test pueda " +
      "invocar sin inventar una API que todavía no existe. Reactivar cuando Lote C/G aterricen."
  );
});

test("[PASS] 11. Rollback seguro (auth): revertir el deploy no pierde la sesión porque la legacy nunca se sobreescribe fuera de logout explícito", async () => {
  const storage = legacyStorageFixture();
  const authService = await freshAuthService(storage);

  // Con el código nuevo cargado, un flujo de solo-lectura (sin login/getSession
  // que cambie de rol) no debe tocar la clave legacy en absoluto.
  assert.equal(authService.getAccessToken(), legacySnapshot.cp04_access_token);
  const dump = storage._dump();
  assert.equal(dump.cp04_access_token, legacySnapshot.cp04_access_token);
  // Si el deploy se revirtiera ahora mismo, un build viejo que solo conoce
  // la clave plana seguiría encontrando su valor intacto.
});
