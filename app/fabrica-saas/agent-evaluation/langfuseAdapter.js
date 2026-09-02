// Langfuse Evaluation Adapter — ADV-10 (fixture/dry-run only, no real API calls)

import { LangfuseProviderFoundation } from './telemetryProvider.js';

export function createLangfuseEvaluationAdapter(config = {}) {
  return Object.freeze({
    projectId:  config.projectId ?? 'fixture-project',
    publicKey:  config.publicKey ?? 'pk-fixture',
    dryRun:     true,
    provider:   LangfuseProviderFoundation,

    sendTrace(trace) {
      return Object.freeze({
        sent: false,
        dryRun: true,
        traceId:  trace?.traceId ?? null,
        note:     'Langfuse adapter is in dry-run mode — no real export',
        isReal:   false,
      });
    },

    sendScore(score) {
      return Object.freeze({
        sent: false,
        dryRun: true,
        dimension: score?.dimension ?? null,
        note:      'Langfuse adapter is in dry-run mode — no real export',
        isReal:    false,
      });
    },

    isReal: false,
  });
}

export const LANGFUSE_ADAPTER_VERSION = '1.0.0';
