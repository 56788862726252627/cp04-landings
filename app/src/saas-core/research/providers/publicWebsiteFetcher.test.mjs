import { test } from "node:test";
import assert from "node:assert/strict";
import http from "node:http";

import {
  normalizeUrl,
  resolveHostnameSafely,
  validateUrlForRealFetch,
  fetchPublicWebsite,
  collectFromPublicWebsite,
  isPathAllowedByRobots,
  performPinnedRequest,
  FetchError,
  FETCH_ERROR_CODES,
  DEFAULT_FETCHER_LIMITS,
} from "./publicWebsiteFetcher.js";
import { validateEvidence } from "../evidenceSchema.js";

// Un hostname ficticio que NUNCA se resuelve por DNS real en estos tests
// (siempre se inyecta `lookupFn`) pero cuya IP inyectada es una IP pública
// real (la de example.com) para que la validación SSRF (real, sin atajos)
// la acepte. Ningún test de este archivo toca Internet.
const FAKE_PUBLIC_HOST = "sitio-ficticio-de-pruebas.invalid";
const FAKE_PUBLIC_IP = "93.184.216.34";

function publicLookup() {
  return async (hostname, opts) => {
    if (opts && opts.all) return [{ address: FAKE_PUBLIC_IP, family: 4 }];
    return { address: FAKE_PUBLIC_IP, family: 4 };
  };
}

function privateLookup(ip) {
  return async (hostname, opts) => {
    if (opts && opts.all) return [{ address: ip, family: 4 }];
    return { address: ip, family: 4 };
  };
}

// ---- Pruebas de bajo nivel contra un servidor HTTP local real (sin red externa) ----

async function withLocalServer(handler, fn) {
  const server = http.createServer(handler);
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  const port = server.address().port;
  try {
    await fn(port);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

test("normalizeUrl es determinista: minúsculas, sin puerto por defecto, sin fragmento, sin barra final redundante", () => {
  assert.equal(normalizeUrl("HTTPS://Ejemplo.INVALID:443/Ruta/#seccion"), "https://ejemplo.invalid/Ruta");
  assert.equal(normalizeUrl("http://ejemplo.invalid/"), "http://ejemplo.invalid/");
  assert.equal(normalizeUrl("http://ejemplo.invalid"), normalizeUrl("http://ejemplo.invalid/"));
});

test("resolveHostnameSafely rechaza cuando el DNS (inyectado) resuelve a una IP privada — defensa DNS rebinding", async () => {
  const result = await resolveHostnameSafely("host-que-rebinds.invalid", { lookupFn: privateLookup("127.0.0.1") });
  assert.equal(result.safe, false);
  assert.equal(result.code, "SSRF_BLOCKED");
});

test("resolveHostnameSafely acepta cuando el DNS (inyectado) resuelve a una IP pública", async () => {
  const result = await resolveHostnameSafely(FAKE_PUBLIC_HOST, { lookupFn: publicLookup() });
  assert.equal(result.safe, true);
  assert.equal(result.address, FAKE_PUBLIC_IP);
});

test("resolveHostnameSafely devuelve DNS_ERROR estructurado si la resolución falla, sin lanzar", async () => {
  const result = await resolveHostnameSafely("no-existe.invalid", { lookupFn: async () => { throw new Error("ENOTFOUND"); } });
  assert.equal(result.safe, false);
  assert.equal(result.code, "DNS_ERROR");
});

test("validateUrlForRealFetch rechaza en la capa estática ANTES de tocar DNS (localhost)", async () => {
  const result = await validateUrlForRealFetch("http://localhost/", { lookupFn: publicLookup() });
  assert.equal(result.safe, false);
});

test("validateUrlForRealFetch rechaza cuando la capa estática pasa pero el DNS resuelve a IP privada", async () => {
  const result = await validateUrlForRealFetch(`http://${FAKE_PUBLIC_HOST}/`, { lookupFn: privateLookup("10.0.0.5") });
  assert.equal(result.safe, false);
  assert.equal(result.code, "SSRF_BLOCKED");
});

test("isPathAllowedByRobots respeta Disallow para el user-agent específico y para *", () => {
  const robots = "User-agent: ClubPadel04-ResearchBot\nDisallow: /privado\n\nUser-agent: *\nDisallow: /admin\n";
  assert.equal(isPathAllowedByRobots(robots, "ClubPadel04-ResearchBot", "/privado/x"), false);
  assert.equal(isPathAllowedByRobots(robots, "ClubPadel04-ResearchBot", "/publico"), true);
  assert.equal(isPathAllowedByRobots("User-agent: *\nDisallow: /admin\n", "OtroBot", "/admin/panel"), false);
});

test("isPathAllowedByRobots permite todo si no hay reglas Disallow (fail-open estándar)", () => {
  assert.equal(isPathAllowedByRobots("User-agent: *\n", "AnyBot", "/cualquier-ruta"), true);
  assert.equal(isPathAllowedByRobots("", "AnyBot", "/x"), true);
});

test("fetchPublicWebsite bloquea localhost/127.0.0.1 de extremo a extremo (sin servidor: se rechaza antes de conectar)", async () => {
  const result = await fetchPublicWebsite("http://127.0.0.1:1/", {}, {});
  assert.equal(result.status, "error");
  assert.equal(result.errorCode, "SSRF_BLOCKED");
});

test("fetchPublicWebsite bloquea el servicio de metadatos de nube", async () => {
  const result = await fetchPublicWebsite("http://169.254.169.254/latest/meta-data/", {}, {});
  assert.equal(result.errorCode, "SSRF_BLOCKED");
});

test("fetchPublicWebsite: contenido disponible con transporte simulado (sin red real) produce status=available y contentHash estable", async () => {
  const html = "<html><head><title>Sitio ficticio de pruebas</title></head><body><h1>Hola</h1></body></html>";
  const transportFn = async () => ({ statusCode: 200, headers: { "content-type": "text/html" }, contentType: "text/html", body: html, byteSize: html.length });
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.status, "available");
  assert.equal(result.httpStatus, 200);
  assert.ok(result.contentHash);
});

test("Paso 16 — fetchPublicWebsite reexpone cabeceras SEO relevantes (x-robots-tag, content-language) sin segunda petición", async () => {
  const html = "<html><head><title>t</title></head><body></body></html>";
  const transportFn = async () => ({ statusCode: 200, headers: { "content-type": "text/html", "x-robots-tag": "noindex", "content-language": "es" }, contentType: "text/html", body: html, byteSize: html.length });
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.headers["x-robots-tag"], "noindex");
  assert.equal(result.headers["content-language"], "es");
});

