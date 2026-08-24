// Club Pádel 04 · Construcción centralizada de las URLs /api/* que el
// frontend llama contra el Worker cp04-reservas-proxy (disponibilidad y
// reservas: crear/cancelar/reprogramar).
//
// Bloqueo P0 2026-08-24: vite.config.js proxya /api/* al Worker real
// SOLO en `vite dev` (server.proxy) — Vite nunca incluye ese proxy en
// `vite build`. Cualquier preview o producción de Cloudflare Pages que
// sirva el build estático, con la ruta relativa /api/disponibilidad que
// se usaba antes, nunca llegaba al Worker: caía en el fallback SPA de
// Pages (200, text/html), que el frontend interpretaba como "0 reservas
// ocupadas" en vez de fallar — un falso "disponible" silencioso.
//
// VITE_CP04_PUBLIC_BOOKING_ENDPOINT pasa de "endpoint completo de
// reservas" a "URL base pública del Worker" (p.ej.
// https://cp04-reservas-proxy.eduardorodriguezrodriguez24.workers.dev,
// SIN barra final ni sufijo /api). No es un secreto — es el dominio
// público del propio Worker — pero se configura por entorno (build de
// preview/producción) en vez de hardcodearse en el código. Nunca se
// había configurado hasta ahora (confirmado: ningún build previo la
// llevaba embebida), así que no hay ningún valor antiguo que romper.
//
// Sin configurar (desarrollo local, `npm run dev`): base = "" -> rutas
// relativas /api/..., resueltas por el proxy de Vite contra el Worker
// real. Este es el único caso en el que /api/* sigue siendo relativo.

export function cp04ResolveApiBaseUrl(env) {
  const raw = env?.VITE_CP04_PUBLIC_BOOKING_ENDPOINT;
  if (typeof raw !== "string") return "";
  const trimmed = raw.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "");
}

// Une base + path sin duplicar ni perder la barra: base="" -> el path
// relativo tal cual (comportamiento de desarrollo, proxy de Vite).
// base="https://x" (o "https://x/") -> "https://x/api/algo", nunca
// "https://x//api/algo" ni "https://xapi/algo".
export function cp04BuildApiUrl(path, env) {
  const base = cp04ResolveApiBaseUrl(env);
  const cleanPath = `/${String(path || "").replace(/^\/+/, "")}`;
  return base ? `${base}${cleanPath}` : cleanPath;
}

export function cp04DisponibilidadEndpoint(env) {
  return cp04BuildApiUrl("/api/disponibilidad", env);
}

export function cp04ReservasEndpoint(env) {
  return cp04BuildApiUrl("/api/reservas", env);
}
