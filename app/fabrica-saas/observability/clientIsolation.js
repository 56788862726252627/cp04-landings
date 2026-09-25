// Client Isolation — ADV-01 Transversal Observability
// Guarantees that CLIENT_A events never appear in CLIENT_B queries.
// Enforced at store level + explicit guard functions here.

export const ISOLATION_VIOLATION_CODE = 'CLIENT_ISOLATION_VIOLATION';

/**
 * Guard: throws if callerClientId attempts to access a different clientId's data.
 * Pass callerClientId='*' to grant superuser access (internal use only).
 */
export function assertClientIsolation(requestedClientId, callerClientId) {
  if (!callerClientId) return; // no caller context — allow (unauthenticated audit context)
  if (callerClientId === '*') return; // superuser
  if (!requestedClientId) return; // wildcard request — allow caller to filter own

  if (requestedClientId !== callerClientId) {
    const err = new Error(
      `${ISOLATION_VIOLATION_CODE}: caller='${callerClientId}' attempted to access client='${requestedClientId}'`
    );
    err.code = ISOLATION_VIOLATION_CODE;
    throw err;
  }
}

/**
 * Filter an array of events to only include those belonging to callerClientId.
 * If callerClientId='*' returns all events unmodified.
 */
export function filterEventsByClient(events, callerClientId) {
  if (!Array.isArray(events)) return [];
  if (!callerClientId || callerClientId === '*') return events;
  return events.filter(e => e.clientId === callerClientId);
}

/**
 * Validate that a set of events contains no cross-client data for the caller.
 * Returns { valid, violations }.
 */
export function validateClientIsolation(events, callerClientId) {
  if (!callerClientId || callerClientId === '*') {
    return { valid: true, violations: [], totalEvents: events.length };
  }

  const violations = events
    .filter(e => e.clientId && e.clientId !== callerClientId)
    .map(e => ({ eventId: e.eventId, intendedClient: e.clientId, callerClient: callerClientId }));

  return {
    valid:       violations.length === 0,
    violations,
    totalEvents: events.length,
    clean:       violations.length === 0,
  };
}

/**
 * Create a scoped query context for a specific client.
 * All queries through this context are automatically scoped.
 */
export function createClientScope(clientId) {
  if (!clientId) return { valid: false, error: 'clientId required' };

  return {
    valid:    true,
    clientId,

    scopeQuery(queryParams = {}) {
      return { ...queryParams, clientId, callerClientId: clientId };
    },

    filterEvents(events) {
      return filterEventsByClient(events, clientId);
    },

    assertAccess(targetClientId) {
      assertClientIsolation(targetClientId, clientId);
    },
  };
}

export const CLIENT_ISOLATION_VERSION = '1.0.0';