test("Paso 18 — fetchPublicWebsite reexpone cabeceras de rendimiento (content-length, content-encoding, cache-control, etag...) sin segunda petición", async () => {
  const html = "<html><head><title>t</title></head><body></body></html>";
  const transportFn = async () => ({
    statusCode: 200,
    headers: { "content-type": "text/html", "content-length": String(html.length), "content-encoding": "gzip", "cache-control": "max-age=3600", etag: '"abc123"', "last-modified": "Mon, 01 Jan 2024 00:00:00 GMT", vary: "Accept-Encoding" },
    contentType: "text/html",
    body: html,
    byteSize: html.length,
  });
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.headers["content-length"], String(html.length));
  assert.equal(result.headers["content-encoding"], "gzip");
  assert.equal(result.headers["cache-control"], "max-age=3600");
  assert.equal(result.headers.etag, '"abc123"');
  assert.equal(result.headers["last-modified"], "Mon, 01 Jan 2024 00:00:00 GMT");
  assert.equal(result.headers.vary, "Accept-Encoding");
});

test("Paso 18 — performPinnedRequest mide timing real (timeToHeadersMs <= totalMs) contra un servidor local real", async () => {
  await new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      setTimeout(() => {
        res.writeHead(200, { "content-type": "text/html" });
        res.end("<html></html>");
      }, 20);
    });
    server.listen(0, "127.0.0.1", async () => {
      try {
        const port = server.address().port;
        const url = new URL(`http://127.0.0.1:${port}/`);
        const response = await performPinnedRequest(url, "127.0.0.1", 4, { timeoutMs: 5000, maxBytes: 1_000_000, userAgent: "test" });
        assert.ok(response.timing.timeToHeadersMs >= 15, `timeToHeadersMs=${response.timing.timeToHeadersMs}`);
        assert.ok(response.timing.totalMs >= response.timing.timeToHeadersMs);
        assert.equal(response.httpVersion, "1.1");
        resolve();
      } catch (err) {
        reject(err);
      } finally {
        server.close();
      }
    });
  });
});

