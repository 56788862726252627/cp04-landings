import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04IsPathDenied, cp04ContentLooksLikeSecret, cp04ValidatePackageAgainstDenylist } from "./denylist.js";

test("cp04IsPathDenied detecta .env, .git, node_modules y claves/credenciales típicas", () => {
  for (const bad of [".env", ".env.production", ".git/config", "node_modules/x/index.js", "server.pem", "app.key", "credentials.json", "secrets.json", ".DS_Store"]) {
    assert.equal(cp04IsPathDenied(bad), true, `${bad} debería estar denegado`);
  }
});

test("cp04IsPathDenied permite rutas legítimas del paquete", () => {
  for (const good of ["contratos/contrato-demo.md", "logos/logo.svg", "manifest/manifest.json", "mockups/preview-ipad-horizontal.svg"]) {
    assert.equal(cp04IsPathDenied(good), false, `${good} no debería estar denegado`);
  }
});

test("cp04ContentLooksLikeSecret detecta patrones de clave real, no texto normal", () => {
  assert.equal(cp04ContentLooksLikeSecret("sk_live_abcdefghijklmnop"), true);
  assert.equal(cp04ContentLooksLikeSecret("-----BEGIN RSA PRIVATE KEY-----"), true);
  assert.equal(cp04ContentLooksLikeSecret("Este es un contrato de demostración."), false);
});

test("cp04ValidatePackageAgainstDenylist nunca lanza y agrega todas las violaciones encontradas", () => {
  const entries = [
    { relativePath: "contratos/contrato-demo.md", content: "texto normal" },
    { relativePath: ".env", content: "SECRET=1" },
    { relativePath: "logos/logo.svg", content: "<svg/>" },
  ];
  const result = cp04ValidatePackageAgainstDenylist(entries);
  assert.equal(result.valid, false);
  assert.equal(result.violations.length, 1);
  assert.equal(result.violations[0].relativePath, ".env");
});

test("cp04ValidatePackageAgainstDenylist es válido cuando no hay ninguna violación", () => {
  const result = cp04ValidatePackageAgainstDenylist([{ relativePath: "informes/informe.md", content: "Todo correcto." }]);
  assert.deepEqual(result, { valid: true, violations: [] });
});

test("cp04ValidatePackageAgainstDenylist con lista vacía o ausente no lanza", () => {
  assert.equal(cp04ValidatePackageAgainstDenylist([]).valid, true);
  assert.equal(cp04ValidatePackageAgainstDenylist(undefined).valid, true);
});
