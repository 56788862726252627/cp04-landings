// Structured Logger — ADV-01 Transversal Observability
// Produces structured ObservabilityEvents. Extends EventLogger pattern.
// Supports console output in dev + future adapter plugins.

import { createObservabilityEvent, SEVERITY, EVENT_TYPE, EVENT_STATUS, SERVICE } from './eventModel.js';
import { redactSensitiveData } from './redactionEngine.js';

const LEVEL_ORDER = [SEVERITY.DEBUG, SEVERITY.INFO, SEVERITY.WARNING, SEVERITY.ERROR, SEVERITY.CRITICAL];

export const LOG_ADAPTER_TYPE = Object.freeze({
  CONSOLE: 'CONSOLE',
  MEMORY:  'MEMORY',
  SILENT:  'SILENT',
  CUSTOM:  'CUSTOM',
});

function consoleAdapter(event) {
  const prefix = `[${event.severity}] [${event.clientId}] [${event.correlationId}]`;
  if (event.severity === SEVERITY.DEBUG)    console.debug(prefix, event.message, event.metadata);
  else if (event.severity === SEVERITY.INFO) console.info(prefix, event.message);
  else if (event.severity === SEVERITY.WARNING) console.warn(prefix, event.message, event.metadata);
  else console.error(prefix, event.message, event.metadata);
}

/**
 * Create a structured logger instance.
 * @param {object} config
 * @param {string} config.clientId
 * @param {string} config.projectId
 * @param {string} config.environment
 * @param {string} config.minSeverity  — minimum severity to emit
 * @param {string} config.service
 * @param {string} config.component
 * @param {string} config.adapterType  — CONSOLE | MEMORY | SILENT | CUSTOM
 * @param {Function} config.customAdapter
 * @param {number}  config.maxEvents   — for MEMORY adapter
 */
export function createLogger(config = {}) {
  const minSeverity   = config.minSeverity ?? SEVERITY.INFO;
  const adapterType   = config.adapterType ?? LOG_ADAPTER_TYPE.CONSOLE;
  const maxEvents     = config.maxEvents   ?? 1000;
  const _events       = [];

  function shouldEmit(severity) {
    return LEVEL_ORDER.indexOf(severity) >= LEVEL_ORDER.indexOf(minSeverity);
  }

  function emit(severity, message, extra = {}) {
    if (!shouldEmit(severity)) return null;

    const safeMetadata = redactSensitiveData(extra.metadata ?? {});

    const result = createObservabilityEvent({
      severity,
      message,
      eventType:           extra.eventType           ?? EVENT_TYPE.SYSTEM,
      status:              extra.status              ?? (severity === SEVERITY.ERROR || severity === SEVERITY.CRITICAL ? EVENT_STATUS.FAILURE : EVENT_STATUS.SUCCESS),
      clientId:            extra.clientId            ?? config.clientId   ?? 'unknown',
      projectId:           extra.projectId           ?? config.projectId  ?? 'unknown',
      environment:         extra.environment         ?? config.environment ?? 'development',
      service:             extra.service             ?? config.service    ?? SERVICE.SYSTEM,
      component:           extra.component           ?? config.component  ?? 'unknown',
      module:              extra.module              ?? config.module,
      correlationId:       extra.correlationId       ?? config._correlationId,
      traceId:             extra.traceId             ?? config._traceId,
      operationId:         extra.operationId,
      durationMs:          extra.durationMs,
      errorCode:           extra.errorCode,
      errorCategory:       extra.errorCategory,
      recoverable:         extra.recoverable,
      retryCount:          extra.retryCount,
      humanActionRequired: extra.humanActionRequired ?? (severity === SEVERITY.CRITICAL),
      metadata:            safeMetadata,
      source:              extra.source ?? 'logger',
    });

    if (!result.valid) return null;
    const event = result.event;

    if (adapterType === LOG_ADAPTER_TYPE.MEMORY || adapterType === LOG_ADAPTER_TYPE.CONSOLE) {
      _events.push(event);
      if (_events.length > maxEvents) _events.shift();
    }

    if (adapterType === LOG_ADAPTER_TYPE.CONSOLE) {
      consoleAdapter(event);
    } else if (adapterType === LOG_ADAPTER_TYPE.CUSTOM && typeof config.customAdapter === 'function') {
      config.customAdapter(event);
    }

    return event;
  }

  const logger = {
    debug:    (message, extra) => emit(SEVERITY.DEBUG,    message, extra),
    info:     (message, extra) => emit(SEVERITY.INFO,     message, extra),
    warn:     (message, extra) => emit(SEVERITY.WARNING,  message, extra),
    error:    (message, extra) => emit(SEVERITY.ERROR,    message, extra),
    critical: (message, extra) => emit(SEVERITY.CRITICAL, message, extra),

    withContext(ctx) {
      return createLogger({
        ...config,
        ...ctx,
        _correlationId: ctx.correlationId ?? config._correlationId,
        _traceId:       ctx.traceId       ?? config._traceId,
        adapterType,
        maxEvents,
        minSeverity,
        customAdapter:  config.customAdapter,
      });
    },

    getEvents(filter = {}) {
      let evs = [..._events];
      if (filter.severity)     evs = evs.filter(e => e.severity    === filter.severity);
      if (filter.eventType)    evs = evs.filter(e => e.eventType   === filter.eventType);
      if (filter.clientId)     evs = evs.filter(e => e.clientId    === filter.clientId);
      if (filter.correlationId)evs = evs.filter(e => e.correlationId === filter.correlationId);
      if (filter.service)      evs = evs.filter(e => e.service     === filter.service);
      return evs;
    },

    getStatus() {
      return {
        system:      'structured_logger',
        minSeverity,
        adapterType,
        storedEvents: _events.length,
        clientId:    config.clientId ?? 'unknown',
      };
    },

    clearEvents() { _events.splice(0); },

    _events,
  };

  return logger;
}

export const STRUCTURED_LOGGER_VERSION = '1.0.0';
