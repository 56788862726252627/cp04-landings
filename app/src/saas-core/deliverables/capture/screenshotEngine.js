// App 3 · Prompt 3/6 — ScreenshotEngine (Fase 1 + Fase 4).
//
// Ejecuta un CapturePlan a través de un BrowserCaptureAdapter, con
// reintentos y validación real (Fase 11: CaptureValidator). Un fallo
// en un job:
//  - se registra con su error;
//  - se reintenta hasta `maxAttempts`;
//  - nunca bloquea los demás jobs (se sigue con el siguiente);
//  - nunca produce un CaptureResult "completed" sin un PNG real y
//    validado — agotados los reintentos, el resultado queda "failed",
//    sin ningún archivo de imagen falso ni vacío.

import { cp04ValidatePngBuffer, cp04ValidateNoUnexpectedOverflow } from "./captureValidator.js";

const DEFAULT_MAX_ATTEMPTS = 2;
const DEFAULT_MIN_BYTES = 200; // un PNG real de cualquier tamaño de viewport supera esto ampliamente; solo descarta buffers vacíos/corruptos

/**
 * @param {{adapter: object, maxAttempts?: number}} options - `adapter` implementa `.capture(request)` (ver browserCaptureAdapter.js).
 */
export function cp04CreateScreenshotEngine(options) {
  const adapter = options.adapter;
  const maxAttempts = Number.isInteger(options.maxAttempts) ? options.maxAttempts : DEFAULT_MAX_ATTEMPTS;
  const log = options.log || (() => {});

  /** @param {{url:string, viewport:object, name:string}} job */
  async function captureJob(job) {
    let lastError = null;
    for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
      try {
        log(`[capture] ${job.name}: intento ${attempt}/${maxAttempts}`);
        const raw = await adapter.capture({ url: job.url, viewport: job.viewport, selector: job.selector, fullPage: job.fullPage });

        // El PNG resultante tiene deviceScaleFactor × las dimensiones CSS
        // del viewport (p. ej. 412×915 a escala 2.6 produce un PNG de
        // ~1071×2379 px reales) — el tamaño esperado debe escalarse igual,
        // si no cualquier viewport con deviceScaleFactor > 1 fallaría la
        // validación aunque la captura fuera perfectamente correcta.
        const scale = job.viewport.deviceScaleFactor || 1;
        const pngValidation = cp04ValidatePngBuffer(raw.buffer, {
          width: Math.round(job.viewport.width * scale),
          height: Math.round(job.viewport.height * scale),
          minBytes: DEFAULT_MIN_BYTES,
        });
        const overflowValidation = cp04ValidateNoUnexpectedOverflow(raw.scrollWidth, job.viewport.width);
        const errors = [...pngValidation.errors, ...overflowValidation.errors];

        if (errors.length > 0) {
          lastError = errors.join("; ");
          log(`[capture] ${job.name}: validación falló (${lastError})`);
          continue; // reintentar — nunca se acepta una imagen que no pasa validación
        }

        return {
          status: "completed",
          job,
          buffer: raw.buffer,
          width: pngValidation.width,
          height: pngValidation.height,
          scrollWidth: raw.scrollWidth,
          attempts: attempt,
          errors: [],
        };
      } catch (error) {
        lastError = error.message;
        log(`[capture] ${job.name}: error en el intento ${attempt} (${lastError})`);
      }
    }
    return { status: "failed", job, buffer: null, attempts: maxAttempts, errors: [lastError || "fallo desconocido"] };
  }

  /** @param {object[]} plan */
  async function captureAll(plan) {
    const results = [];
    for (const job of plan) {
      // Secuencial a propósito: un fallo en un job no debe bloquear los
      // demás (ya garantizado por el try/catch de captureJob), pero
      // tampoco queremos varias pestañas de Chromium compitiendo por
      // CPU/memoria en este entorno sin límite.
      results.push(await captureJob(job));
    }
    return results;
  }

  return { captureJob, captureAll };
}
