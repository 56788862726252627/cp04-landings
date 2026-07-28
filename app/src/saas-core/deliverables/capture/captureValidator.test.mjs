import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04ValidatePngBuffer, cp04ValidateNoUnexpectedOverflow } from "./captureValidator.js";
import { cp04IsBrowserCaptureAvailable, cp04CreateBrowserCaptureAdapter } from "./browserCaptureAdapter.js";

test("un buffer vacío o que no es Buffer se rechaza sin lanzar", () => {
  assert.equal(cp04ValidatePngBuffer(null).valid, false);
  assert.equal(cp04ValidatePngBuffer(Buffer.alloc(0)).valid, false);
  assert.equal(cp04ValidatePngBuffer("no soy un buffer").valid, false);
});

test("una firma PNG incorrecta se rechaza", () => {
  const fake = Buffer.from("esto no es un PNG en absoluto, solo texto plano");
  const result = cp04ValidatePngBuffer(fake);
  assert.equal(result.valid, false);
  assert.match(result.errors[0], /firma incorrecta/);
});

test("cp04ValidateNoUnexpectedOverflow acepta un scrollWidth igual o ligeramente mayor al viewport, rechaza un desbordamiento real", () => {
  assert.equal(cp04ValidateNoUnexpectedOverflow(412, 412).valid, true);
  assert.equal(cp04ValidateNoUnexpectedOverflow(420, 412).valid, true); // dentro de tolerancia
  assert.equal(cp04ValidateNoUnexpectedOverflow(900, 412).valid, false);
});

test("cp04ValidateNoUnexpectedOverflow con valores no numéricos falla sin lanzar", () => {
  assert.equal(cp04ValidateNoUnexpectedOverflow(NaN, 412).valid, false);
});

// Tests con un PNG real (requieren el mismo Chromium cacheado que usa
// el resto de esta sesión) — se omiten con un aviso si no está
// disponible en el entorno de ejecución, nunca fingen un resultado.
const browserAvailable = cp04IsBrowserCaptureAvailable();

test("un PNG real de una página con contenido pasa la validación completa (dimensiones + heurístico de color sólido)", { skip: !browserAvailable && "Chromium no disponible en este entorno" }, async () => {
  const adapter = cp04CreateBrowserCaptureAdapter();
  try {
    const raw = await adapter.capture({ url: "http://localhost:5175", viewport: { width: 412, height: 915 } });
    const result = cp04ValidatePngBuffer(raw.buffer, { width: 412, height: 915 });
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.equal(result.width, 412);
    assert.equal(result.height, 915);
  } finally {
    await adapter.close();
  }
});

test("un PNG real de una página en blanco es detectado por el heurístico de color sólido", { skip: !browserAvailable && "Chromium no disponible en este entorno" }, async () => {
  const adapter = cp04CreateBrowserCaptureAdapter();
  try {
    const raw = await adapter.capture({ url: "about:blank", viewport: { width: 412, height: 915 } });
    const result = cp04ValidatePngBuffer(raw.buffer, { width: 412, height: 915 });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.includes("color sólido")));
  } finally {
    await adapter.close();
  }
});
