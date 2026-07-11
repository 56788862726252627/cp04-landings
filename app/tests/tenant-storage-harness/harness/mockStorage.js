// Harness aislado de storage — Misión T-ISO-HARNESS (2026-07-10).
//
// Simula localStorage/sessionStorage en Node sin abrir un navegador real,
// para poder ejercitar código de la app (authService.js, o claves literales
// de App.jsx) contra un objeto que implementa el mismo contrato mínimo
// (getItem/setItem/removeItem/key/length) que usa el código real. No
// sustituye una prueba de navegador real (ver TENANT_STORAGE_TEST_PLAN.md
// para los casos que SÍ requieren DevTools), solo cubre lo simulable.
//
// NO importa ni modifica src/tenant-runtime/buildStorageKey.js — solo lo
// consume como cualquier otro test (misma superficie que
// src/auth/authService.tenantIsolation.test.mjs).

export function createMockStorage(initial = {}) {
  const data = new Map(Object.entries(initial));
  return {
    getItem(k) {
      return data.has(k) ? data.get(k) : null;
    },
    setItem(k, v) {
      data.set(k, String(v));
    },
    removeItem(k) {
      data.delete(k);
    },
    key(i) {
      return Array.from(data.keys())[i] ?? null;
    },
    get length() {
      return data.size;
    },
    // Helpers propios del harness (no forman parte de la Web Storage API):
    _dump() {
      return Object.fromEntries(data);
    },
    _keys() {
      return Array.from(data.keys());
    },
    _clear() {
      data.clear();
    },
  };
}

// Dos instancias de storage independientes representan dos orígenes de
// navegador distintos (Modelo A: un dominio por tenant → storage nunca
// compartido de verdad). Un storage COMPARTIDO simula el caso hipotético
// de "Modelo B" (mismo origen, distintos tenants lógicos) que hoy no está
// desplegado pero que el contrato de namespacing debe seguir aislando.
export function createSharedMockStorage(initial = {}) {
  return createMockStorage(initial);
}

export function createIsolatedStoragePair(initialA = {}, initialB = {}) {
  return {
    storageA: createMockStorage(initialA),
    storageB: createMockStorage(initialB),
  };
}
