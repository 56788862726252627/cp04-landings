// Observability Bridge — ADV-06
// Connects browser QA events to the ADV-01 observability pipeline.

// GUARDRAIL: never log secrets
const NEVER_LOG_FIELDS = ['secret', 'password', 'token', 'key', 'credential', 'apiKey', 'privateKey', 'sessionId'];

export const BROWSER_QA_EVENT = Object.freeze({
  QA_STARTED:       'browser_qa.started',
  PHASE_STARTED:    'browser_qa.phase.started',
  PHASE_COMPLETED:  'browser_qa.phase.completed',
  TEST_PASSED:      'browser_qa.test.passed',
  TEST_FAILED:      'browser_qa.test.failed',
  SCORE_CALCULATED: 'browser_qa.score.calculated',
  REPORT_GENERATED: 'browser_qa.report.generated',
  RELEASE_DECISION: 'browser_qa.release.decision',
  FLAKY_DETECTED:   'browser_qa.flaky.detected',
  BASELINE_UPDATED: 'browser_qa.baseline.updated',
});

function sanitizePayload(payload = {}) {
  const safe = {};
  for (const [k, v] of Object.entries(payload)) {
    const lower = k.toLowerCase();
    if (NEVER_LOG_FIELDS.some(f => lower.includes(f))) {
      safe[k] = '[REDACTED]';
    } else if (v && typeof v === 'object' && !Array.isArray(v)) {
      safe[k] = sanitizePayload(v);
    } else {
      safe[k] = v;
    }
  }
  return safe;
}

export function emitBrowserQAEvent(type, payload = {}) {
  if (!BROWSER_QA_EVENT[Object.keys(BROWSER_QA_EVENT).find(k => BROWSER_QA_EVENT[k] === type)]) {
    return { valid: false, error: `unknown event type: ${type}` };
  }
  return Object.freeze({
    valid:      true,
    type,
    payload:    sanitizePayload(payload),
    correlationId: `BQA-${Date.now()}`,
    timestamp:  new Date().toISOString(),
    source:     'browser-qa',
    isReal:     false,
  });
}

export function createBrowserQALogger(runId = '') {
  if (!runId) return { valid: false, error: 'runId required' };
  const events = [];

  function emit(type, payload = {}) {
    const event = emitBrowserQAEvent(type, { runId, ...payload });
    if (event.valid) events.push(event);
    return event;
  }

  return Object.freeze({
    valid:  true,
    runId,
    emit,
    started:    (appId) => emit(BROWSER_QA_EVENT.QA_STARTED, { appId }),
    phaseStart: (phase) => emit(BROWSER_QA_EVENT.PHASE_STARTED, { phase }),
    phaseEnd:   (phase, status) => emit(BROWSER_QA_EVENT.PHASE_COMPLETED, { phase, status }),
    testPass:   (testId) => emit(BROWSER_QA_EVENT.TEST_PASSED, { testId }),
    testFail:   (testId, error) => emit(BROWSER_QA_EVENT.TEST_FAILED, { testId, error }),
    scoreCalc:  (score, grade) => emit(BROWSER_QA_EVENT.SCORE_CALCULATED, { score, grade }),
    report:     (reportId, status) => emit(BROWSER_QA_EVENT.REPORT_GENERATED, { reportId, status }),
    release:    (channel, verdict) => emit(BROWSER_QA_EVENT.RELEASE_DECISION, { channel, verdict }),
    getEvents:  () => [...events],
    eventCount: () => events.length,
    isReal:     false,
  });
}

export const OBSERVABILITY_BRIDGE_VERSION = '1.0.0';
