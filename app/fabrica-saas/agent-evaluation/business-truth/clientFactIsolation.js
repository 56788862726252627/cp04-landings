// Client Fact Isolation — ADV-10b
// Ensures facts of client A never appear in responses for client B.

export const ISOLATION_VERDICT = Object.freeze({
  ISOLATED:  'ISOLATED',
  LEAKED:    'LEAKED',
  UNCERTAIN: 'UNCERTAIN',
});

export function assertClientIsolation(expectedClientId = '', facts = []) {
  const leaks = facts.filter(f => f.clientId && f.clientId !== expectedClientId);

  if (leaks.length > 0) {
    return Object.freeze({
      verdict:    ISOLATION_VERDICT.LEAKED,
      leaks:      Object.freeze(leaks.map(f => ({ key: f.key, clientId: f.clientId }))),
      message:    `${leaks.length} fact(s) from wrong client detected in context for "${expectedClientId}"`,
      isCritical: true,
      isReal:     false,
    });
  }

  return Object.freeze({
    verdict:  ISOLATION_VERDICT.ISOLATED,
    leaks:    Object.freeze([]),
    message:  `All facts belong to client "${expectedClientId}"`,
    isCritical: false,
    isReal:   false,
  });
}

export function detectCrossClientFactLeak(responseText = '', clientAFacts = [], clientBId = '') {
  const leaked = [];
  for (const fact of clientAFacts) {
    const val = fact.value;
    if (val && typeof val === 'string' && responseText.includes(val)) {
      leaked.push({ key: fact.key, value: val, clientId: fact.clientId });
    }
  }

  return Object.freeze({
    leakDetected: leaked.length > 0,
    leaked:       Object.freeze(leaked),
    targetClient: clientBId,
    isCritical:   leaked.length > 0,
    isReal:       false,
  });
}

export const CLIENT_FACT_ISOLATION_VERSION = '1.0.0';
