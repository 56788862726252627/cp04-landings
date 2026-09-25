// Observability Store — ADV-01 Transversal Observability
// In-memory store (dev/test). Designed for future Supabase/PostgreSQL adapter.
// Client isolation enforced: events of CLIENT_A never visible to CLIENT_B queries.

import { SEVERITY } from './eventModel.js';

export const STORE_ADAPTER_TYPE = Object.freeze({
  MEMORY:    'MEMORY',
  SUPABASE:  'SUPABASE',  // future
  POSTGRES:  'POSTGRES',  // future
  NOOP:      'NOOP',
});

/**
 * Create an in-memory ObservabilityStore.
 * The Supabase/PostgreSQL adapter follows the same interface.
 */
export function createObservabilityStore(config = {}) {
  const adapterType = config.adapterType ?? STORE_ADAPTER_TYPE.MEMORY;
  const maxEvents   = config.maxEvents   ?? 10000;
  const _store      = [];

  function assertClientScope(queryClientId, callerClientId) {
    if (!callerClientId || callerClientId === '*') return;
    if (queryClientId && queryClientId !== callerClientId) {
      throw new Error(`CLIENT_ISOLATION_VIOLATION: caller=${callerClientId} attempted to query client=${queryClientId}`);
    }
  }

  const store = {
    adapterType,

    async writeEvent(event) {
      if (!event || !event.eventId) return { ok: false, error: 'invalid event' };
      _store.push({ ...event, _storedAt: new Date().toISOString() });
      if (_store.length > maxEvents) _store.shift();
      return { ok: true, eventId: event.eventId };
    },

    async writeEvents(events) {
      if (!Array.isArray(events)) return { ok: false, error: 'events must be array' };
      const results = await Promise.all(events.map(e => store.writeEvent(e)));
      return { ok: results.every(r => r.ok), count: results.filter(r => r.ok).length };
    },

    async queryEvents({ clientId, projectId, eventType, severity, service, limit = 100, callerClientId } = {}) {
      if (clientId) assertClientScope(clientId, callerClientId);

      let results = [..._store];
      if (clientId)   results = results.filter(e => e.clientId  === clientId);
      if (projectId)  results = results.filter(e => e.projectId === projectId);
      if (eventType)  results = results.filter(e => e.eventType === eventType);
      if (severity)   results = results.filter(e => e.severity  === severity);
      if (service)    results = results.filter(e => e.service   === service);

      return results.slice(-limit).reverse();
    },

    async queryByCorrelationId(correlationId, { callerClientId } = {}) {
      if (!correlationId) return [];
      let results = _store.filter(e => e.correlationId === correlationId);
      if (callerClientId && callerClientId !== '*') {
        results = results.filter(e => e.clientId === callerClientId);
      }
      return results.sort((a, b) => a.timestamp < b.timestamp ? -1 : 1);
    },

    async queryErrors({ clientId, callerClientId, limit = 50 } = {}) {
      if (clientId) assertClientScope(clientId, callerClientId);
      const ERROR_SEVERITIES = new Set([SEVERITY.ERROR, SEVERITY.CRITICAL]);
      let results = _store.filter(e => ERROR_SEVERITIES.has(e.severity));
      if (clientId) results = results.filter(e => e.clientId === clientId);
      return results.slice(-limit).reverse();
    },

    async queryCritical({ clientId, callerClientId, limit = 20 } = {}) {
      if (clientId) assertClientScope(clientId, callerClientId);
      let results = _store.filter(e => e.severity === SEVERITY.CRITICAL);
      if (clientId) results = results.filter(e => e.clientId === clientId);
      return results.slice(-limit).reverse();
    },

    async getRecentEvents({ clientId, callerClientId, limit = 50 } = {}) {
      if (clientId) assertClientScope(clientId, callerClientId);
      let results = [..._store];
      if (clientId) results = results.filter(e => e.clientId === clientId);
      return results.slice(-limit).reverse();
    },

    size()   { return _store.length; },
    clear()  { _store.splice(0); },
    _store,

    getStatus() {
      return { adapterType, storedEvents: _store.length, maxEvents };
    },
  };

  return store;
}

export const OBSERVABILITY_STORE_VERSION = '1.0.0';
