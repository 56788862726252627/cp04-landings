// Evaluation Telemetry Provider — ADV-10 (Langfuse abstracted, dry-run only)

export const TELEMETRY_PROVIDER_TYPE = Object.freeze({
  LOCAL:    'LOCAL',
  LANGFUSE: 'LANGFUSE',
  NOOP:     'NOOP',
});

export function createEvaluationTelemetryProvider(type = TELEMETRY_PROVIDER_TYPE.LOCAL) {
  return Object.freeze({
    type,
    emit(event) {
      if (type === TELEMETRY_PROVIDER_TYPE.LOCAL) {
        return Object.freeze({ queued: true, event, isReal: false });
      }
      return Object.freeze({ queued: false, dropped: true, reason: 'NOOP_PROVIDER', isReal: false });
    },
    isReal: false,
  });
}

export const LocalEvaluationProvider  = createEvaluationTelemetryProvider(TELEMETRY_PROVIDER_TYPE.LOCAL);
export const NoopEvaluationProvider   = createEvaluationTelemetryProvider(TELEMETRY_PROVIDER_TYPE.NOOP);

// Langfuse foundation — dry-run / fixture only. No real API calls.
export const LangfuseProviderFoundation = Object.freeze({
  type:    TELEMETRY_PROVIDER_TYPE.LANGFUSE,
  dryRun:  true,
  emit() {
    return Object.freeze({ queued: false, dryRun: true, note: 'Langfuse not connected — dry-run mode', isReal: false });
  },
  isReal: false,
});

export const TELEMETRY_PROVIDER_VERSION = '1.0.0';
