// Tests — ADV-01 Transversal Observability
// node --test generator/tests/v2-adv01-observability.test.mjs

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

// ── eventModel ──────────────────────────────────────────────────────────────
import {
  SEVERITY, EVENT_TYPE, ENV, SERVICE, EVENT_STATUS,
  createObservabilityEvent, OBSERVABILITY_EVENT_VERSION,
} from '../../observability/eventModel.js';

describe('eventModel — SEVERITY', () => {
  it('has 5 severity levels', () => {
    assert.equal(Object.keys(SEVERITY).length, 5);
  });
  it('CRITICAL is defined', () => assert.equal(SEVERITY.CRITICAL, 'CRITICAL'));
  it('is frozen', () => assert.throws(() => { SEVERITY.X = 'X'; }));
});

describe('eventModel — EVENT_TYPE', () => {
  it('has at least 12 types', () => assert.ok(Object.keys(EVENT_TYPE).length >= 12));
  it('SECURITY is defined', () => assert.equal(EVENT_TYPE.SECURITY, 'SECURITY'));
  it('AUTOMATION is defined', () => assert.equal(EVENT_TYPE.AUTOMATION, 'AUTOMATION'));
});

describe('eventModel — createObservabilityEvent', () => {
  it('returns valid event with required params', () => {
    const r = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'test' });
    assert.equal(r.valid, true);
    assert.ok(r.event.eventId);
    assert.ok(r.event.correlationId);
    assert.ok(r.event.traceId);
    assert.ok(r.event.operationId);
  });
  it('event is frozen', () => {
    const r = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'test' });
    assert.throws(() => { r.event.message = 'hacked'; });
  });
  it('fails without eventType', () => {
    const r = createObservabilityEvent({ severity: SEVERITY.INFO, message: 'test' });
    assert.equal(r.valid, false);
    assert.ok(r.errors.length > 0);
  });
  it('fails without severity', () => {
    const r = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, message: 'test' });
    assert.equal(r.valid, false);
  });
  it('fails without message', () => {
    const r = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO });
    assert.equal(r.valid, false);
  });
  it('accepts clientId and projectId', () => {
    const r = createObservabilityEvent({ eventType: EVENT_TYPE.REQUEST, severity: SEVERITY.INFO, message: 'hi', clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.clientId, 'C1');
    assert.equal(r.event.projectId, 'P1');
  });
  it('accepts durationMs', () => {
    const r = createObservabilityEvent({ eventType: EVENT_TYPE.RESPONSE, severity: SEVERITY.INFO, message: 'ok', durationMs: 123 });
    assert.equal(r.event.durationMs, 123);
  });
  it('humanActionRequired defaults to false', () => {
    const r = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'x' });
    assert.equal(r.event.humanActionRequired, false);
  });
  it('version is defined', () => assert.ok(OBSERVABILITY_EVENT_VERSION));
});

// ── severityModel ────────────────────────────────────────────────────────────
import {
  SEVERITY_WEIGHTS, evaluateSeverity, compareSeverity, SEVERITY_MODEL_VERSION,
} from '../../observability/severityModel.js';

describe('severityModel — SEVERITY_WEIGHTS', () => {
  it('CRITICAL > ERROR > WARNING', () => {
    assert.ok(SEVERITY_WEIGHTS.CRITICAL > SEVERITY_WEIGHTS.ERROR);
    assert.ok(SEVERITY_WEIGHTS.ERROR > SEVERITY_WEIGHTS.WARNING);
  });
});

describe('severityModel — evaluateSeverity', () => {
  it('no elevation for clean INFO', () => {
    const r = evaluateSeverity(SEVERITY.INFO, {});
    assert.equal(r.valid, true);
    assert.equal(r.elevated, false);
    assert.equal(r.effectiveSeverity, SEVERITY.INFO);
  });
  it('CRITICAL for data loss', () => {
    const r = evaluateSeverity(SEVERITY.WARNING, { dataImpact: 'DATA_LOSS' });
    assert.equal(r.effectiveSeverity, SEVERITY.CRITICAL);
    assert.equal(r.elevated, true);
  });
  it('CRITICAL for repeated failures', () => {
    const r = evaluateSeverity(SEVERITY.ERROR, { retryCount: 3 });
    assert.equal(r.effectiveSeverity, SEVERITY.CRITICAL);
  });
  it('CRITICAL for external outage', () => {
    const r = evaluateSeverity(SEVERITY.INFO, { externalOutage: true });
    assert.equal(r.effectiveSeverity, SEVERITY.CRITICAL);
  });
  it('fails with unknown severity', () => {
    const r = evaluateSeverity('BOGUS');
    assert.equal(r.valid, false);
  });
  it('version defined', () => assert.ok(SEVERITY_MODEL_VERSION));
});

describe('severityModel — compareSeverity', () => {
  it('CRITICAL > INFO', () => assert.ok(compareSeverity(SEVERITY.CRITICAL, SEVERITY.INFO) > 0));
  it('DEBUG < ERROR',   () => assert.ok(compareSeverity(SEVERITY.DEBUG, SEVERITY.ERROR)    < 0));
  it('INFO == INFO',    () => assert.equal(compareSeverity(SEVERITY.INFO, SEVERITY.INFO),  0));
});

// ── redactionEngine ──────────────────────────────────────────────────────────
import {
  REDACTED, redactSensitiveData, containsSecret, auditMetadataForSecrets,
  REDACTION_ENGINE_VERSION,
} from '../../observability/redactionEngine.js';

describe('redactionEngine — redactSensitiveData', () => {
  it('redacts Authorization key', () => {
    const r = redactSensitiveData({ Authorization: 'Bearer abc123' });
    assert.equal(r.Authorization, REDACTED);
  });
  it('redacts token key', () => {
    const r = redactSensitiveData({ token: 'super-secret' });
    assert.equal(r.token, REDACTED);
  });
  it('redacts password key', () => {
    const r = redactSensitiveData({ password: 'hunter2' });
    assert.equal(r.password, REDACTED);
  });
  it('redacts Stripe secret in value', () => {
    const r = redactSensitiveData({ key: 'sk_test_abc123xyz456verylongtoken' });
    assert.equal(r.key, REDACTED);
  });
  it('preserves normal keys', () => {
    const r = redactSensitiveData({ name: 'Nexo', count: 5 });
    assert.equal(r.name, 'Nexo');
    assert.equal(r.count, 5);
  });
  it('handles nested objects', () => {
    const r = redactSensitiveData({ user: { token: 'abc', name: 'Carlos' } });
    assert.equal(r.user.token, REDACTED);
    assert.equal(r.user.name, 'Carlos');
  });
  it('handles arrays', () => {
    const r = redactSensitiveData([{ password: 'x' }, { name: 'ok' }]);
    assert.equal(r[0].password, REDACTED);
    assert.equal(r[1].name, 'ok');
  });
  it('handles null safely', () => assert.equal(redactSensitiveData(null), null));
  it('handles undefined safely', () => assert.equal(redactSensitiveData(undefined), undefined));
  it('redacts PII when opted in', () => {
    const r = redactSensitiveData({ email: 'user@test.com' }, { redactPII: true });
    assert.equal(r.email, REDACTED);
  });
  it('keeps email by default (not redactPII)', () => {
    const r = redactSensitiveData({ email: 'user@test.com' });
    assert.equal(r.email, 'user@test.com');
  });
});

describe('redactionEngine — containsSecret', () => {
  it('detects JWT pattern', () => {
    const jwt = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
    assert.equal(containsSecret(jwt), true);
  });
  it('detects secret key', () => assert.equal(containsSecret({ apikey: 'anything' }), true));
  it('returns false for clean data', () => assert.equal(containsSecret({ name: 'Nexo' }), false));
});

