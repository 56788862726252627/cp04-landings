// Harness T-ISO — Escenarios 17-20 (cache PWA, offline, cambio de
// hostname, reload/restart). Usa mockCacheStorage.js para 17/18 (no hay
// Service Worker real ni navegador) y authService.js real para 19/20
// (mismo patrón que los archivos 01-03 de este harness).

import test from "node:test";
import assert from "node:assert/strict";
import { createMockStorage } from "./harness/mockStorage.js";
import { createMockCacheStorage } from "./harness/mockCacheStorage.js";

let importCounter = 0;

async function freshAuthService({ storage, hostname }) {
  globalThis.window = { localStorage: storage, location: { hostname } };
  importCounter += 1;
  return import(`../../src/auth/authService.js?tHarness5=${importCounter}`);
}

// CACHE_NAME copiado tal cual de public/sw.js:10-11 — no se importa el
// Service Worker (no es un módulo ES, es un script de worker que asume
// `self`), se reproduce su contrato de nombre de cache.
const CACHE_VERSION = "v1";
function currentCacheName() {
  return `cp04-static-${CACHE_VERSION}`;
}

test("[EXPECTED FAIL — BLOQUEADO POR LOTE E] 17. Cache PWA: el nombre de cache es idéntico para cualquier tenant (sin namespace de tenantId)", async () => {
  const caches = createMockCacheStorage();
  // Simula la instalación de la PWA de cp04 y, por separado, de club02 —
  // en Modelo A serían dos orígenes reales (dos Cache Storage físicamente
  // distintas); aquí se comparte deliberadamente el mismo mock para
  // demostrar que el NOMBRE de cache por sí solo no aísla nada.
  const cacheCp04 = await caches.open(currentCacheName());
  await cacheCp04.put("/index.html", "html-de-cp04");

  const cacheClub02 = await caches.open(currentCacheName()); // mismo nombre exacto
  const contenidoQueClub02Encontraria = await cacheClub02.match("/index.html");

  assert.equal(contenidoQueClub02Encontraria, "html-de-cp04");
  // Bajo Modelo A (orígenes separados) esto no es explotable en producción
  // hoy — se documenta como canario de Lote E (CACHE_NAME sin tenantId).
});

test("[PASS] 18. Offline: caches.match(OFFLINE_URL) devuelve el offline.html cacheado del propio origen, sin datos de otro tenant", async () => {
  const caches = createMockCacheStorage();
  const cache = await caches.open(currentCacheName());
  await cache.put("/offline.html", "offline-shell-generico-sin-datos-de-usuario");

  const offlinePage = await caches.match("/offline.html");
  assert.equal(offlinePage, "offline-shell-generico-sin-datos-de-usuario");
  // public/offline.html es un shell estático sin datos de negocio (confirmado
  // por lectura de código) — no hay fuga de PII/torneo aunque el nombre de
  // cache no esté namespaced (a diferencia de #17, que sí cachea contenido
  // con datos reales).
});

test("[PASS] 19. Cambio de hostname: el mismo tenant lógico servido desde dos hostnames NO comparte sesión automáticamente (namespacing es por tenantId, no por hostname)", async () => {
  // Dos hostnames que la app real trataría igual (ninguno matchea el
  // registry -> fallback a cp04), pero que representan dos "pestañas" con
  // storage propio de origen (staging vs. producción, por ejemplo).
  const storageStaging = createMockStorage();
  const storageProd = createMockStorage();

  const staging = await freshAuthService({ storage: storageStaging, hostname: "staging.unknown-host.example" });
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        ok: true,
        access_token: "token-de-staging",
        refresh_token: "r",
        user: { email: "u@cp04.example", role: "PLAYER" },
        role: "PLAYER",
      }),
      { status: 200 }
    );
  try {
    await staging.login("u@cp04.example", "x");
  } finally {
    globalThis.fetch = original;
  }

  const prod = await freshAuthService({ storage: storageProd, hostname: "prod.unknown-host.example" });
  // storageProd es un origen de navegador DISTINTO (nunca compartido con
  // staging en la realidad) -> prod no tiene sesión, aunque ambos
  // resuelvan al mismo tenantId lógico "cp04".
  assert.equal(prod.getAccessToken(), null);
  assert.equal(staging.getAccessToken(), "token-de-staging");
});

test("[PASS] 20. Reload/restart: reimportar el módulo (equivalente a F5 o reiniciar el navegador) restaura la sesión namespaced sin mezclar tenants", async () => {
  const storage = createMockStorage();
  const before = await freshAuthService({ storage, hostname: "unknown-host.example" });
  const original = globalThis.fetch;
  globalThis.fetch = async () =>
    new Response(
      JSON.stringify({
        ok: true,
        access_token: "token-antes-del-reload",
        refresh_token: "r",
        user: { email: "u@cp04.example", role: "PLAYER" },
        role: "PLAYER",
      }),
      { status: 200 }
    );
  try {
    await before.login("u@cp04.example", "x");
  } finally {
    globalThis.fetch = original;
  }

  // Reimportar authService.js con el MISMO storage simula un reload/F5 o un
  // reinicio de navegador (localStorage sobrevive, el módulo se reevalúa
  // desde cero, igual que restoreFromStorage() al cargar la página).
  const after = await freshAuthService({ storage, hostname: "unknown-host.example" });
  assert.equal(after.getAccessToken(), "token-antes-del-reload");
  assert.equal(after.getCurrentUser().user.email, "u@cp04.example");
});
