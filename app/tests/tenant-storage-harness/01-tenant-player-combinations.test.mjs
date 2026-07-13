// Harness T-ISO — Escenarios 1-5 (combinaciones tenant/player + cambio de
// tenant). Ejercita src/auth/authService.js real (Lote A+D ya
// implementados hoy, confirmado por lectura de código antes de escribir
// este archivo) — no se modifica ese archivo, solo se importa como
// consumidor, mismo patrón que src/auth/authService.tenantIsolation.test.mjs.
//
// Clasificación de cada test: PASS (se ejecuta y confirma el
// comportamiento correcto de hoy) | EXPECTED FAIL (se ejecuta y documenta
// una brecha ya conocida) | BLOCKED (no se puede construir sin una pieza
// que aún no existe).

import test from "node:test";
import assert from "node:assert/strict";
import { createMockStorage } from "./harness/mockStorage.js";
import tenants from "../../fixtures/tenant-storage-harness/tenants.json" with { type: "json" };
import players from "../../fixtures/tenant-storage-harness/players.json" with { type: "json" };

let importCounter = 0;

async function loginAs({ hostname, storage, player }) {
  globalThis.window = { localStorage: storage, location: { hostname } };
  importCounter += 1;
  const authService = await import(`../../src/auth/authService.js?tHarness=${importCounter}`);
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
  return authService;
}

// 1. Tenant cp04 + playerA
test("[PASS] 1. Tenant cp04 + playerA: login namespacea el token bajo tenant:cp04:*", async () => {
  const storage = createMockStorage();
  await loginAs({ hostname: tenants.cp04.hostname, storage, player: players.playerA });
  const dump = storage._dump();
  assert.equal(dump["tenant:cp04:cp04_access_token"], players.playerA.accessToken);
});

// 2. Tenant cp04 + playerB (mismo tenant, segundo jugador, storage propio)
test("[PASS] 2. Tenant cp04 + playerB: mismo namespace de tenant, token propio de B", async () => {
  const storage = createMockStorage();
  const authService = await loginAs({ hostname: tenants.cp04.hostname, storage, player: players.playerB });
  const dump = storage._dump();
  assert.equal(dump["tenant:cp04:cp04_access_token"], players.playerB.accessToken);
  assert.equal(authService.getCurrentUser().user.email, players.playerB.email);
});

// 3. Tenant club02 + playerA (misma identidad de jugador, tenant distinto)
test("[PASS] 3. Tenant club02 + playerA: mismo player, namespace de tenant distinto al de cp04", async () => {
  const storage = createMockStorage();
  await loginAs({ hostname: tenants.club02.hostname, storage, player: players.playerA });
  const dump = storage._dump();
  assert.equal(dump[`tenant:${tenants.club02.tenantId}:cp04_access_token`], players.playerA.accessToken);
  assert.equal("tenant:cp04:cp04_access_token" in dump, false);
});

// 4. Cambio A -> B (mismo storage compartido, sesión de A activa, se loguea B)
test("[PASS] 4. A -> B: login de club02 no pisa ni borra el token namespaced de cp04", async () => {
  const shared = createMockStorage();
  const a = await loginAs({ hostname: tenants.cp04.hostname, storage: shared, player: players.playerA });
  const b = await loginAs({ hostname: tenants.club02.hostname, storage: shared, player: players.playerB });

  const dump = shared._dump();
  assert.equal(dump["tenant:cp04:cp04_access_token"], players.playerA.accessToken);
  assert.equal(dump[`tenant:${tenants.club02.tenantId}:cp04_access_token`], players.playerB.accessToken);
  assert.equal(a.getAccessToken(), players.playerA.accessToken);
  assert.equal(b.getAccessToken(), players.playerB.accessToken);
});

// 5. Cambio B -> A (inverso de #4, mismo storage compartido)
test("[PASS] 5. B -> A: login de cp04 no pisa ni borra el token namespaced de club02", async () => {
  const shared = createMockStorage();
  const b = await loginAs({ hostname: tenants.club02.hostname, storage: shared, player: players.playerB });
  const a = await loginAs({ hostname: tenants.cp04.hostname, storage: shared, player: players.playerA });

  const dump = shared._dump();
  assert.equal(dump[`tenant:${tenants.club02.tenantId}:cp04_access_token`], players.playerB.accessToken);
  assert.equal(dump["tenant:cp04:cp04_access_token"], players.playerA.accessToken);
  assert.equal(b.getAccessToken(), players.playerB.accessToken);
  assert.equal(a.getAccessToken(), players.playerA.accessToken);
});