describe('redactionEngine — auditMetadataForSecrets', () => {
  it('finds secret keys', () => {
    const r = auditMetadataForSecrets({ Authorization: 'Bearer x', name: 'Nexo' });
    assert.equal(r.hasSecrets, true);
    assert.ok(r.secretKeys.includes('Authorization'));
  });
  it('finds PII keys', () => {
    const r = auditMetadataForSecrets({ email: 'test@test.com' });
    assert.equal(r.hasPII, true);
  });
  it('clean object has no issues', () => {
    const r = auditMetadataForSecrets({ clientId: 'C1', status: 'ok' });
    assert.equal(r.hasSecrets, false);
    assert.equal(r.totalIssues, 0);
  });
  it('version defined', () => assert.ok(REDACTION_ENGINE_VERSION));
});

// ── structuredLogger ─────────────────────────────────────────────────────────
import { createLogger, LOG_ADAPTER_TYPE, STRUCTURED_LOGGER_VERSION } from '../../observability/structuredLogger.js';

describe('structuredLogger — createLogger', () => {
  it('creates logger in MEMORY mode', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.MEMORY, clientId: 'C1' });
    assert.ok(logger.info);
    assert.ok(logger.error);
  });
  it('info() returns event', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.MEMORY });
    const e = logger.info('test message');
    assert.ok(e);
    assert.equal(e.severity, SEVERITY.INFO);
    assert.equal(e.message, 'test message');
  });
  it('warn() emits WARNING severity', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.MEMORY });
    const e = logger.warn('warning');
    assert.equal(e.severity, SEVERITY.WARNING);
  });
  it('error() emits ERROR severity', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.MEMORY });
    const e = logger.error('err');
    assert.equal(e.severity, SEVERITY.ERROR);
  });
  it('critical() emits CRITICAL and sets humanActionRequired', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.MEMORY });
    const e = logger.critical('critical!');
    assert.equal(e.severity, SEVERITY.CRITICAL);
    assert.equal(e.humanActionRequired, true);
  });
  it('debug() suppressed when minSeverity=INFO', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.MEMORY, minSeverity: SEVERITY.INFO });
    const e = logger.debug('debug msg');
    assert.equal(e, null);
  });
  it('getEvents() returns stored events', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.MEMORY, minSeverity: SEVERITY.DEBUG });
    logger.info('a');
    logger.warn('b');
    assert.ok(logger.getEvents().length >= 2);
  });
  it('getEvents(filter) filters by severity', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.MEMORY, minSeverity: SEVERITY.DEBUG });
    logger.info('i');
    logger.warn('w');
    const warns = logger.getEvents({ severity: SEVERITY.WARNING });
    assert.ok(warns.every(e => e.severity === SEVERITY.WARNING));
  });
  it('withContext() creates child logger', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.MEMORY, clientId: 'C1' });
    const child = logger.withContext({ correlationId: 'cid-test', clientId: 'C2' });
    const e = child.info('child log');
    assert.equal(e.correlationId, 'cid-test');
  });
  it('getStatus() returns status object', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.MEMORY });
    const s = logger.getStatus();
    assert.equal(s.system, 'structured_logger');
  });
  it('SILENT adapter does not store events', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.SILENT });
    logger.info('silent');
    assert.equal(logger.getEvents().length, 0);
  });
  it('redacts secret in metadata', () => {
    const logger = createLogger({ adapterType: LOG_ADAPTER_TYPE.MEMORY });
    const e = logger.info('request', { metadata: { Authorization: 'Bearer abc' } });
    assert.equal(e.metadata.Authorization, REDACTED);
  });
  it('version defined', () => assert.ok(STRUCTURED_LOGGER_VERSION));
});

// ── correlationContext ───────────────────────────────────────────────────────
import { createCorrelationContext, OPERATION_STATUS, CORRELATION_CONTEXT_VERSION } from '../../observability/correlationContext.js';

describe('correlationContext — createCorrelationContext', () => {
  it('creates context with required fields', () => {
    const r = createCorrelationContext({ operation: 'test-op', clientId: 'C1' });
    assert.equal(r.valid, true);
    assert.ok(r.context.correlationId);
    assert.ok(r.context.traceId);
    assert.ok(r.context.operationId);
    assert.equal(r.context.operation, 'test-op');
    assert.equal(r.context.status, OPERATION_STATUS.STARTED);
  });
  it('fails without operation', () => {
    const r = createCorrelationContext({});
    assert.equal(r.valid, false);
  });
  it('complete() sets completedAt and durationMs', () => {
    const r = createCorrelationContext({ operation: 'op' });
    const completed = r.context.complete();
    assert.ok(completed.completedAt);
    assert.ok(completed.durationMs >= 0);
    assert.equal(completed.status, OPERATION_STATUS.COMPLETED);
  });
  it('fail() sets FAILED status', () => {
    const r = createCorrelationContext({ operation: 'op' });
    const failed = r.context.fail(new Error('oops'));
    assert.equal(failed.status, OPERATION_STATUS.FAILED);
  });
  it('startSpan() creates span', () => {
    const r = createCorrelationContext({ operation: 'op' });
    const span = r.context.startSpan('api', 'worker');
    assert.ok(span.spanId);
    assert.equal(span.component, 'api');
    const ended = span.end();
    assert.ok(ended.durationMs >= 0);
    assert.equal(ended.status, OPERATION_STATUS.COMPLETED);
  });
  it('child() creates child context with same correlationId', () => {
    const r = createCorrelationContext({ operation: 'parent' });
    const child = r.context.child('child-op');
    assert.equal(child.correlationId, r.context.correlationId);
    assert.equal(child.traceId, r.context.traceId);
    assert.equal(child.parentOperationId, r.context.operationId);
  });
  it('toMeta() returns safe serializable object', () => {
    const r = createCorrelationContext({ operation: 'op', clientId: 'C1' });
    const meta = r.context.toMeta();
    assert.ok(meta.correlationId);
    assert.ok(meta.operation);
    assert.equal(meta.clientId, 'C1');
  });
  it('accepts overridden correlationId', () => {
    const r = createCorrelationContext({ operation: 'op', correlationId: 'my-cid' });
    assert.equal(r.context.correlationId, 'my-cid');
  });
  it('version defined', () => assert.ok(CORRELATION_CONTEXT_VERSION));
});

// ── errorNormalizer ──────────────────────────────────────────────────────────
import { normalizeError, ERROR_CATEGORY, toUserMessage, RECOVERABLE_CATEGORIES, ERROR_NORMALIZER_VERSION } from '../../observability/errorNormalizer.js';

