// Club Pádel 04 · Service worker del shell estático.
//
// Alcance deliberadamente reducido: solo cachea el shell de la app
// (HTML de navegación, JS/CSS con hash de Vite, iconos/imágenes propias).
// Nunca intercepta /api/* — esas peticiones van siempre a red, para no
// arriesgar servir datos de reservas/roles obsoletos o cacheados.
//
// Versionado de caché: subir CACHE_VERSION invalida toda caché anterior
// (el paso "activate" borra cualquier caché con nombre distinto). Subido a
// v2 al sustituir el icono de la app (rayo morado -> logo oficial): es el
// mecanismo que fuerza a Android/navegadores a dejar de servir el favicon
// antiguo cacheado — ver docs/paso-app-icon-branding/ para el procedimiento
// completo de invalidación de icono en cada plataforma.
// v3: ampliado PRECACHE_URLS con icon-48/96/128/256 (disponibilidad offline).
const CACHE_VERSION = "v3";
const CACHE_NAME = `cp04-static-${CACHE_VERSION}`;
const OFFLINE_URL = "/offline.html";

const PRECACHE_URLS = [
  "/",
  OFFLINE_URL,
  "/manifest.webmanifest",
  "/favicon.ico",
  "/icons/icon-48.png",
  "/icons/icon-96.png",
  "/icons/icon-128.png",
  "/icons/icon-192.png",
  "/icons/icon-256.png",
  "/icons/icon-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .catch(() => {
        // Precache best-effort: si un asset falla (p. ej. offline durante el
        // primer install), no se bloquea la instalación del resto del SW.
      })
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) => Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});

function isApiRequest(url) {
  return url.pathname.startsWith("/api/");
}

function isStaticAsset(url) {
  return (
    url.pathname.startsWith("/assets/") ||
    url.pathname.startsWith("/gallery/") ||
    url.pathname.startsWith("/optimized/") ||
    url.pathname.startsWith("/images/") ||
    /\.(?:svg|png|jpg|jpeg|webp|avif|ico|woff2?)$/.test(url.pathname)
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // no intercepta fuentes/externos
  if (isApiRequest(url)) return; // API siempre a red, nunca cacheada

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request).catch(() => caches.match(request).then((cached) => cached || caches.match(OFFLINE_URL)))
    );
    return;
  }

  if (isStaticAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          }
          return response;
        });
      })
    );
  }
});
