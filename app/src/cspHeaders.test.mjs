import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

// Bloqueo P0 2026-08-25 (tercera parte): la CSP de public/_headers
// (`connect-src 'self'`) bloqueaba en cualquier navegador real el fetch()
// a la URL absoluta del Worker que cp04BuildApiUrl construye para preview/
// producción — confirmado con Chromium real: "Refused to connect ...
// violates ... connect-src 'self'". curl nunca lo detectó porque CSP es
// una restricción exclusiva del navegador. Login/disponibilidad/reservas
// compartían el mismo bloqueo. Este test lee el _headers real (no una
// copia) para que un futuro cambio que quite el origen del Worker de
// connect-src rompa el test en vez de descubrirse en producción.

const WORKER_ORIGIN = "https://cp04-reservas-proxy.eduardorodriguezrodriguez24.workers.dev";

const headersPath = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "_headers");
const headersContent = readFileSync(headersPath, "utf-8");

function extractDirective(name) {
  const linea = headersContent.split("\n").find((l) => l.trim().startsWith("Content-Security-Policy:"));
  assert.ok(linea, "public/_headers debe declarar Content-Security-Policy");
  const match = linea.match(new RegExp(`${name}\\s+([^;]+);`));
  return match ? match[1].trim() : null;
}

test("public/_headers: connect-src permite 'self' (peticiones same-origin siguen funcionando)", () => {
  const connectSrc = extractDirective("connect-src");
  assert.ok(connectSrc, "connect-src debe existir en la CSP");
  assert.ok(connectSrc.split(/\s+/).includes("'self'"), "connect-src debe conservar 'self'");
});

test("public/_headers: connect-src incluye el origen público del Worker (fix del bloqueo P0 de login/disponibilidad/reservas)", () => {
  const connectSrc = extractDirective("connect-src");
  assert.ok(
    connectSrc.split(/\s+/).includes(WORKER_ORIGIN),
    `connect-src debe incluir exactamente "${WORKER_ORIGIN}", encontrado: "${connectSrc}"`,
  );
});

test("public/_headers: connect-src nunca usa '*' (nunca abre la conexión a cualquier origen)", () => {
  const connectSrc = extractDirective("connect-src");
  assert.ok(!connectSrc.includes("*"), "connect-src no debe contener un comodín");
});

test("public/_headers: el resto de la política (object-src, frame-ancestors, script-src) sigue intacto", () => {
  assert.match(headersContent, /object-src 'none'/);
  assert.match(headersContent, /frame-ancestors 'none'/);
  assert.match(headersContent, /script-src 'self'/);
});
