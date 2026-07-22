// Paso 11 · Fase 5, Capa B — Contrato desacoplado para un futuro proveedor de IA.
//
// NUNCA conecta un proveedor real (OpenAI, otro compatible, o un modelo
// local): solo define la interfaz, un mock local determinista, política de
// timeout/retry declarativa, validación estricta de la forma de salida,
// sanitización/límite de tamaño del prompt, y fallback automático al motor
// determinista local (intentExtractor.js) ante CUALQUIER fallo. La
// aplicación debe seguir funcionando sin este contrato: por defecto, el CLI
// nunca lo invoca a menos que se pase explícitamente un proveedor.
//
// Sigue el mismo patrón de interfaz+mock que adapters/providerAdapters.js
// (Paso 09): la interfaz es un array de nombres de método requeridos.

export const AI_PROVIDER_INTERFACE_METHODS = Object.freeze(["interpretBusinessDescription"]);

export const MAX_PROMPT_LENGTH_FOR_PROVIDER = 4000;

export const AI_PROVIDER_RETRY_POLICY = Object.freeze({ maxRetries: 1, timeoutMs: 4000, backoffMs: 250 });

export function findMissingAiProviderMethods(provider) {
  return AI_PROVIDER_INTERFACE_METHODS.filter((method) => typeof provider?.[method] !== "function");
}

export function implementsAiProviderInterface(provider) {
  return findMissingAiProviderMethods(provider).length === 0;
}

/** Limita tamaño y elimina caracteres de control antes de enviar el prompt a cualquier proveedor externo. */
export function sanitizePromptForProvider(text) {
  const controlCharPattern = new RegExp("[" + String.fromCharCode(0) + "-" + String.fromCharCode(31) + String.fromCharCode(127) + "]", "g");
  const stripped = String(text ?? "").replace(controlCharPattern, " ");
  return stripped.slice(0, MAX_PROMPT_LENGTH_FOR_PROVIDER);
}

function isValidPartialIntentShape(candidate) {
  return (
    Boolean(candidate) &&
    typeof candidate === "object" &&
    !Array.isArray(candidate) &&
    Boolean(candidate.business) &&
    typeof candidate.business === "object" &&
    typeof candidate.business.sector === "string" &&
    candidate.business.sector.length > 0
  );
}

/**
 * Proveedor mock 100% local y determinista (sin red). `mode` permite
 * ejercitar cada rama de fallo del contrato desde los tests:
 * "success" | "throws" | "invalid_shape" | "invalid_json" | "never_resolves".
 */
export function createMockAiLanguageProvider({ mode = "success", responsePayload = null, delayMs = 0 } = {}) {
  return {
    async interpretBusinessDescription(promptText) {
      if (delayMs > 0) await new Promise((resolve) => setTimeout(resolve, delayMs));
      if (mode === "never_resolves") return new Promise(() => {});
      if (mode === "throws") throw new Error("mock AI provider error (mode=throws)");
      if (mode === "invalid_json") return "esto no es un objeto JSON";
      if (mode === "invalid_shape") return { unexpected: "shape" };
      return (
        responsePayload || {
          business: { proposedName: "Negocio sugerido (mock IA)", sector: "generic-local-service" },
          confidence: { overall: 0.5 },
          sourceText: promptText,
        }
      );
    },
  };
}

function withTimeout(promise, timeoutMs) {
  let timer;
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error(`el proveedor de IA no respondió en ${timeoutMs}ms (timeout)`)), timeoutMs);
  });
  return Promise.race([Promise.resolve(promise), timeout]).finally(() => clearTimeout(timer));
}

/**
 * Intenta interpretar con un proveedor de IA (mock o, en el futuro, real) y
 * hace fallback automático al motor determinista local ante CUALQUIER
 * fallo: proveedor ausente, interfaz incompleta, timeout, excepción, JSON
 * inválido o forma de salida inesperada. Nunca lanza: siempre devuelve un
 * intent utilizable + una traza de lo ocurrido.
 * @param {{promptText: string, provider?: object, deterministicFallback: (text: string) => object, retryPolicy?: object}} input
 */
export async function interpretWithProviderOrFallback({ promptText, provider, deterministicFallback, retryPolicy = AI_PROVIDER_RETRY_POLICY }) {
  const sanitized = sanitizePromptForProvider(promptText);
  const trace = { usedProvider: false, fallbackReason: null, attempts: [] };

  if (!provider) {
    trace.fallbackReason = "no_provider_configured";
    return { intent: deterministicFallback(sanitized), ...trace };
  }

  const missing = findMissingAiProviderMethods(provider);
  if (missing.length > 0) {
    trace.fallbackReason = `provider_incomplete_interface: falta ${missing.join(", ")}`;
    return { intent: deterministicFallback(sanitized), ...trace };
  }

  let lastErrorMessage = "desconocido";
  for (let attempt = 0; attempt <= retryPolicy.maxRetries; attempt++) {
    try {
      const raw = await withTimeout(provider.interpretBusinessDescription(sanitized), retryPolicy.timeoutMs);
      if (!isValidPartialIntentShape(raw)) {
        lastErrorMessage = "la salida del proveedor no tiene la forma mínima esperada ({business:{sector}})";
        trace.attempts.push({ attempt, ok: false, reason: "invalid_shape" });
        continue;
      }
      trace.usedProvider = true;
      trace.attempts.push({ attempt, ok: true });
      return { intent: raw, ...trace };
    } catch (err) {
      lastErrorMessage = err.message;
      trace.attempts.push({ attempt, ok: false, reason: err.message });
    }
  }

  trace.fallbackReason = `provider_failed_after_${trace.attempts.length}_attempt(s): ${lastErrorMessage}`;
  return { intent: deterministicFallback(sanitized), ...trace };
}