describe('errorNormalizer — normalizeError', () => {
  it('classifies 429 as RATE_LIMIT', () => {
    const r = normalizeError(new Error('429 Too Many Requests'));
    assert.equal(r.errorCategory, ERROR_CATEGORY.RATE_LIMIT);
  });
  it('classifies ETIMEDOUT as TIMEOUT', () => {
    const err = new Error('ETIMEDOUT');
    err.code = 'ETIMEDOUT';
    const r = normalizeError(err);
    assert.equal(r.errorCategory, ERROR_CATEGORY.TIMEOUT);
  });
  it('classifies supabase error as DATABASE', () => {
    const r = normalizeError(new Error('Supabase: table not found'));
    assert.equal(r.errorCategory, ERROR_CATEGORY.DATABASE);
  });
  it('classifies 403 as AUTHORIZATION', () => {
    const r = normalizeError(new Error('403 forbidden'));
    assert.equal(r.errorCategory, ERROR_CATEGORY.AUTHORIZATION);
  });
  it('classifies 401 as AUTHENTICATION', () => {
    const r = normalizeError(new Error('401 unauthenticated'));
    assert.equal(r.errorCategory, ERROR_CATEGORY.AUTHENTICATION);
  });
  it('classifies make.com error as AUTOMATION', () => {
    const r = normalizeError(new Error('make.com scenario failed'));
    assert.equal(r.errorCategory, ERROR_CATEGORY.AUTOMATION);
  });
  it('TIMEOUT is recoverable', () => {
    const r = normalizeError(new Error('timeout'));
    assert.equal(r.recoverable, true);
  });
  it('DATABASE is not recoverable by default', () => {
    const r = normalizeError(new Error('Supabase query failed'));
    assert.equal(r.recoverable, false);
  });
  it('RECOVERABLE_CATEGORIES includes RATE_LIMIT', () => {
    assert.ok(RECOVERABLE_CATEGORIES.has(ERROR_CATEGORY.RATE_LIMIT));
  });
  it('handles string error', () => {
    const r = normalizeError('plain string error');
    assert.equal(r.valid, true);
    assert.ok(r.message);
  });
  it('version defined', () => assert.ok(ERROR_NORMALIZER_VERSION));
});

describe('errorNormalizer — toUserMessage', () => {
  it('returns user-safe message for RATE_LIMIT', () => {
    const msg = toUserMessage({ errorCategory: ERROR_CATEGORY.RATE_LIMIT });
    assert.ok(typeof msg === 'string');
    assert.ok(msg.length > 10);
  });
  it('returns fallback for unknown', () => {
    const msg = toUserMessage({ errorCategory: 'BOGUS' });
    assert.ok(typeof msg === 'string');
  });
  it('returns fallback for null', () => {
    const msg = toUserMessage(null);
    assert.ok(typeof msg === 'string');
  });
});

// ── observabilityStore ───────────────────────────────────────────────────────
import { createObservabilityStore, STORE_ADAPTER_TYPE, OBSERVABILITY_STORE_VERSION } from '../../observability/observabilityStore.js';

describe('observabilityStore — createObservabilityStore', () => {
  it('creates in-memory store', () => {
    const store = createObservabilityStore();
    assert.equal(store.adapterType, STORE_ADAPTER_TYPE.MEMORY);
  });

  it('writeEvent() stores event', async () => {
    const store = createObservabilityStore();
    const r = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'stored', clientId: 'C1' });
    const result = await store.writeEvent(r.event);
    assert.equal(result.ok, true);
    assert.equal(store.size(), 1);
  });

  it('writeEvents() stores multiple', async () => {
    const store = createObservabilityStore();
    const evts = [
      createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'a', clientId: 'C1' }).event,
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.ERROR, message: 'b', clientId: 'C1' }).event,
    ];
    const r = await store.writeEvents(evts);
    assert.equal(r.ok, true);
    assert.equal(r.count, 2);
  });

  it('queryEvents() filters by clientId', async () => {
    const store = createObservabilityStore();
    await store.writeEvent(createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'c1', clientId: 'C1' }).event);
    await store.writeEvent(createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'c2', clientId: 'C2' }).event);
    const r = await store.queryEvents({ clientId: 'C1', callerClientId: 'C1' });
    assert.ok(r.every(e => e.clientId === 'C1'));
  });

  it('queryCritical() returns only CRITICAL', async () => {
    const store = createObservabilityStore();
    await store.writeEvent(createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.CRITICAL, message: 'crit', clientId: 'C1' }).event);
    await store.writeEvent(createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'info', clientId: 'C1' }).event);
    const r = await store.queryCritical({ clientId: 'C1', callerClientId: 'C1' });
    assert.ok(r.every(e => e.severity === SEVERITY.CRITICAL));
  });

  it('queryByCorrelationId() returns ordered events', async () => {
    const store = createObservabilityStore();
    const cid = 'my-cid';
    await store.writeEvent(createObservabilityEvent({ eventType: EVENT_TYPE.REQUEST, severity: SEVERITY.INFO, message: 'first', correlationId: cid, clientId: 'C1' }).event);
    await store.writeEvent(createObservabilityEvent({ eventType: EVENT_TYPE.RESPONSE, severity: SEVERITY.INFO, message: 'second', correlationId: cid, clientId: 'C1' }).event);
    const r = await store.queryByCorrelationId(cid, { callerClientId: 'C1' });
    assert.equal(r.length, 2);
  });

  it('CLIENT_ISOLATION_VIOLATION thrown for cross-client query', async () => {
    const store = createObservabilityStore();
    await assert.rejects(
      () => store.queryEvents({ clientId: 'CLIENT-B', callerClientId: 'CLIENT-A' }),
      /CLIENT_ISOLATION_VIOLATION/
    );
  });

  it('version defined', () => assert.ok(OBSERVABILITY_STORE_VERSION));
});

// ── metricsEngine ────────────────────────────────────────────────────────────
import { calculateObservabilityMetrics, compareMetrics, METRICS_ENGINE_VERSION } from '../../observability/metricsEngine.js';

describe('metricsEngine — calculateObservabilityMetrics', () => {
  it('returns empty metrics for empty array', () => {
    const r = calculateObservabilityMetrics([]);
    assert.equal(r.valid, true);
    assert.equal(r.totalEvents, 0);
    assert.equal(r.errorRate, null);
  });
  it('counts successes and failures', () => {
    const events = [
      createObservabilityEvent({ eventType: EVENT_TYPE.REQUEST, severity: SEVERITY.INFO, message: 'ok', status: EVENT_STATUS.SUCCESS }).event,
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.ERROR, message: 'fail', status: EVENT_STATUS.FAILURE }).event,
    ];
    const r = calculateObservabilityMetrics(events);
    assert.equal(r.successCount, 1);
    assert.equal(r.failureCount, 1);
  });
  it('calculates errorRate', () => {
    const events = Array.from({ length: 10 }, (_, i) =>
      createObservabilityEvent({ eventType: EVENT_TYPE.REQUEST, severity: i < 2 ? SEVERITY.ERROR : SEVERITY.INFO, message: 'x', status: i < 2 ? EVENT_STATUS.FAILURE : EVENT_STATUS.SUCCESS }).event
    );
    const r = calculateObservabilityMetrics(events);
    assert.ok(r.errorRate !== null);
  });
  it('calculates average duration', () => {
    const events = [
      createObservabilityEvent({ eventType: EVENT_TYPE.RESPONSE, severity: SEVERITY.INFO, message: 'a', durationMs: 100 }).event,
      createObservabilityEvent({ eventType: EVENT_TYPE.RESPONSE, severity: SEVERITY.INFO, message: 'b', durationMs: 200 }).event,
    ];
    const r = calculateObservabilityMetrics(events);
    assert.equal(r.averageDuration, 150);
  });
  it('calculates p95 duration', () => {
    const events = Array.from({ length: 20 }, (_, i) =>
      createObservabilityEvent({ eventType: EVENT_TYPE.RESPONSE, severity: SEVERITY.INFO, message: 'x', durationMs: (i + 1) * 10 }).event
    );
    const r = calculateObservabilityMetrics(events);
    assert.ok(r.p95Duration !== null);
  });
  it('fails for non-array input', () => {
    const r = calculateObservabilityMetrics('not array');
    assert.equal(r.valid, false);
  });
  it('version defined', () => assert.ok(METRICS_ENGINE_VERSION));
});

