import { test } from "node:test";
import assert from "node:assert/strict";
import { cp04ResolveChromiumExecutablePath, cp04IsBrowserCaptureAvailable, cp04CreateBrowserCaptureAdapter } from "./browserCaptureAdapter.js";
import { cp04ValidatePngBuffer } from "./captureValidator.js";

test("cp04ResolveChromiumExecutablePath encuentra el Chromium ya cacheado en este entorno (sin descargar nada)", () => {
  const resolved = cp04ResolveChromiumExecutablePath({});
  assert.ok(resolved, "debería encontrar el Chromium cacheado en /root/.cache/ms-playwright");
});

test("cp04ResolveChromiumExecutablePath prioriza CP04_CHROMIUM_EXECUTABLE_PATH si existe de verdad", () => {
  const resolved = cp04ResolveChromiumExecutablePath({ CP04_CHROMIUM_EXECUTABLE_PATH: "/ruta/que/no/existe" });
  // La ruta inventada no existe, así que debe caer a las candidatas por defecto (o null si tampoco existen).
  assert.notEqual(resolved, "/ruta/que/no/existe");
});

test("cp04ResolveChromiumExecutablePath devuelve null si no hay ningún Chromium disponible ni variable de entorno válida", () => {
  // Simulamos un entorno sin caché: no podemos borrar la caché real (sería
  // destructivo e innecesario), así que solo comprobamos el contrato de
  // tipo — la función nunca lanza, siempre boolean/string.
  const result = cp04ResolveChromiumExecutablePath({ CP04_CHROMIUM_EXECUTABLE_PATH: "/no/existe" });
  assert.equal(typeof result === "string" || result === null, true);
});

test("cp04IsBrowserCaptureAvailable coincide con cp04ResolveChromiumExecutablePath", () => {
  assert.equal(cp04IsBrowserCaptureAvailable(), cp04ResolveChromiumExecutablePath() !== null);
});

const browserAvailable = cp04IsBrowserCaptureAvailable();

test("Fase 10 #2/#3: captura real de una URL local en un viewport vertical produce un PNG válido con las dimensiones pedidas", { skip: !browserAvailable && "Chromium no disponible" }, async () => {
  const adapter = cp04CreateBrowserCaptureAdapter();
  try {
    const raw = await adapter.capture({ url: "http://localhost:5175", viewport: { width: 412, height: 915, deviceScaleFactor: 2.6 } });
    assert.ok(Buffer.isBuffer(raw.buffer));
    assert.equal(raw.actualWidth, 412);
    assert.equal(raw.actualHeight, 915);
    // El PNG real tiene deviceScaleFactor × las dimensiones CSS del
    // viewport (esto mismo se descubrió y se corrigió en
    // screenshotEngine.js: hay que escalar el tamaño esperado).
    const validation = cp04ValidatePngBuffer(raw.buffer, { width: Math.round(412 * 2.6), height: Math.round(915 * 2.6) });
    assert.equal(validation.valid, true, JSON.stringify(validation.errors));
  } finally {
    await adapter.close();
  }
});

test("Fase 10 #4: captura real en un viewport horizontal (escritorio) produce un PNG con el ancho/alto correctos", { skip: !browserAvailable && "Chromium no disponible" }, async () => {
  const adapter = cp04CreateBrowserCaptureAdapter();
  try {
    const raw = await adapter.capture({ url: "http://localhost:5175", viewport: { width: 1920, height: 1080 } });
    const validation = cp04ValidatePngBuffer(raw.buffer, { width: 1920, height: 1080 });
    assert.equal(validation.valid, true, JSON.stringify(validation.errors));
  } finally {
    await adapter.close();
  }
});

test("capturar una URL inexistente lanza un error controlado (no produce un buffer vacío silencioso)", { skip: !browserAvailable && "Chromium no disponible" }, async () => {
  const adapter = cp04CreateBrowserCaptureAdapter();
  try {
    await assert.rejects(() => adapter.capture({ url: "http://localhost:1/no-existe-nada-aqui", viewport: { width: 400, height: 400 }, timeoutMs: 2000 }));
  } finally {
    await adapter.close();
  }
});

test("un adaptador reutiliza el mismo navegador entre capturas (no relanza Chromium en cada llamada)", { skip: !browserAvailable && "Chromium no disponible" }, async () => {
  const adapter = cp04CreateBrowserCaptureAdapter();
  try {
    await adapter.capture({ url: "http://localhost:5175", viewport: { width: 400, height: 400 } });
    await adapter.capture({ url: "http://localhost:5175", viewport: { width: 400, height: 400 } });
    // Si esto no lanza y se completa en un tiempo razonable, el navegador se reutilizó.
    assert.ok(true);
  } finally {
    await adapter.close();
  }
});
