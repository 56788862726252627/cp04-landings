// OpenRouter Error Normalizer — ADV-16
// Maps OpenRouter HTTP errors to standard AI Router failure types.

import { FALLBACK_FAILURE } from '../routing/aiFallbackPolicy.js';

const STATUS_MAP = Object.freeze({
  401: FALLBACK_FAILURE.AUTH,
  403: FALLBACK_FAILURE.POLICY_BLOCK,
  408: FALLBACK_FAILURE.TIMEOUT,
  429: FALLBACK_FAILURE.RATE_LIMIT,
  500: FALLBACK_FAILURE.PROVIDER_DOWN,
  502: FALLBACK_FAILURE.PROVIDER_DOWN,
  503: FALLBACK_FAILURE.PROVIDER_DOWN,
  504: FALLBACK_FAILURE.TIMEOUT,
});

export function normalizeOpenRouterError(error = {}) {
  const httpStatus = error.status ?? error.statusCode ?? null;
  const message    = error.message ?? error.error?.message ?? 'Unknown error';

  let failureType = FALLBACK_FAILURE.UNKNOWN;

  if (httpStatus && STATUS_MAP[httpStatus]) {
    failureType = STATUS_MAP[httpStatus];
  } else if (message.toLowerCase().includes('model')) {
    failureType = FALLBACK_FAILURE.MODEL_UNAVAILABLE;
  } else if (message.toLowerCase().includes('rate')) {
    failureType = FALLBACK_FAILURE.RATE_LIMIT;
  } else if (message.toLowerCase().includes('auth') || message.toLowerCase().includes('key')) {
    failureType = FALLBACK_FAILURE.AUTH;
  }

  return Object.freeze({
    provider:    'openrouter',
    failureType,
    httpStatus,
    message,
    retryable:   failureType !== FALLBACK_FAILURE.AUTH && failureType !== FALLBACK_FAILURE.POLICY_BLOCK,
    isReal:      false,
  });
}

export const OPENROUTER_ERROR_NORMALIZER_VERSION = '1.0.0';
