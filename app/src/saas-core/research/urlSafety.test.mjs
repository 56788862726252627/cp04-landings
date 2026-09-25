import { test } from "node:test";
import assert from "node:assert/strict";

import { classifyUrl, isSafePublicUrl, resolveSafeLocalPath, isSafeLocalPath, classifyIpAddress, ALLOWED_URL_SCHEMES } from "./urlSafety.js";

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

test("classifyIpAddress bloquea multicast IPv4 (224.0.0.0/4) y broadcast (255.255.255.255)", () => {
  assert.equal(classifyIpAddress("224.0.0.1").safe, false);
  assert.equal(classifyIpAddress("239.255.255.255").safe, false);
  assert.equal(classifyIpAddress("255.255.255.255").safe, false);
});

test("classifyIpAddress bloquea rangos reservados/documentación IPv4 (TEST-NET-1/2/3, 240.0.0.0/4)", () => {
  for (const ip of ["192.0.2.1", "198.51.100.1", "203.0.113.1", "240.0.0.1", "250.1.2.3"]) {
    assert.equal(classifyIpAddress(ip).safe, false, ip);
  }
});

test("classifyIpAddress bloquea multicast IPv6 (ff00::/8)", () => {
  assert.equal(classifyIpAddress("ff02::1").safe, false);
});

test("classifyIpAddress reevalúa IPv4 mapeada en IPv6 (::ffff:127.0.0.1) con las mismas reglas", () => {
  assert.equal(classifyIpAddress("::ffff:127.0.0.1").safe, false);
  assert.equal(classifyIpAddress("::ffff:8.8.8.8").safe, true);
});

test("classifyIpAddress acepta IPs públicas normales (IPv4 e IPv6)", () => {
  assert.equal(classifyIpAddress("93.184.216.34").safe, true);
  assert.equal(classifyIpAddress("2606:2800:220:1:248:1893:25c8:1946").safe, true);
});

test("classifyIpAddress rechaza entradas vacías o irreconocibles sin lanzar", () => {
  assert.equal(classifyIpAddress("").safe, false);
  assert.equal(classifyIpAddress("no-es-una-ip").safe, false);
  assert.equal(classifyIpAddress(null).safe, false);
});
