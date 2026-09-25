# 03 — Motor de interpretación: determinista local + contrato de proveedor de IA

## Capa A — Modo determinista local (siempre activo, sin red)

Punto de entrada único: `interpretBusinessDescription(sourceText, {seed, answers})` en
`intentExtractor.js`. Pipeline interno (todo en memoria, sin I/O):

```
normalizeInput(texto)                      ← inputNormalizer.js
  → matchSectorPreset(texto normalizado)   ← sectorLexicon.js
  → resolveModules(texto, preset)          ← moduleDependencyEngine.js
  → recommendAutomations(módulos, preset)  ← automationCatalog.js
  → buildRolesAndPermissions(preset, módulos) ← roleEngine.js
  → detectAmbiguities(...) + applyAnswers  ← ambiguityEngine.js
  → computeConfidence(...)                 ← confidenceEngine.js
  → buildBrandingProposal/buildLandingProposal/buildPwaProposal ← brandingLandingProposal.js
  → ensamblado + validateBusinessIntent    ← businessIntentSchema.js
```

Es **100% determinista**: mismo `sourceText` + mismo `seed` produce, byte a byte, el
mismo Business Intent (mismo `requestId` incluido, derivado de
`sha256(seed + "\n" + textoNormalizado)`). No hay `Date.now()`, `Math.random()` ni
ninguna fuente de no-determinismo dentro del pipeline de interpretación (los
timestamps de escritura a disco, cuando los hay, viven fuera de este pipeline, en el
CLI — ver 06-cli.md).

Nunca lanza por una entrada "mala": entrada vacía, extremadamente larga (se trunca a
`MAX_INPUT_LENGTH = 8000` caracteres, marcado en `generationMetadata.truncatedInput`),
con caracteres especiales/HTML, o contradictoria — todo produce un Business Intent
válido, con la incertidumbre reflejada en `ambiguities`/`assumptions`/`confidence`.

## Capa B — Contrato para un proveedor de IA futuro (nunca conectado)

Código: `aiProviderContract.js`. Mismo patrón que `adapters/providerAdapters.js` de
Paso 09 (interfaz como array de métodos requeridos + mock local determinista).

- **Interfaz:** `AI_PROVIDER_INTERFACE_METHODS = ["interpretBusinessDescription"]`.
- **Mock:** `createMockAiLanguageProvider({mode, responsePayload, delayMs})`, con
  `mode` ∈ `success | throws | invalid_shape | invalid_json | never_resolves` — permite
  ejercitar cada rama de fallo desde los tests sin ninguna dependencia externa.
- **Sanitización:** `sanitizePromptForProvider` elimina caracteres de control y trunca a
  `MAX_PROMPT_LENGTH_FOR_PROVIDER = 4000` caracteres *antes* de que el texto llegue a
  cualquier proveedor (real o mock).
- **Timeout/retry declarativo:** `AI_PROVIDER_RETRY_POLICY = {maxRetries: 1, timeoutMs: 4000, backoffMs: 250}`.
- **Validación estricta de salida:** la respuesta del proveedor debe tener como mínimo
  la forma `{business: {sector: string}}`; cualquier otra cosa (incluida una respuesta
  que no sea objeto) se trata como fallo.
- **Fallback automático:** `interpretWithProviderOrFallback({promptText, provider,
  deterministicFallback, retryPolicy})` intenta el proveedor (con reintentos) y, ante
  CUALQUIER fallo — proveedor ausente, interfaz incompleta, timeout, excepción, JSON/forma
  inválidos — cae automáticamente a `deterministicFallback` (en la práctica, la Capa A).
  Nunca lanza; siempre devuelve `{intent, usedProvider, fallbackReason, attempts}` con
  traza completa de qué ocurrió.

**Este contrato no está conectado al pipeline por defecto**: el CLI (`business:interpret`,
`business:from-prompt`) llama directamente a `interpretBusinessDescription` (Capa A). El
contrato de Capa B queda preparado y probado (9 tests en `aiProviderContract.test.mjs`)
para que un paso futuro pueda pasar un `provider` real sin cambiar la firma del pipeline
ni el comportamiento cuando no hay proveedor configurado.

## Por qué nunca depende de una API real

Ningún archivo de `nl-builder/` importa `fetch`, un SDK de OpenAI, ni ninguna librería de
red. Los 8 casos de demostración (ver 08) y los 542 tests del repo se ejecutan sin
conexión a internet.
