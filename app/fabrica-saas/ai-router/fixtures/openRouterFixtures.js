// OpenRouter Fixtures — ADV-16
// Simulates OpenRouter API responses. No real requests.

export const FIXTURE_OR_SUCCESS = Object.freeze({
  id: 'or-success',
  scenario: 'Successful OpenRouter request (fixture)',
  httpStatus: 200,
  response: Object.freeze({
    model: 'fixture-or-generic-v1',
    choices: Object.freeze([
      Object.freeze({
        message: Object.freeze({ role: 'assistant', content: 'Fixture response content.' }),
        finish_reason: 'stop',
      }),
    ]),
    usage: Object.freeze({ prompt_tokens: 100, completion_tokens: 50, total_tokens: 150 }),
  }),
  isReal: false,
});

export const FIXTURE_OR_RATE_LIMIT = Object.freeze({
  id: 'or-rate-limit',
  scenario: 'OpenRouter rate limit (fixture)',
  httpStatus: 429,
  error: Object.freeze({ message: 'Rate limit exceeded', status: 429 }),
  expectedFailure: 'RATE_LIMIT',
  isReal: false,
});

export const FIXTURE_OR_TIMEOUT = Object.freeze({
  id: 'or-timeout',
  scenario: 'OpenRouter request timeout (fixture)',
  httpStatus: 504,
  error: Object.freeze({ message: 'Gateway timeout', status: 504 }),
  expectedFailure: 'TIMEOUT',
  isReal: false,
});

export const FIXTURE_OR_AUTH_MISSING = Object.freeze({
  id: 'or-auth-missing',
  scenario: 'OpenRouter auth missing (fixture)',
  httpStatus: 401,
  error: Object.freeze({ message: 'Unauthorized — API key missing or invalid', status: 401 }),
  expectedFailure: 'AUTH',
  isReal: false,
});

export const FIXTURE_OR_MODEL_UNAVAILABLE = Object.freeze({
  id: 'or-model-unavailable',
  scenario: 'OpenRouter model unavailable (fixture)',
  httpStatus: 404,
  error: Object.freeze({ message: 'Model not found or unavailable', status: 404 }),
  expectedFailure: 'MODEL_UNAVAILABLE',
  isReal: false,
});

export const FIXTURE_OR_INTERNAL_ERROR = Object.freeze({
  id: 'or-internal-error',
  scenario: 'OpenRouter internal server error (fixture)',
  httpStatus: 500,
  error: Object.freeze({ message: 'Internal server error', status: 500 }),
  expectedFailure: 'PROVIDER_DOWN',
  isReal: false,
});

export const FIXTURE_OR_FALLBACK_SUCCESS = Object.freeze({
  id: 'or-fallback-success',
  scenario: 'OpenRouter fails → direct provider fallback succeeds',
  primaryProvider: 'openrouter',
  fallbackProvider: 'direct-fast',
  primaryError: Object.freeze({ message: 'Rate limit', status: 429 }),
  fallbackSuccess: true,
  isReal: false,
});

export const ALL_OPENROUTER_FIXTURES = Object.freeze([
  FIXTURE_OR_SUCCESS,
  FIXTURE_OR_RATE_LIMIT,
  FIXTURE_OR_TIMEOUT,
  FIXTURE_OR_AUTH_MISSING,
  FIXTURE_OR_MODEL_UNAVAILABLE,
  FIXTURE_OR_INTERNAL_ERROR,
  FIXTURE_OR_FALLBACK_SUCCESS,
]);

export const OPENROUTER_FIXTURES_VERSION = '1.0.0';
