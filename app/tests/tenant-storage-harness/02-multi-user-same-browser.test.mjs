// Harness T-ISO — Escenarios 6-8 (dos usuarios en el mismo navegador,
// escalada de rol, logout de uno sin afectar al otro).
//
// Escenario 6 mezcla dos capas con estado MUY distinto hoy:
//  - auth (accessToken/refreshToken/user): namespaced por TENANT (Lote A),
//    no por usuario -> un segundo login del mismo tenant reemplaza al
//    primero en la MISMA clave (comportamiento esperado: un solo storage
//    de navegador solo puede recordar una sesión activa por tenant a la
//    vez, igual que hoy sin namespacing).
//  - perfil (avatar/bio/deporte/privacidad): clave PLANA sin namespace de
//    usuario (Lote B pendiente) -> colisión real ya documentada en
//    AUTH_STORAGE_SECURITY_AUDIT.md punto 14 y TENANT_STORAGE_TEST_PLAN.md
//    #30. Se reproduce aquí como EXPECTED FAIL (canario del gap, no un bug
//    nuevo).

import test from "node:test";
import assert from "node:assert/strict";
import { createMockStorage } from "./harness/mockStorage.js";
import players from "../../fixtures/tenant-storage-harness/players.json" with { type: "json" };

let importCounter = 0;

async function freshAuthService(storage, hostname = "unknown-host.example") {
  globalThis.window = { localStorage: storage, location: { hostname } };
  importCounter += 1;
  return import(`../../src/auth/authService.js?tHarness2=${importCounter}`);
}

async function loginAs(authService, player) {
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        ok: true,
        access_token: player.accessToken,
        refresh_token: player.refreshToken,
        user: { email: player.email, role: player.role },
        role: player.role,
      }),
      { status: 200 }
    );
  try {
    await authService.login(player.email, "x");
  } finally {
    globalThis.fetch = original;
  }
}

// Simula el mapa de campos de perfil de App.jsx (Perfil(), L6110-6113) tal
// cual existe HOY — claves planas, sin tenantId ni userId. No importa
// App.jsx (regla de la misión); reproduce el mismo contrato de clave leído
// por lectura directa del código.
function saveProfileField(storage, field, value) {
  const key = { avatar: "cp04_avatar", bio: "cp04_bio" }[field];
  storage.setItem(key, value);
}
function readProfileField(storage, field) {
  const key = { avatar: "cp04_avatar", bio: "cp04_bio" }[field];
  return storage.getItem(key);
}

test("[PASS] 6a. Dos usuarios mismo navegador: auth namespaced por tenant, el 2º login sustituye al 1º en su misma clave de tenant (comportamiento esperado, no una fuga)", async () => {
  const storage = createMockStorage();
  const svc1 = await freshAuthService(storage);
  await loginAs(svc1, players.playerA);
  assert.equal(storage._dump()["tenant:cp04:cp04_access_token"], players.playerA.accessToken);

  const svc2 = await freshAuthService(storage);
  await loginAs(svc2, players.playerB);
  assert.equal(storage._dump()["tenant:cp04:cp04_access_token"], players.playerB.accessToken);
  // svc1 en memoria conserva su propio token (proceso ya terminado, no relee storage) —
  // documenta que el reemplazo ocurre en storage, no que svc1 mágicamente cambie.
  assert.equal(svc1.getAccessToken(), players.playerA.accessToken);
});

test("[EXPECTED FAIL — BLOQUEADO POR LOTE B] 6b. Dos usuarios mismo navegador: el perfil (avatar/bio) de playerA queda visible para playerB tras el cambio de cuenta", () => {
  const storage = createMockStorage();
  saveProfileField(storage, "avatar", "avatar-de-playerA");
  saveProfileField(storage, "bio", "bio de playerA");

  // playerB inicia sesión en el mismo navegador (sin Lote B, no hay
  // limpieza ni namespacing por userId al cambiar de cuenta).
  const avatarVisibleParaB = readProfileField(storage, "avatar");
  const bioVisibleParaB = readProfileField(storage, "bio");

  // Se afirma explícitamente el gap: hoy playerB SÍ ve el perfil de
  // playerA. Este assert debe romperse (y el test debe reescribirse) el
  // día que Lote B namespacee estas claves por userId.
  assert.equal(avatarVisibleParaB, "avatar-de-playerA");
  assert.equal(bioVisibleParaB, "bio de playerA");
});

test("[PASS] 7. PLAYER -> ADMIN: la escalada de rol no afecta el namespacing de accessToken/refreshToken/user", async () => {
  const storage = createMockStorage();
  const svc = await freshAuthService(storage);
  await loginAs(svc, players.playerA);
  assert.equal(svc.getCurrentUser().role, "PLAYER");

  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({ ok: true, user: { email: players.adminA.email, role: "ADMIN" }, role: "ADMIN" }),
      { status: 200 }
    );
  try {
    await svc.getSession();
  } finally {
    globalThis.fetch = original;
  }

  assert.equal(svc.getCurrentUser().role, "ADMIN");
  // El token sigue en la misma clave namespaced de tenant (namespacing es
  // por tenant, no por rol — correcto, un cambio de rol no debe migrar de clave).
  assert.equal(storage._dump()["tenant:cp04:cp04_access_token"], players.playerA.accessToken);
});

test("[PASS] 8. Logout de A no afecta la sesión de B (tenant distinto, storage compartido)", async () => {
  const shared = createMockStorage();
  const a = await freshAuthService(shared, "unknown-host.example"); // cp04
  await loginAs(a, players.playerA);
  const b = await freshAuthService(shared, "club-deportivo-fixture-dos.pages.dev"); // fixture-club-02
  await loginAs(b, players.playerB);

  const original = globalThis.fetch;
  globalThis.fetch = async () => new Response(JSON.stringify({ ok: true }), { status: 200 });
  try {
    await a.logout();
  } finally {
    globalThis.fetch = original;
  }

  const dump = shared._dump();
  assert.equal("tenant:cp04:cp04_access_token" in dump, false);
  // B sigue intacto tras el logout de A.
  assert.equal(dump["tenant:fixture-club-02:cp04_access_token"], players.playerB.accessToken);
  assert.equal(b.getAccessToken(), players.playerB.accessToken);
});