describe('metricsEngine — compareMetrics', () => {
  it('detects regression in errorRate', () => {
    const r = compareMetrics({ errorRate: 0.05, criticalCount: 0 }, { errorRate: 0.30, criticalCount: 0 });
    assert.ok(r.regressions.includes('error_rate_increased'));
  });
  it('detects regression in p95', () => {
    const r = compareMetrics({ p95Duration: 200, errorRate: 0, criticalCount: 0 }, { p95Duration: 800, errorRate: 0, criticalCount: 0 });
    assert.ok(r.regressions.includes('p95_latency_increased'));
  });
  it('no regression when metrics improve', () => {
    const r = compareMetrics({ errorRate: 0.20, p95Duration: 800, criticalCount: 2 }, { errorRate: 0.05, p95Duration: 200, criticalCount: 0 });
    assert.equal(r.regressions.length, 0);
  });
  it('fails when before/after missing', () => {
    const r = compareMetrics(null, null);
    assert.equal(r.valid, false);
  });
});

// ── healthAggregator ─────────────────────────────────────────────────────────
import { calculateSystemHealth, buildFactorsFromExistingModules, SYSTEM_HEALTH_STATUS, HEALTH_FACTORS, HEALTH_AGGREGATOR_VERSION } from '../../observability/healthAggregator.js';

describe('healthAggregator — calculateSystemHealth', () => {
  it('returns HEALTHY with all healthy factors', () => {
    const factors = Object.fromEntries(
      Object.values(HEALTH_FACTORS).map(f => [f, { status: 'HEALTHY' }])
    );
    const r = calculateSystemHealth(factors);
    assert.equal(r.valid, true);
    assert.equal(r.overallStatus, SYSTEM_HEALTH_STATUS.HEALTHY);
    assert.ok(r.healthPercent >= 90);
  });
  it('returns CRITICAL with all critical factors', () => {
    const factors = Object.fromEntries(
      Object.values(HEALTH_FACTORS).map(f => [f, { status: 'CRITICAL' }])
    );
    const r = calculateSystemHealth(factors);
    assert.equal(r.overallStatus, SYSTEM_HEALTH_STATUS.CRITICAL);
  });
  it('counts critical issues', () => {
    const r = calculateSystemHealth({
      [HEALTH_FACTORS.DATABASE]: { status: 'CRITICAL' },
      [HEALTH_FACTORS.API]:      { status: 'HEALTHY' },
    });
    assert.ok(r.criticalIssues >= 1);
  });
  it('requiresIntervention for CRITICAL', () => {
    const factors = Object.fromEntries(
      Object.values(HEALTH_FACTORS).map(f => [f, { status: 'CRITICAL' }])
    );
    const r = calculateSystemHealth(factors);
    assert.equal(r.requiresIntervention, true);
  });
  it('version defined', () => assert.ok(HEALTH_AGGREGATOR_VERSION));
});

describe('healthAggregator — buildFactorsFromExistingModules', () => {
  it('maps aiHealth to AI factor', () => {
    const factors = buildFactorsFromExistingModules({
      aiHealthResult: { status: 'HEALTHY', healthScore: 100, total: 2 },
    });
    assert.equal(factors[HEALTH_FACTORS.AI].status, 'HEALTHY');
  });
  it('maps CRITICAL aiHealth', () => {
    const factors = buildFactorsFromExistingModules({
      aiHealthResult: { status: 'CRITICAL', healthScore: 20, total: 1 },
    });
    assert.equal(factors[HEALTH_FACTORS.AI].status, 'CRITICAL');
  });
  it('maps automationHealth to AUTOMATION factor', () => {
    const factors = buildFactorsFromExistingModules({
      autoHealthResult: { status: 'WARNING', healthScore: 60, active: 3 },
    });
    assert.equal(factors[HEALTH_FACTORS.AUTOMATION].status, 'DEGRADED');
  });
});

// ── alertEngine ──────────────────────────────────────────────────────────────
import { evaluateAlerts, createAlertChannelAdapter, ALERT_LEVEL, ALERT_RULE_ID, ALERT_CHANNEL, ALERT_ENGINE_VERSION } from '../../observability/alertEngine.js';

describe('alertEngine — evaluateAlerts', () => {
  it('returns NO_ALERT for empty events', () => {
    const r = evaluateAlerts([]);
    assert.equal(r.valid, true);
    assert.equal(r.overallLevel, ALERT_LEVEL.NO_ALERT);
    assert.equal(r.hasAlerts, false);
  });
  it('CRITICAL_ALERT for CRITICAL event', () => {
    const events = [createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.CRITICAL, message: 'critical' }).event];
    const r = evaluateAlerts(events);
    assert.equal(r.overallLevel, ALERT_LEVEL.CRITICAL_ALERT);
    assert.equal(r.hasCritical, true);
  });
  it('CRITICAL_ALERT for SECURITY event', () => {
    const events = [createObservabilityEvent({ eventType: EVENT_TYPE.SECURITY, severity: SEVERITY.ERROR, message: 'sec' }).event];
    const r = evaluateAlerts(events);
    assert.equal(r.overallLevel, ALERT_LEVEL.CRITICAL_ALERT);
  });
  it('ALERT for error burst (5+ errors)', () => {
    const events = Array.from({ length: 5 }, () =>
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.ERROR, message: 'err' }).event
    );
    const r = evaluateAlerts(events);
    assert.ok(r.triggered.some(t => t.ruleId === ALERT_RULE_ID.ERROR_BURST));
  });
  it('WARNING for 3+ timeouts', () => {
    const events = Array.from({ length: 3 }, () =>
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.ERROR, message: 'timeout', errorCategory: 'TIMEOUT' }).event
    );
    const r = evaluateAlerts(events);
    assert.ok(r.triggered.some(t => t.ruleId === ALERT_RULE_ID.REPEATED_TIMEOUT));
  });
  it('ALERT for HIGH error rate in metrics', () => {
    const r = evaluateAlerts([], { errorRate: 0.25 });
    assert.ok(r.triggered.some(t => t.ruleId === ALERT_RULE_ID.HIGH_ERROR_RATE));
  });
  it('adapterNote present', () => {
    const r = evaluateAlerts([]);
    assert.ok(r.adapterNote);
  });
  it('version defined', () => assert.ok(ALERT_ENGINE_VERSION));
});

describe('alertEngine — createAlertChannelAdapter', () => {
  it('creates disabled adapter', () => {
    const r = createAlertChannelAdapter(ALERT_CHANNEL.EMAIL);
    assert.equal(r.valid, true);
    assert.equal(r.enabled, false);
  });
  it('dispatch returns not_implemented when disabled', async () => {
    const adapter = createAlertChannelAdapter(ALERT_CHANNEL.TELEGRAM);
    const result = await adapter.dispatch({ ruleId: 'TEST' });
    assert.equal(result.sent, false);
  });
  it('fails for invalid channel', () => {
    const r = createAlertChannelAdapter('PIGEON');
    assert.equal(r.valid, false);
  });
});

// ── incidentBridge ────────────────────────────────────────────────────────────
import { isIncidentEligibleEvent, observabilityEventToIncident, evaluateIncidentCandidates, INCIDENT_BRIDGE_VERSION } from '../../observability/incidentBridge.js';

describe('incidentBridge — isIncidentEligibleEvent', () => {
  it('CRITICAL event is eligible', () => {
    const e = createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.CRITICAL, message: 'x' }).event;
    assert.equal(isIncidentEligibleEvent(e), true);
  });
  it('INFO event is not eligible', () => {
    const e = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'x' }).event;
    assert.equal(isIncidentEligibleEvent(e), false);
  });
  it('humanActionRequired=true is eligible', () => {
    const e = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.WARNING, message: 'x', humanActionRequired: true }).event;
    assert.equal(isIncidentEligibleEvent(e), true);
  });
  it('null event returns false', () => assert.equal(isIncidentEligibleEvent(null), false));
});