test("Paso 16 — fetchPublicWebsite reexpone robots.txt ya consultado (available:false si no existe, sin volver a pedirlo)", async () => {
  const html = "<html></html>";
  let robotsRequests = 0;
  const transportFn = async (url) => {
    if (url.pathname === "/robots.txt") {
      robotsRequests++;
      return { statusCode: 200, headers: { "content-type": "text/plain" }, contentType: "text/plain", body: "User-agent: *\nDisallow: /privado\nSitemap: https://example.invalid/sitemap.xml\n", byteSize: 10 };
    }
    return { statusCode: 200, headers: { "content-type": "text/html" }, contentType: "text/html", body: html, byteSize: html.length };
  };
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/`, { respectRobots: true }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.status, "available");
  assert.equal(result.robotsTxt.available, true);
  assert.match(result.robotsTxt.content, /Sitemap:/);
  assert.equal(robotsRequests, 1, "robots.txt no debería pedirse más de una vez para servir este resultado");
});

test("fetchPublicWebsite sigue una redirección segura y la revalida (no solo la URL inicial)", async () => {
  let call = 0;
  const transportFn = async () => {
    call++;
    if (call === 1) return { statusCode: 302, headers: { location: `http://${FAKE_PUBLIC_HOST}/destino` }, contentType: "", body: "", byteSize: 0 };
    return { statusCode: 200, headers: { "content-type": "text/html" }, contentType: "text/html", body: "<html><title>destino</title></html>", byteSize: 10 };
  };
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/origen`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.status, "available");
  assert.equal(result.redirectChain.length, 1);
});

test("fetchPublicWebsite rechaza una redirección hacia una IP privada (revalidación por destino, no solo por URL inicial)", async () => {
  const transportFn = async (url) => {
    if (url.pathname === "/origen") return { statusCode: 302, headers: { location: "http://192.168.1.50/interno" }, contentType: "", body: "", byteSize: 0 };
    return { statusCode: 200, headers: { "content-type": "text/html" }, contentType: "text/html", body: "no debería llegar aquí", byteSize: 10 };
  };
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/origen`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.status, "error");
  assert.equal(result.errorCode, "SSRF_BLOCKED");
});

test("fetchPublicWebsite respeta --max-redirects (TOO_MANY_REDIRECTS)", async () => {
  const transportFn = async (url) => ({ statusCode: 302, headers: { location: `http://${FAKE_PUBLIC_HOST}${url.pathname}-siguiente` }, contentType: "", body: "", byteSize: 0 });
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/a`, { respectRobots: false, maxRedirects: 2 }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.errorCode, "TOO_MANY_REDIRECTS");
  assert.equal(result.redirectChain.length, 3);
});

test("fetchPublicWebsite rechaza un tipo MIME no permitido sin leer más contenido", async () => {
  const transportFn = async () => ({ statusCode: 200, headers: { "content-type": "application/pdf" }, contentType: "application/pdf", body: "", byteSize: 0 });
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.status, "unavailable");
  assert.equal(result.errorCode, "UNSUPPORTED_MIME");
});

test("fetchPublicWebsite mapea HTTP 404 a HTTP_4XX y HTTP 503 a HTTP_5XX", async () => {
  const notFound = async () => ({ statusCode: 404, headers: {}, contentType: "text/html", body: "", byteSize: 0 });
  const serverError = async () => ({ statusCode: 503, headers: {}, contentType: "text/html", body: "", byteSize: 0 });
  const r1 = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn: notFound });
  const r2 = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn: serverError });
  assert.equal(r1.errorCode, "HTTP_4XX");
  assert.equal(r2.errorCode, "HTTP_5XX");
});

test("fetchPublicWebsite respeta robots.txt cuando está disponible y deniega la ruta solicitada", async () => {
  const transportFn = async (url) => {
    if (url.pathname === "/robots.txt") return { statusCode: 200, headers: { "content-type": "text/plain" }, contentType: "text/plain", body: "User-agent: *\nDisallow: /privado\n", byteSize: 30 };
    return { statusCode: 200, headers: { "content-type": "text/html" }, contentType: "text/html", body: "<html></html>", byteSize: 10 };
  };
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/privado/pagina`, { respectRobots: true }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.status, "unavailable");
  assert.equal(result.errorCode, "ROBOTS_DISALLOWED");
});

