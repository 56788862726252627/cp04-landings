// OpenRouter Response Normalizer — ADV-16
// Normalizes OpenRouter raw response to standard AI Router contract.
// Does NOT leak provider-specific internals to the Agent Engine.

export function normalizeOpenRouterResponse(raw = {}) {
  const choice  = raw.choices?.[0] ?? {};
  const message = choice.message ?? {};

  return Object.freeze({
    provider:     'openrouter',
    model:        raw.model ?? 'unknown',
    content:      message.content ?? '',
    role:         message.role    ?? 'assistant',
    finishReason: choice.finish_reason ?? 'unknown',
    usage:        Object.freeze({
      inputTokens:  raw.usage?.prompt_tokens     ?? null,
      outputTokens: raw.usage?.completion_tokens ?? null,
      totalTokens:  raw.usage?.total_tokens      ?? null,
    }),
    isReal: false,
  });
}

export function isValidOpenRouterResponse(raw) {
  return raw &&
         typeof raw === 'object' &&
         Array.isArray(raw.choices) &&
         raw.choices.length > 0 &&
         raw.choices[0].message?.content !== undefined;
}

export const OPENROUTER_RESPONSE_NORMALIZER_VERSION = '1.0.0';
