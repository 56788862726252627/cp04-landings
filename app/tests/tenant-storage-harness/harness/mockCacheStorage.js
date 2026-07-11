// Mock mínimo de la Cache Storage API (window.caches) para el escenario
// #17 (cache PWA) y #18 (offline) del harness — sin Service Worker real ni
// navegador. Cubre solo la superficie que public/sw.js usa hoy:
// caches.open(name) / cache.put(req,res) / cache.match(req) / caches.keys()
// / caches.delete(name).
//
// Las claves de request se tratan como strings (URL/pathname), que es
// suficiente para probar colisión/aislamiento de NOMBRES de cache — no
// reimplementa matching real de Request/Response.

export function createMockCacheStorage() {
  const caches = new Map(); // cacheName -> Map(requestKey -> responseBody)

  return {
    async open(cacheName) {
      if (!caches.has(cacheName)) caches.set(cacheName, new Map());
      const store = caches.get(cacheName);
      return {
        async put(requestKey, responseBody) {
          store.set(requestKey, responseBody);
        },
        async match(requestKey) {
          return store.has(requestKey) ? store.get(requestKey) : undefined;
        },
      };
    },
    async keys() {
      return Array.from(caches.keys());
    },
    async delete(cacheName) {
      return caches.delete(cacheName);
    },
    async match(requestKey) {
      for (const store of caches.values()) {
        if (store.has(requestKey)) return store.get(requestKey);
      }
      return undefined;
    },
    // Helper propio del harness, no de la API real:
    _dump() {
      return Object.fromEntries(Array.from(caches.entries()).map(([name, store]) => [name, Object.fromEntries(store)]));
    },
  };
}