describe('incidentBridge — observabilityEventToIncident', () => {
  it('converts CRITICAL event to incident params', () => {
    const e = createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.CRITICAL, message: 'db down', clientId: 'C1' }).event;
    const r = observabilityEventToIncident(e);
    assert.equal(r.valid, true);
    assert.ok(r.incidentParams.title);
    assert.ok(r.incidentParams.severity);
    assert.ok(r.disclaimer);
  });
  it('returns eligible=false for INFO event', () => {
    const e = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'fine' }).event;
    const r = observabilityEventToIncident(e);
    assert.equal(r.valid, false);
    assert.equal(r.eligible, false);
  });
  it('force=true overrides eligibility', () => {
    const e = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'fine' }).event;
    const r = observabilityEventToIncident(e, { force: true });
    assert.equal(r.valid, true);
  });
  it('version defined', () => assert.ok(INCIDENT_BRIDGE_VERSION));
});

describe('incidentBridge — evaluateIncidentCandidates', () => {
  it('finds CRITICAL events as candidates', () => {
    const events = [
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.CRITICAL, message: 'crit1' }).event,
      createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'fine' }).event,
    ];
    const r = evaluateIncidentCandidates(events);
    assert.equal(r.valid, true);
    assert.equal(r.candidates, 1);
  });
  it('deduplicates by correlationId', () => {
    const cid = 'same-cid';
    const events = Array.from({ length: 3 }, () =>
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.CRITICAL, message: 'c', correlationId: cid }).event
    );
    const r = evaluateIncidentCandidates(events);
    assert.equal(r.candidates, 1); // deduplicated
  });
  it('fails for non-array', () => {
    const r = evaluateIncidentCandidates('not array');
    assert.equal(r.valid, false);
  });
});

// ── automationObservability ──────────────────────────────────────────────────
import { createAutomationEvent, createWebhookEvent, SCENARIO_STATUS, AUTOMATION_OBSERVABILITY_VERSION } from '../../observability/automationObservability.js';