test("fetchPublicWebsite continúa (fail-open) si robots.txt no está disponible (404)", async () => {
  const transportFn = async (url) => {
    if (url.pathname === "/robots.txt") return { statusCode: 404, headers: {}, contentType: "", body: "", byteSize: 0 };
    return { statusCode: 200, headers: { "content-type": "text/html" }, contentType: "text/html", body: "<html><title>ok</title></html>", byteSize: 20 };
  };
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/pagina`, { respectRobots: true }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.status, "available");
});

test("fetchPublicWebsite propaga TIMEOUT como código estructurado cuando el transporte lanza FetchError", async () => {
  const transportFn = async () => {
    throw new FetchError("TIMEOUT", "la petición superó el timeout de 8000ms");
  };
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.status, "error");
  assert.equal(result.errorCode, "TIMEOUT");
});

test("fetchPublicWebsite propaga CONTENT_TOO_LARGE cuando el transporte lo señala", async () => {
  const transportFn = async () => {
    throw new FetchError("CONTENT_TOO_LARGE", "respuesta supera el límite de 2000000 bytes");
  };
  const result = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn });
  assert.equal(result.errorCode, "CONTENT_TOO_LARGE");
});

test("fetchPublicWebsite es determinista para la misma respuesta simulada (mismo contentHash)", async () => {
  const html = "<html><title>x</title></html>";
  const transportFn = async () => ({ statusCode: 200, headers: { "content-type": "text/html" }, contentType: "text/html", body: html, byteSize: html.length });
  const r1 = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn });
  const r2 = await fetchPublicWebsite(`http://${FAKE_PUBLIC_HOST}/`, { respectRobots: false }, { lookupFn: publicLookup(), transportFn });
  assert.equal(r1.contentHash, r2.contentHash);
});

test("collectFromPublicWebsite produce Evidence válida (schema) para páginas disponibles y para fallos", async () => {
  const transportFn = async (url) => {
    if (url.pathname === "/ok") return { statusCode: 200, headers: { "content-type": "text/html" }, contentType: "text/html", body: "<html><title>ok</title><meta name='viewport' content='w'></html>", byteSize: 40 };
    throw new Error("ECONNREFUSED");
  };
  const { evidence, pageResults, consultedUrls } = await collectFromPublicWebsite([`http://${FAKE_PUBLIC_HOST}/ok`, `http://${FAKE_PUBLIC_HOST}/falla`], { respectRobots: false, rateLimitMs: 0 }, { lookupFn: publicLookup(), transportFn });
  assert.equal(pageResults.length, 2);
  assert.equal(consultedUrls.length, 2);
  assert.ok(evidence.length > 1);
  for (const ev of evidence) {
    const { valid, errors } = validateEvidence(ev);
    assert.equal(valid, true, JSON.stringify(errors));
  }
  assert.ok(evidence.some((e) => e.classification === "unavailable"));
});

test("collectFromPublicWebsite respeta --max-pages (no consulta más de las páginas permitidas)", async () => {
  const transportFn = async () => ({ statusCode: 200, headers: { "content-type": "text/html" }, contentType: "text/html", body: "<html></html>", byteSize: 10 });
  const urls = [1, 2, 3, 4, 5].map((n) => `http://${FAKE_PUBLIC_HOST}/pagina-${n}`);
  const { consultedUrls } = await collectFromPublicWebsite(urls, { respectRobots: false, maxPages: 2, rateLimitMs: 0 }, { lookupFn: publicLookup(), transportFn });
  assert.equal(consultedUrls.length, 2);
});

test("FETCH_ERROR_CODES cubre la taxonomía de errores del enunciado", () => {
  for (const code of ["DNS_ERROR", "TIMEOUT", "TLS_ERROR", "INSECURE_REDIRECT", "CONTENT_TOO_LARGE", "UNSUPPORTED_MIME", "HTTP_4XX", "HTTP_5XX", "ROBOTS_DISALLOWED", "RATE_LIMITED", "CONNECTION_REFUSED"]) {
    assert.ok(FETCH_ERROR_CODES.includes(code), `falta código: ${code}`);
  }
});

