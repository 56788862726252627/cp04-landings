// Correlation / Trace Context — ADV-01 Transversal Observability
// Tracks an operation across components: frontend → API → automation → AI → response.

function genId(prefix) {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export const OPERATION_STATUS = Object.freeze({
  STARTED:   'STARTED',
  COMPLETED: 'COMPLETED',
  FAILED:    'FAILED',
  CANCELLED: 'CANCELLED',
  TIMEOUT:   'TIMEOUT',
});

/**
 * Create a new correlation context for tracking a full operation.
 * @param {object} params
 * @param {string} params.operation    — human-readable operation name
 * @param {string} params.clientId
 * @param {string} params.projectId
 * @param {string} params.source       — initiator (e.g. 'web', 'telegram', 'cron')
 * @param {string} params.correlationId — override; generated if not provided
 * @param {string} params.traceId       — override; generated if not provided
 * @param {string} params.parentOperationId — for nested operations
 */
export function createCorrelationContext(params = {}) {
  if (!params.operation) {
    return { valid: false, error: 'operation name required' };
  }

  const correlationId    = params.correlationId    ?? genId('cid');
  const traceId          = params.traceId          ?? genId('trc');
  const operationId      = genId('op');
  const startedAt        = new Date().toISOString();
  const spans            = [];

  const context = {
    correlationId,
    traceId,
    operationId,
    parentOperationId: params.parentOperationId ?? null,
    operation:         params.operation,
    clientId:          params.clientId  ?? 'unknown',
    projectId:         params.projectId ?? 'unknown',
    source:            params.source    ?? 'system',
    startedAt,
    status:            OPERATION_STATUS.STARTED,
    completedAt:       null,
    durationMs:        null,
    spans,

    /**
     * Start a child span within this operation.
     * Returns a span object with .end() method.
     */
    startSpan(component, service, extra = {}) {
      const spanId     = genId('spn');
      const spanStart  = Date.now();
      const spanStartAt = new Date().toISOString();

      const span = {
        spanId,
        component,
        service,
        startedAt:   spanStartAt,
        completedAt: null,
        durationMs:  null,
        status:      OPERATION_STATUS.STARTED,
        metadata:    extra.metadata ?? {},
        error:       null,

        end(result = {}) {
          const durationMs = Date.now() - spanStart;
          span.completedAt = new Date().toISOString();
          span.durationMs  = durationMs;
          span.status      = result.failed ? OPERATION_STATUS.FAILED : OPERATION_STATUS.COMPLETED;
          span.error       = result.error ?? null;
          return { ...span };
        },

        fail(error) {
          return span.end({ failed: true, error: error?.message ?? String(error) });
        },
      };

      spans.push(span);
      return span;
    },

    /**
     * Complete the operation.
     */
    complete(result = {}) {
      context.completedAt = new Date().toISOString();
      context.durationMs  = Date.now() - new Date(startedAt).getTime();
      context.status      = result.failed ? OPERATION_STATUS.FAILED : OPERATION_STATUS.COMPLETED;
      return { ...context, spans: [...spans] };
    },

    fail(error) {
      return context.complete({ failed: true, error: error?.message ?? String(error) });
    },

    /**
     * Create a child context inheriting correlation/trace IDs.
     */
    child(operation, extra = {}) {
      return createCorrelationContext({
        operation,
        correlationId,
        traceId,
        parentOperationId: operationId,
        clientId:  extra.clientId  ?? params.clientId,
        projectId: extra.projectId ?? params.projectId,
        source:    extra.source    ?? params.source,
      }).context;
    },

    /**
     * Get a plain serializable summary (safe for logging).
     */
    toMeta() {
      return {
        correlationId,
        traceId,
        operationId,
        parentOperationId: params.parentOperationId ?? null,
        operation:         params.operation,
        clientId:          params.clientId  ?? 'unknown',
        source:            params.source    ?? 'system',
      };
    },
  };

  return { valid: true, context };
}

export const CORRELATION_CONTEXT_VERSION = '1.0.0';