describe('automationObservability — createAutomationEvent', () => {
  it('creates SUCCESS event', () => {
    const r = createAutomationEvent({ scenarioId: 'S1', scenarioName: 'booking', status: SCENARIO_STATUS.SUCCESS, durationMs: 1000, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, true);
    assert.equal(r.event.severity, SEVERITY.INFO);
    assert.equal(r.event.status, EVENT_STATUS.SUCCESS);
  });
  it('creates FAILED event with ERROR severity', () => {
    const r = createAutomationEvent({ scenarioId: 'S1', scenarioName: 'booking', status: SCENARIO_STATUS.FAILED, error: 'timeout', retryCount: 1, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, true);
    assert.equal(r.event.severity, SEVERITY.ERROR);
    assert.equal(r.event.status, EVENT_STATUS.FAILURE);
  });
  it('CRITICAL for 3+ retries', () => {
    const r = createAutomationEvent({ scenarioName: 'S', status: SCENARIO_STATUS.FAILED, error: 'err', retryCount: 3, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.severity, SEVERITY.CRITICAL);
  });
  it('metadata contains scenario fields', () => {
    const r = createAutomationEvent({ scenarioId: 'S1', scenarioName: 'test', status: SCENARIO_STATUS.SUCCESS, operations: 5, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.metadata.scenarioId, 'S1');
    assert.equal(r.event.metadata.operations, 5);
  });
  it('fails without scenarioId or scenarioName', () => {
    const r = createAutomationEvent({ status: SCENARIO_STATUS.SUCCESS, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, false);
  });
  it('version defined', () => assert.ok(AUTOMATION_OBSERVABILITY_VERSION));
});

describe('automationObservability — createWebhookEvent', () => {
  it('creates SUCCESS webhook event', () => {
    const r = createWebhookEvent({ webhookId: 'WH-001', source: 'make', clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, true);
    assert.equal(r.event.severity, SEVERITY.INFO);
  });
  it('creates FAILED webhook event', () => {
    const r = createWebhookEvent({ webhookId: 'WH-001', source: 'make', failed: true, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.severity, SEVERITY.ERROR);
  });
});

// ── aiObservability ──────────────────────────────────────────────────────────
import { createAIEvent, createLangfuseTraceStub, AI_PROVIDER, MODEL_TIER, AI_OBSERVABILITY_VERSION } from '../../observability/aiObservability.js';

describe('aiObservability — createAIEvent', () => {
  it('creates SUCCESS event', () => {
    const r = createAIEvent({ agentType: 'CHAT_AGENT', provider: AI_PROVIDER.ANTHROPIC, modelTier: MODEL_TIER.FAST, success: true, latencyMs: 300, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, true);
    assert.equal(r.event.severity, SEVERITY.INFO);
  });
  it('creates FAILURE event', () => {
    const r = createAIEvent({ agentType: 'SALES_AGENT', provider: AI_PROVIDER.ANTHROPIC, modelTier: MODEL_TIER.BALANCED, success: false, error: 'overloaded', clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, true);
    assert.equal(r.event.status, EVENT_STATUS.FAILURE);
  });
  it('humanEscalation sets WARNING severity', () => {
    const r = createAIEvent({ agentType: 'SUPPORT_AGENT', provider: AI_PROVIDER.ANTHROPIC, modelTier: MODEL_TIER.FAST, success: true, humanEscalation: true, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.severity, SEVERITY.WARNING);
    assert.equal(r.event.humanActionRequired, true);
  });
  it('metadata contains agentType and provider', () => {
    const r = createAIEvent({ agentType: 'BOOKING_AGENT', provider: AI_PROVIDER.ANTHROPIC, modelTier: MODEL_TIER.FAST, success: true, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.metadata.agentType, 'BOOKING_AGENT');
    assert.equal(r.event.metadata.provider, AI_PROVIDER.ANTHROPIC);
  });
  it('langfuseTraceId is null (not configured)', () => {
    const r = createAIEvent({ agentId: 'A1', success: true, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.metadata.langfuseTraceId, null);
  });
  it('fails without agentId or agentType', () => {
    const r = createAIEvent({ clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, false);
  });
  it('version defined', () => assert.ok(AI_OBSERVABILITY_VERSION));
});

describe('aiObservability — createLangfuseTraceStub', () => {
  it('returns stub with sent=false', () => {
    const aiEvent = createAIEvent({ agentType: 'CHAT_AGENT', provider: AI_PROVIDER.ANTHROPIC, modelTier: MODEL_TIER.FAST, success: true, clientId: 'C1', projectId: 'P1' }).event;
    const stub = createLangfuseTraceStub(aiEvent);
    assert.equal(stub.valid, true);
    assert.equal(stub.sent, false);
    assert.ok(stub.traceParams);
    assert.ok(stub.disclaimer);
  });
  it('fails for null event', () => {
    const stub = createLangfuseTraceStub(null);
    assert.equal(stub.valid, false);
  });
});

// ── deployObservability ──────────────────────────────────────────────────────
import { createDeployEvent, DEPLOY_RESULT, DEPLOY_ENVIRONMENT, DEPLOY_OBSERVABILITY_VERSION } from '../../observability/deployObservability.js';

describe('deployObservability — createDeployEvent', () => {
  it('creates SUCCESS deploy event', () => {
    const r = createDeployEvent({ environment: DEPLOY_ENVIRONMENT.STAGING, result: DEPLOY_RESULT.SUCCESS, commitSha: 'abc1234', clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, true);
    assert.equal(r.event.severity, SEVERITY.INFO);
    assert.equal(r.event.status, EVENT_STATUS.SUCCESS);
  });
  it('creates FAILED deploy event with CRITICAL severity in production', () => {
    const r = createDeployEvent({ environment: DEPLOY_ENVIRONMENT.PRODUCTION, result: DEPLOY_RESULT.FAILED, error: 'health check failed', clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.severity, SEVERITY.CRITICAL);
  });
  it('calculates durationMs from deployStart/deployEnd', () => {
    const start = new Date(Date.now() - 60000).toISOString();
    const end   = new Date().toISOString();
    const r = createDeployEvent({ environment: DEPLOY_ENVIRONMENT.STAGING, result: DEPLOY_RESULT.SUCCESS, deployStart: start, deployEnd: end, clientId: 'C1', projectId: 'P1' });
    assert.ok(r.event.durationMs >= 59000);
  });
  it('fails without environment', () => {
    const r = createDeployEvent({ result: DEPLOY_RESULT.SUCCESS, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, false);
  });
  it('fails without result', () => {
    const r = createDeployEvent({ environment: DEPLOY_ENVIRONMENT.STAGING, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, false);
  });
  it('ROLLBACK_TRIGGERED sets recoverable=true', () => {
    const r = createDeployEvent({ environment: DEPLOY_ENVIRONMENT.PRODUCTION, result: DEPLOY_RESULT.ROLLBACK_TRIGGERED, rollbackTriggered: true, clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.recoverable, true);
  });
  it('version defined', () => assert.ok(DEPLOY_OBSERVABILITY_VERSION));
});

// ── securityObservability ────────────────────────────────────────────────────
import { createSecurityEvent, SECURITY_EVENT_TYPE, SECURITY_SEVERITY_MAP, SECURITY_OBSERVABILITY_VERSION } from '../../observability/securityObservability.js';

describe('securityObservability — createSecurityEvent', () => {
  it('creates AUTH_FAILURE event', () => {
    const r = createSecurityEvent({ securityEventType: SECURITY_EVENT_TYPE.AUTH_FAILURE, message: 'login failed', clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, true);
    assert.equal(r.event.eventType, EVENT_TYPE.SECURITY);
    assert.equal(r.event.severity, SEVERITY.WARNING);
  });
  it('BRUTE_FORCE_ATTEMPT → CRITICAL', () => {
    const r = createSecurityEvent({ securityEventType: SECURITY_EVENT_TYPE.BRUTE_FORCE_ATTEMPT, message: 'brute force', clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.severity, SEVERITY.CRITICAL);
    assert.equal(r.event.humanActionRequired, true);
  });
  it('SECRET_DETECTED → CRITICAL', () => {
    const r = createSecurityEvent({ securityEventType: SECURITY_EVENT_TYPE.SECRET_DETECTED, message: 'secret found', clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.severity, SEVERITY.CRITICAL);
  });
  it('CROSS_CLIENT_ATTEMPT → CRITICAL', () => {
    const r = createSecurityEvent({ securityEventType: SECURITY_EVENT_TYPE.CROSS_CLIENT_ATTEMPT, message: 'isolation violation', clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.severity, SEVERITY.CRITICAL);
  });
  it('metadata is redacted', () => {
    const r = createSecurityEvent({ securityEventType: SECURITY_EVENT_TYPE.AUTH_FAILURE, message: 'fail', clientId: 'C1', projectId: 'P1', metadata: { Authorization: 'Bearer secret' } });
    assert.equal(r.event.metadata.Authorization, REDACTED);
  });
  it('ipAddress is included in metadata', () => {
    const r = createSecurityEvent({ securityEventType: SECURITY_EVENT_TYPE.AUTH_FAILURE, message: 'fail', ipAddress: '10.0.0.xxx', clientId: 'C1', projectId: 'P1' });
    assert.equal(r.event.metadata.ipAddress, '10.0.0.xxx');
  });
  it('fails without securityEventType', () => {
    const r = createSecurityEvent({ message: 'fail', clientId: 'C1', projectId: 'P1' });
    assert.equal(r.valid, false);
  });
  it('version defined', () => assert.ok(SECURITY_OBSERVABILITY_VERSION));
});

// ── clientIsolation ──────────────────────────────────────────────────────────
import { assertClientIsolation, filterEventsByClient, validateClientIsolation, createClientScope, CLIENT_ISOLATION_VERSION } from '../../observability/clientIsolation.js';

describe('clientIsolation — assertClientIsolation', () => {
  it('allows same client', () => assert.doesNotThrow(() => assertClientIsolation('C1', 'C1')));
  it('throws for cross-client', () => assert.throws(() => assertClientIsolation('C2', 'C1'), /CLIENT_ISOLATION_VIOLATION/));
  it('allows superuser (*)', () => assert.doesNotThrow(() => assertClientIsolation('ANY', '*')));
  it('allows no callerClientId (unauthenticated audit)', () => assert.doesNotThrow(() => assertClientIsolation('C1', null)));
});

describe('clientIsolation — filterEventsByClient', () => {
  const events = [
    { eventId: '1', clientId: 'C1', message: 'for C1' },
    { eventId: '2', clientId: 'C2', message: 'for C2' },
  ];
  it('filters to caller client only', () => {
    const r = filterEventsByClient(events, 'C1');
    assert.equal(r.length, 1);
    assert.equal(r[0].clientId, 'C1');
  });
  it('superuser gets all', () => {
    const r = filterEventsByClient(events, '*');
    assert.equal(r.length, 2);
  });
  it('returns [] for non-array', () => assert.deepEqual(filterEventsByClient(null, 'C1'), []));
});

describe('clientIsolation — validateClientIsolation', () => {
  it('valid for clean events', () => {
    const events = [{ eventId: '1', clientId: 'C1' }];
    const r = validateClientIsolation(events, 'C1');
    assert.equal(r.valid, true);
    assert.equal(r.violations.length, 0);
  });
  it('detects cross-client violations', () => {
    const events = [{ eventId: '1', clientId: 'C2' }];
    const r = validateClientIsolation(events, 'C1');
    assert.equal(r.valid, false);
    assert.equal(r.violations.length, 1);
  });
  it('superuser has no violations', () => {
    const events = [{ eventId: '1', clientId: 'C1' }, { eventId: '2', clientId: 'C2' }];
    const r = validateClientIsolation(events, '*');
    assert.equal(r.valid, true);
  });
  it('version defined', () => assert.ok(CLIENT_ISOLATION_VERSION));
});

describe('clientIsolation — createClientScope', () => {
  it('creates scope for clientId', () => {
    const scope = createClientScope('C1');
    assert.equal(scope.valid, true);
    assert.equal(scope.clientId, 'C1');
  });
  it('scopeQuery adds clientId', () => {
    const scope = createClientScope('C1');
    const q = scope.scopeQuery({ limit: 50 });
    assert.equal(q.clientId, 'C1');
    assert.equal(q.callerClientId, 'C1');
  });
  it('assertAccess blocks cross-client', () => {
    const scope = createClientScope('C1');
    assert.throws(() => scope.assertAccess('C2'), /CLIENT_ISOLATION_VIOLATION/);
  });
  it('fails without clientId', () => {
    const scope = createClientScope(null);
    assert.equal(scope.valid, false);
  });
});

// ── dashboardModel ────────────────────────────────────────────────────────────
import { buildDashboardModel, DASHBOARD_MODEL_VERSION } from '../../observability/dashboardModel.js';

describe('dashboardModel — buildDashboardModel', () => {
  it('builds model with defaults', () => {
    const r = buildDashboardModel({});
    assert.equal(r.valid, true);
    assert.ok(r.model.generatedAt);
    assert.ok(r.model.summary);
  });
  it('model is frozen', () => {
    const r = buildDashboardModel({});
    assert.throws(() => { r.model.summary = {}; });
  });
  it('propagates health status', () => {
    const healthResult = { overallStatus: 'HEALTHY', healthPercent: 95, requiresIntervention: false, factors: {} };
    const r = buildDashboardModel({ healthResult });
    assert.equal(r.model.summary.overallHealth, 'HEALTHY');
    assert.equal(r.model.summary.healthPercent, 95);
  });
  it('counts critical events in summary', () => {
    const recentEvents = [
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.CRITICAL, message: 'crit' }).event,
      createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'fine' }).event,
    ];
    const r = buildDashboardModel({ recentEvents });
    assert.equal(r.model.summary.criticalEvents, 1);
  });
  it('counts active incidents', () => {
    const incidents = [
      { incidentId: 'INC-1', title: 'DB down', severity: 'SEV1', status: 'OPEN', reportedAt: new Date().toISOString() },
      { incidentId: 'INC-2', title: 'Done', severity: 'SEV3', status: 'RESOLVED', reportedAt: new Date().toISOString() },
    ];
    const r = buildDashboardModel({ incidents });
    assert.equal(r.model.summary.activeIncidents, 1);
  });
  it('version defined', () => assert.ok(DASHBOARD_MODEL_VERSION));
});

// ── debugHelpers ──────────────────────────────────────────────────────────────
import {
  getRecentCriticalEvents, getProjectHealth, getClientHealth,
  getCorrelationTimeline, getServiceErrors, getFailureSummary,
  DEBUG_HELPERS_VERSION,
} from '../../observability/debugHelpers.js';

describe('debugHelpers — getRecentCriticalEvents', () => {
  it('returns only CRITICAL events', () => {
    const events = [
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.CRITICAL, message: 'crit' }).event,
      createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'info' }).event,
    ];
    const r = getRecentCriticalEvents(events);
    assert.equal(r.length, 1);
    assert.equal(r[0].severity, SEVERITY.CRITICAL);
  });
  it('returns [] for non-array', () => assert.deepEqual(getRecentCriticalEvents(null), []));
});

describe('debugHelpers — getProjectHealth', () => {
  it('returns HEALTHY for clean project', () => {
    const events = [
      createObservabilityEvent({ eventType: EVENT_TYPE.REQUEST, severity: SEVERITY.INFO, message: 'ok', projectId: 'P1' }).event,
    ];
    const r = getProjectHealth(events, 'P1');
    assert.equal(r.status, 'HEALTHY');
  });
  it('returns CRITICAL when CRITICAL events present', () => {
    const events = [
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.CRITICAL, message: 'c', projectId: 'P1' }).event,
    ];
    const r = getProjectHealth(events, 'P1');
    assert.equal(r.status, 'CRITICAL');
  });
  it('returns null for missing projectId', () => assert.equal(getProjectHealth([], null), null));
});

describe('debugHelpers — getClientHealth', () => {
  it('returns HEALTHY for clean client', () => {
    const events = [createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'ok', clientId: 'C1' }).event];
    const r = getClientHealth(events, 'C1');
    assert.equal(r.status, 'HEALTHY');
  });
  it('returns NO_DATA for unknown client', () => {
    const r = getClientHealth([], 'UNKNOWN');
    assert.equal(r.status, 'NO_DATA');
  });
});

describe('debugHelpers — getCorrelationTimeline', () => {
  it('returns events in chronological order', () => {
    const cid = 'cid-timeline';
    const events = [
      createObservabilityEvent({ eventType: EVENT_TYPE.RESPONSE, severity: SEVERITY.INFO, message: 'second', correlationId: cid }).event,
      createObservabilityEvent({ eventType: EVENT_TYPE.REQUEST,  severity: SEVERITY.INFO, message: 'first',  correlationId: cid }).event,
    ];
    const timeline = getCorrelationTimeline(events, cid);
    assert.equal(timeline.length, 2);
    assert.ok(timeline[0].step === 1);
  });
  it('returns [] for missing correlationId', () => assert.deepEqual(getCorrelationTimeline([], null), []));
});

describe('debugHelpers — getServiceErrors', () => {
  it('returns errors for specific service', () => {
    const events = [
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.ERROR, message: 'db err', service: SERVICE.DATABASE }).event,
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.ERROR, message: 'api err', service: SERVICE.API }).event,
    ];
    const r = getServiceErrors(events, SERVICE.DATABASE);
    assert.equal(r.length, 1);
    assert.equal(r[0].service, SERVICE.DATABASE);
  });
});

describe('debugHelpers — getFailureSummary', () => {
  it('summarizes failures', () => {
    const events = [
      createObservabilityEvent({ eventType: EVENT_TYPE.ERROR, severity: SEVERITY.ERROR, message: 'f', status: EVENT_STATUS.FAILURE, errorCategory: 'DATABASE' }).event,
      createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'ok', status: EVENT_STATUS.SUCCESS }).event,
    ];
    const r = getFailureSummary(events);
    assert.equal(r.totalFailures, 1);
    assert.ok(r.byCategory.DATABASE);
  });
  it('returns null for non-array', () => assert.equal(getFailureSummary(null), null));
  it('version defined', () => assert.ok(DEBUG_HELPERS_VERSION));
});

// ── retentionPolicy ───────────────────────────────────────────────────────────
import { createRetentionPolicy, shouldStoreEvent, getRetentionExpiry, RETENTION_ENVIRONMENT, EVENT_RETENTION_DAYS, RETENTION_POLICY_VERSION } from '../../observability/retentionPolicy.js';

describe('retentionPolicy — createRetentionPolicy', () => {
  it('creates production policy', () => {
    const r = createRetentionPolicy({ environment: RETENTION_ENVIRONMENT.PRODUCTION });
    assert.equal(r.valid, true);
    assert.equal(r.policy.piiRedaction, true);
    assert.equal(r.policy.secretRedaction, true);
  });
  it('dev policy has shorter retention', () => {
    const dev  = createRetentionPolicy({ environment: RETENTION_ENVIRONMENT.DEVELOPMENT });
    const prod = createRetentionPolicy({ environment: RETENTION_ENVIRONMENT.PRODUCTION });
    assert.ok(dev.policy.retentionDays.info < prod.policy.retentionDays.info);
  });
  it('DEBUG disabled in production', () => {
    const r = createRetentionPolicy({ environment: RETENTION_ENVIRONMENT.PRODUCTION });
    assert.equal(r.policy.eventTypes.debug, false);
  });
  it('security retention is longer than info retention', () => {
    const r = createRetentionPolicy({ environment: RETENTION_ENVIRONMENT.PRODUCTION });
    assert.ok(r.policy.securityRetention > r.policy.retentionDays.info);
  });
  it('has disclaimer', () => {
    const r = createRetentionPolicy({});
    assert.ok(r.policy.disclaimer);
  });
  it('version defined', () => assert.ok(RETENTION_POLICY_VERSION));
});

describe('retentionPolicy — shouldStoreEvent', () => {
  it('allows INFO in production', () => {
    const { policy } = createRetentionPolicy({ environment: RETENTION_ENVIRONMENT.PRODUCTION });
    const e = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'x' }).event;
    assert.equal(shouldStoreEvent(e, policy), true);
  });
  it('returns false for null', () => assert.equal(shouldStoreEvent(null, null), false));
});

describe('retentionPolicy — getRetentionExpiry', () => {
  it('returns future date for INFO event', () => {
    const { policy } = createRetentionPolicy({ environment: RETENTION_ENVIRONMENT.PRODUCTION });
    const e = createObservabilityEvent({ eventType: EVENT_TYPE.SYSTEM, severity: SEVERITY.INFO, message: 'x' }).event;
    const expiry = getRetentionExpiry(e, policy);
    assert.ok(new Date(expiry) > new Date());
  });
  it('security events get longer retention', () => {
    const { policy } = createRetentionPolicy({ environment: RETENTION_ENVIRONMENT.PRODUCTION });
    const e = createObservabilityEvent({ eventType: EVENT_TYPE.SECURITY, severity: SEVERITY.ERROR, message: 'sec' }).event;
    const expiry = getRetentionExpiry(e, policy);
    // should be ~2 years from now
    const days = (new Date(expiry) - new Date()) / (1000 * 60 * 60 * 24);
    assert.ok(days > 300);
  });
  it('returns null for missing args', () => assert.equal(getRetentionExpiry(null, null), null));
});

// ── nexoFixture ────────────────────────────────────────────────────────────────
import {
  NEXO_CLIENT,
  simulateSuccessfulRequest, simulateAPITimeout, simulateAutomationFailure,
  simulateAIFallback, simulateSecurityWarning, simulateDeployFailure,
  runNexoObservabilityScenarios,
} from '../../observability/nexoFixture.js';

describe('nexoFixture — NEXO_CLIENT', () => {
  it('is not a real client', () => assert.equal(NEXO_CLIENT.isReal, false));
  it('is frozen', () => assert.throws(() => { NEXO_CLIENT.isReal = true; }));
  it('has clientId', () => assert.ok(NEXO_CLIENT.clientId));
  it('email is fictional', () => assert.ok(NEXO_CLIENT.contact.email.includes('ficticio')));
});

describe('nexoFixture — simulateSuccessfulRequest', () => {
  it('returns events and context', () => {
    const r = simulateSuccessfulRequest();
    assert.equal(r.isReal, false);
    assert.ok(r.events.length > 0);
    assert.ok(r.context.correlationId);
  });
  it('all events have same correlationId', () => {
    const r = simulateSuccessfulRequest();
    const cids = new Set(r.events.map(e => e.correlationId));
    assert.equal(cids.size, 1);
  });
});

describe('nexoFixture — failure scenarios', () => {
  it('simulateAPITimeout returns events', () => {
    const r = simulateAPITimeout();
    assert.ok(r.events.length > 0);
  });
  it('simulateAutomationFailure returns FAILURE event', () => {
    const r = simulateAutomationFailure();
    assert.ok(r.events.some(e => e.status === EVENT_STATUS.FAILURE));
  });
  it('simulateAIFallback returns 2 events', () => {
    const r = simulateAIFallback();
    assert.equal(r.events.length, 2);
  });
  it('simulateSecurityWarning returns SECURITY event', () => {
    const r = simulateSecurityWarning();
    assert.ok(r.events.some(e => e.eventType === EVENT_TYPE.SECURITY));
  });
  it('simulateDeployFailure returns DEPLOY event', () => {
    const r = simulateDeployFailure();
    assert.ok(r.events.some(e => e.eventType === EVENT_TYPE.DEPLOY));
  });
});

describe('nexoFixture — runNexoObservabilityScenarios', () => {
  it('runs all 6 scenarios', () => {
    const r = runNexoObservabilityScenarios();
    assert.equal(r.totalScenarios, 6);
    assert.ok(r.totalEvents > 0);
  });
  it('guardrails are enforced', () => {
    const r = runNexoObservabilityScenarios();
    assert.equal(r.guardrails.noRealClients, true);
    assert.equal(r.guardrails.noProductionChanges, true);
  });
  it('metrics are calculated', () => {
    const r = runNexoObservabilityScenarios();
    assert.equal(r.metrics.valid, true);
    assert.ok(r.metrics.totalEvents > 0);
  });
  it('alerts are evaluated', () => {
    const r = runNexoObservabilityScenarios();
    assert.equal(r.alerts.valid, true);
  });
});

// ── failureScenarios ──────────────────────────────────────────────────────────
import {
  runAllFailureScenarios,
  runNetworkTimeoutScenario, runRateLimitScenario, runDatabaseFailureScenario,
  runAutomationFailureScenario, runAIProviderFailureScenario, runFallbackSuccessScenario,
  runSecurityEventScenario, runDeployFailureScenario, runRuntimeFailureScenario,
  runRepeatedErrorsScenario, runCrossClientAccessScenario, runSecretInMetadataScenario,
  FAILURE_SCENARIO,
} from '../../observability/failureScenarios.js';

describe('failureScenarios — individual scenarios', () => {
  it('network_timeout handled', () => {
    const r = runNetworkTimeoutScenario();
    assert.equal(r.handled, true);
    assert.equal(r.safe, true);
  });
  it('rate_limit handled', () => {
    const r = runRateLimitScenario();
    assert.equal(r.handled, true);
    assert.equal(r.normalized.errorCategory, 'RATE_LIMIT');
  });
  it('database_failure handled', () => {
    const r = runDatabaseFailureScenario();
    assert.equal(r.handled, true);
  });
  it('automation_failure handled', () => {
    const r = runAutomationFailureScenario();
    assert.equal(r.handled, true);
  });
  it('ai_provider_failure handled', () => {
    const r = runAIProviderFailureScenario();
    assert.equal(r.handled, true);
  });
  it('fallback_success recovered', () => {
    const r = runFallbackSuccessScenario();
    assert.equal(r.handled, true);
    assert.equal(r.recovered, true);
  });
  it('security_event handled and safe', () => {
    const r = runSecurityEventScenario();
    assert.equal(r.handled, true);
    assert.equal(r.safe, true);
  });
  it('deploy_failure handled', () => {
    const r = runDeployFailureScenario();
    assert.equal(r.handled, true);
  });
  it('runtime_failure handled', () => {
    const r = runRuntimeFailureScenario();
    assert.equal(r.handled, true);
  });
  it('repeated_errors handled (6 events)', () => {
    const r = runRepeatedErrorsScenario();
    assert.equal(r.handled, true);
    assert.ok(r.events.length >= 5);
  });
  it('cross_client_access blocked', () => {
    const r = runCrossClientAccessScenario();
    assert.equal(r.blocked, true);
    assert.ok(r.violation.code === 'CLIENT_ISOLATION_VIOLATION');
  });
  it('secret_in_metadata redacted', () => {
    const r = runSecretInMetadataScenario();
    assert.equal(r.handled, true);
    assert.equal(r.secretRedacted, true);
    assert.equal(r.redactedMetadata.Authorization, REDACTED);
  });
});

describe('failureScenarios — runAllFailureScenarios', () => {
  it('all 12 scenarios handled', () => {
    const r = runAllFailureScenarios();
    assert.equal(r.valid, true);
    assert.equal(r.totalScenarios, 12);
    assert.equal(r.allHandled, true);
  });
});

// ── registry integration ──────────────────────────────────────────────────────
import { REGISTRY_VERSION, PASO_ADV01_STATUS } from '../../factory-registry/index.js';

describe('factory-registry — observability integration', () => {
  it('REGISTRY_VERSION is 2.9.0', () => {
    assert.equal(REGISTRY_VERSION, '2.9.0');
  });
  it('PASO_ADV01_STATUS is 100_PERCENT', () => {
    assert.equal(PASO_ADV01_STATUS, '100_PERCENT');
  });
});

import { OBSERVABILITY_VERSION, OBSERVABILITY_MODULES } from '../../observability/index.js';

describe('observability/index — barrel', () => {
  it('OBSERVABILITY_VERSION defined', () => assert.ok(OBSERVABILITY_VERSION));
  it('OBSERVABILITY_MODULES lists 21 modules', () => assert.equal(OBSERVABILITY_MODULES.length, 21));
  it('OBSERVABILITY_MODULES is frozen', () => assert.throws(() => { OBSERVABILITY_MODULES.push('x'); }));
});
