import { test } from "node:test";
import assert from "node:assert/strict";

import { classifyUrl, isSafePublicUrl, resolveSafeLocalPath, isSafeLocalPath, ALLOWED_URL_SCHEMES } from "./urlSafety.js";

test("classifyUrl acepta una URL https pública normal", () => {
  const result = classifyUrl("https://ejemplo-negocio.invalid/servicios");
  assert.equal(result.safe, true);
  assert.ok(result.url instanceof URL);
});

test("classifyUrl rechaza esquemas peligrosos (file:, javascript:, data:, ftp:)", () => {
  for (const url of ["file:///etc/passwd", "javascript:alert(1)", "data:text/html,<script>", "ftp://ejemplo.invalid/archivo"]) {
    const result = classifyUrl(url);
    assert.equal(result.safe, false, `${url} debería ser inseguro`);
  }
  assert.deepEqual([...ALLOWED_URL_SCHEMES], ["http:", "https:"]);
});

test("classifyUrl bloquea localhost y variantes", () => {
  for (const url of ["http://localhost/", "http://localhost:3000/admin", "http://LOCALHOST/"]) {
    assert.equal(classifyUrl(url).safe, false, url);
  }
});

test("classifyUrl bloquea IPv4 loopback y privadas (RFC1918)", () => {
  for (const url of ["http://127.0.0.1/", "http://10.0.0.5/", "http://192.168.1.1/", "http://172.16.0.1/", "http://172.31.255.255/"]) {
    assert.equal(classifyUrl(url).safe, false, url);
  }
});

test("classifyUrl no bloquea una IPv4 pública fuera de rango 172.16-31", () => {
  assert.equal(classifyUrl("http://172.32.0.1/").safe, true);
  assert.equal(classifyUrl("http://172.15.0.1/").safe, true);
});

test("classifyUrl bloquea el servicio de metadatos de nube (169.254.169.254)", () => {
  assert.equal(classifyUrl("http://169.254.169.254/latest/meta-data/").safe, false);
});

test("classifyUrl bloquea IPv6 loopback y ULA/link-local", () => {
  for (const url of ["http://[::1]/", "http://[fe80::1]/", "http://[fc00::1]/", "http://[fd12:3456::1]/"]) {
    assert.equal(classifyUrl(url).safe, false, url);
  }
});

test("classifyUrl bloquea sufijos .local/.internal/.localhost", () => {
  for (const url of ["http://printer.local/", "http://api.internal/", "http://foo.localhost/"]) {
    assert.equal(classifyUrl(url).safe, false, url);
  }
});

test("classifyUrl bloquea URLs con credenciales embebidas", () => {
  assert.equal(classifyUrl("https://user:pass@ejemplo.invalid/").safe, false);
});

test("classifyUrl rechaza URL vacía o malformada sin lanzar", () => {
  assert.equal(classifyUrl("").safe, false);
  assert.equal(classifyUrl("no es una url").safe, false);
  assert.equal(classifyUrl(null).safe, false);
});

test("isSafePublicUrl es un atajo booleano coherente con classifyUrl", () => {
  assert.equal(isSafePublicUrl("https://ejemplo.invalid/"), true);
  assert.equal(isSafePublicUrl("http://127.0.0.1/"), false);
});

test("resolveSafeLocalPath acepta una ruta relativa dentro del directorio base", () => {
  const result = resolveSafeLocalPath("/root/cp04-t-public-research-audit/app/src/saas-core/research", "fixtures/demo.html");
  assert.equal(result.safe, true);
  assert.ok(result.resolvedPath.endsWith("fixtures/demo.html"));
});

test("resolveSafeLocalPath rechaza un path traversal clásico (../../)", () => {
  const result = resolveSafeLocalPath("/root/cp04-t-public-research-audit/app/src/saas-core/research/fixtures", "../../../../../etc/passwd");
  assert.equal(result.safe, false);
});

test("resolveSafeLocalPath rechaza una ruta absoluta fuera del directorio base", () => {
  const result = resolveSafeLocalPath("/root/cp04-t-public-research-audit/app/src/saas-core/research/fixtures", "/etc/passwd");
  assert.equal(result.safe, false);
});

test("resolveSafeLocalPath rechaza bytes nulos", () => {
  const result = resolveSafeLocalPath("/tmp", "archivo\0.txt");
  assert.equal(result.safe, false);
});

test("isSafeLocalPath es un atajo booleano coherente", () => {
  assert.equal(isSafeLocalPath("/tmp/base", "sub/archivo.json"), true);
  assert.equal(isSafeLocalPath("/tmp/base", "../fuera.json"), false);
});
