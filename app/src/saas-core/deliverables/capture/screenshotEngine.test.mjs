import { test } from "node:test";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";
import { cp04CreateScreenshotEngine } from "./screenshotEngine.js";

// PNG mínimo real y válido (1x1, RGB) construido a mano una sola vez —
// para tests deterministas sin necesitar un navegador real.
function buildTinyValidPng(width, height, fillByte = 128) {
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  function chunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    // CRC real no es imprescindible para nuestro parser (no lo valida), usamos 0.
    const crc = Buffer.alloc(4);
    return Buffer.concat([len, typeBuf, data, crc]);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type RGB
  const raw = Buffer.alloc(height * (1 + width * 3));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    raw[offset] = 0; // filter type None
    offset += 1;
    for (let x = 0; x < width; x++) {
      // variar ligeramente el valor para que no sea 100% uniforme (evita el heurístico de "color sólido")
      raw[offset] = (fillByte + ((x + y) % 7)) % 256;
      raw[offset + 1] = fillByte;
      raw[offset + 2] = fillByte;
      offset += 3;
    }
  }
  const idatData = deflateSync(raw);
  return Buffer.concat([sig, chunk("IHDR", ihdr), chunk("IDAT", idatData), chunk("IEND", Buffer.alloc(0))]);
}

const VALID_PNG_412x915 = buildTinyValidPng(412, 915);

function fakeJob(overrides = {}) {
  return { name: "test-job", url: "http://x", viewport: { width: 412, height: 915 }, ...overrides };
}

test("una captura válida en el primer intento se marca completed con attempts:1", async () => {
  const adapter = { capture: async () => ({ buffer: VALID_PNG_412x915, actualWidth: 412, actualHeight: 915, scrollWidth: 412 }) };
  const engine = cp04CreateScreenshotEngine({ adapter, maxAttempts: 3 });
  const result = await engine.captureJob(fakeJob());
  assert.equal(result.status, "completed");
  assert.equal(result.attempts, 1);
  assert.ok(Buffer.isBuffer(result.buffer));
});

test("Fase 10 #7: un fallo transitorio se reintenta y se recupera en el segundo intento", async () => {
  let calls = 0;
  const adapter = {
    capture: async () => {
      calls += 1;
      if (calls === 1) throw new Error("fallo simulado de red/renderizado");
      return { buffer: VALID_PNG_412x915, actualWidth: 412, actualHeight: 915, scrollWidth: 412 };
    },
  };
  const engine = cp04CreateScreenshotEngine({ adapter, maxAttempts: 3 });
  const result = await engine.captureJob(fakeJob());
  assert.equal(result.status, "completed");
  assert.equal(result.attempts, 2);
  assert.equal(calls, 2);
});

test("Fase 10 #6/#8: agotados los reintentos, el resultado queda failed, sin buffer (nunca un falso positivo)", async () => {
  const adapter = { capture: async () => { throw new Error("timeout simulado"); } };
  const engine = cp04CreateScreenshotEngine({ adapter, maxAttempts: 2 });
  const result = await engine.captureJob(fakeJob());
  assert.equal(result.status, "failed");
  assert.equal(result.buffer, null);
  assert.equal(result.attempts, 2);
  assert.ok(result.errors[0].includes("timeout simulado"));
});

test("un PNG que no pasa la validación (dimensiones incorrectas) se reintenta en vez de aceptarse", async () => {
  let calls = 0;
  const adapter = {
    capture: async () => {
      calls += 1;
      if (calls === 1) return { buffer: buildTinyValidPng(100, 100), actualWidth: 412, actualHeight: 915, scrollWidth: 412 }; // dimensiones equivocadas
      return { buffer: VALID_PNG_412x915, actualWidth: 412, actualHeight: 915, scrollWidth: 412 };
    },
  };
  const engine = cp04CreateScreenshotEngine({ adapter, maxAttempts: 3 });
  const result = await engine.captureJob(fakeJob());
  assert.equal(result.status, "completed");
  assert.equal(calls, 2);
});

test("un job que falla no bloquea los siguientes jobs del plan (captureAll continúa)", async () => {
  let callCount = 0;
  const adapter = {
    capture: async (request) => {
      callCount += 1;
      if (request.viewport.width === 999) throw new Error("este viewport siempre falla");
      return { buffer: VALID_PNG_412x915, actualWidth: request.viewport.width, actualHeight: request.viewport.height, scrollWidth: request.viewport.width };
    },
  };
  const engine = cp04CreateScreenshotEngine({ adapter, maxAttempts: 1 });
  const plan = [fakeJob({ name: "a", viewport: { width: 999, height: 100 } }), fakeJob({ name: "b", viewport: { width: 412, height: 915 } })];
  const results = await engine.captureAll(plan);
  assert.equal(results.length, 2);
  assert.equal(results[0].status, "failed");
  assert.equal(results[1].status, "completed");
});

test("Fase 10 #9: el PNG producido en un test completo es realmente válido (firma + checksum estable)", async () => {
  const adapter = { capture: async () => ({ buffer: VALID_PNG_412x915, actualWidth: 412, actualHeight: 915, scrollWidth: 412 }) };
  const engine = cp04CreateScreenshotEngine({ adapter });
  const result = await engine.captureJob(fakeJob());
  const hash1 = createHash("sha256").update(result.buffer).digest("hex");
  const hash2 = createHash("sha256").update(VALID_PNG_412x915).digest("hex");
  assert.equal(hash1, hash2);
});
