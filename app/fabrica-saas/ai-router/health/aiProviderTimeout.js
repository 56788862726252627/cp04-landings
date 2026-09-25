// AI Provider Timeout Policy — ADV-16

const TASK_TIMEOUTS_MS = Object.freeze({
  SIMPLE_CHAT:           5000,
  CUSTOMER_SUPPORT:      8000,
  VOICE_PLANNING:        3000,   // latency sensitive
  CODING:               30000,
  REASONING:            45000,
  BUSINESS_ANALYSIS:    30000,
  CONTENT:              20000,
  MEDIA_SCRIPT:         45000,
  SOCIAL_COPY:          10000,
  STRUCTURED_EXTRACTION:15000,
  FACTUAL_HIGH_RISK:    30000,
  DEFAULT:              15000,
});

const PROVIDER_TIMEOUTS_MS = Object.freeze({
  local:       3000,
  direct:     10000,
  openrouter: 15000,
  custom:     20000,
});

export function createAIProviderTimeoutPolicy(config = {}) {
  const { taskOverrides = {}, providerOverrides = {} } = config;

  return Object.freeze({
    getTaskTimeout(taskType) {
      return taskOverrides[taskType] ?? TASK_TIMEOUTS_MS[taskType] ?? TASK_TIMEOUTS_MS.DEFAULT;
    },
    getProviderTimeout(providerType) {
      return providerOverrides[providerType] ?? PROVIDER_TIMEOUTS_MS[providerType] ?? PROVIDER_TIMEOUTS_MS.direct;
    },
    resolve(taskType, providerType) {
      const tTask     = this.getTaskTimeout(taskType);
      const tProvider = this.getProviderTimeout(providerType);
      return Object.freeze({ timeoutMs: Math.min(tTask, tProvider), taskType, providerType, isReal: false });
    },
    isReal: false,
  });
}

export const AI_PROVIDER_TIMEOUT_VERSION = '1.0.0';