test("DEFAULT_FETCHER_LIMITS declara valores seguros por defecto (respectRobots=true, tamaños/tiempos acotados)", () => {
  assert.equal(DEFAULT_FETCHER_LIMITS.respectRobots, true);
  assert.ok(DEFAULT_FETCHER_LIMITS.timeoutMs > 0 && DEFAULT_FETCHER_LIMITS.timeoutMs <= 30000);
  assert.ok(DEFAULT_FETCHER_LIMITS.maxBytes > 0);
  assert.ok(DEFAULT_FETCHER_LIMITS.maxRedirects <= 10);
});

// ---- performPinnedRequest: transporte de bajo nivel REAL contra un servidor
// HTTP local real (127.0.0.1) — nunca Internet. Esta función NO valida SSRF
// por diseño (esa es responsabilidad de fetchPublicWebsite/validateUrlForRealFetch);
// aquí se ejercita con un socket TCP real para probar timeout/tamaño/cabeceras
// de verdad, no simulados.

test("performPinnedRequest obtiene contenido real de un servidor HTTP local (socket real, sin Internet)", async () => {
  await withLocalServer(
    (req, res) => {
      res.writeHead(200, { "content-type": "text/html" });
      res.end("<html><title>servidor local real</title></html>");
    },
    async (port) => {
      const url = new URL(`http://127.0.0.1:${port}/`);
      const response = await performPinnedRequest(url, "127.0.0.1", 4, { timeoutMs: 3000, maxBytes: 100_000, userAgent: "test-agent" });
      assert.equal(response.statusCode, 200);
      assert.equal(response.contentType, "text/html");
      assert.match(response.body, /servidor local real/);
    }
  );
});

test("performPinnedRequest aplica el límite real de tamaño máximo y rechaza con CONTENT_TOO_LARGE", async () => {
  await withLocalServer(
    (req, res) => {
      res.writeHead(200, { "content-type": "text/plain" });
      res.end("x".repeat(5000));
    },
    async (port) => {
      const url = new URL(`http://127.0.0.1:${port}/`);
      await assert.rejects(
        () => performPinnedRequest(url, "127.0.0.1", 4, { timeoutMs: 3000, maxBytes: 1000, userAgent: "test-agent" }),
        (err) => err instanceof FetchError && err.code === "CONTENT_TOO_LARGE"
      );
    }
  );
});

test("performPinnedRequest respeta el timeout real (AbortController) contra un servidor que nunca responde", async () => {
  await withLocalServer(
    (req, res) => {
      // Nunca llama a res.end(): simula un servidor colgado.
    },
    async (port) => {
      const url = new URL(`http://127.0.0.1:${port}/`);
      await assert.rejects(
        () => performPinnedRequest(url, "127.0.0.1", 4, { timeoutMs: 200, maxBytes: 100_000, userAgent: "test-agent" }),
        (err) => err instanceof FetchError && err.code === "TIMEOUT"
      );
    }
  );
});

test("performPinnedRequest nunca envía cookies ni cabeceras de autenticación (verificado en el servidor real)", async () => {
  await withLocalServer(
    (req, res) => {
      res.writeHead(200, { "content-type": "text/plain", "x-received-cookie": req.headers.cookie ? "yes" : "no", "x-received-auth": req.headers.authorization ? "yes" : "no" });
      res.end("ok");
    },
    async (port) => {
      const url = new URL(`http://127.0.0.1:${port}/`);
      const response = await performPinnedRequest(url, "127.0.0.1", 4, { timeoutMs: 3000, maxBytes: 10_000, userAgent: "test-agent" });
      assert.equal(response.headers["x-received-cookie"], "no");
      assert.equal(response.headers["x-received-auth"], "no");
    }
  );
});

test("performPinnedRequest rechaza (CONNECTION_REFUSED) cuando no hay ningún servidor escuchando en el puerto", async () => {
  const url = new URL("http://127.0.0.1:1/"); // puerto 1: nada escucha ahí en un entorno normal
  await assert.rejects(
    () => performPinnedRequest(url, "127.0.0.1", 4, { timeoutMs: 1500, maxBytes: 10_000, userAgent: "test-agent" }),
    (err) => err instanceof FetchError
  );
});
