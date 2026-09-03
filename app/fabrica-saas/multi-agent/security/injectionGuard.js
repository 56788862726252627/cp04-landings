// Agent Delegation Injection Guard — ADV-17
// External instructions cannot create agents, increase permissions, change client,
// authorize spend, or ignore system policy.

const INJECTION_PATTERNS = [
  { pattern: /ignore.*system.*policy/i,   reason: 'SYSTEM_POLICY_BYPASS' },
  { pattern: /create.*agent/i,            reason: 'AGENT_CREATION_FROM_INPUT' },
  { pattern: /grant.*permission/i,        reason: 'PERMISSION_GRANT_FROM_INPUT' },
  { pattern: /change.*client.*id/i,       reason: 'CLIENT_ID_MANIPULATION' },
  { pattern: /authorize.*spend/i,         reason: 'SPEND_AUTHORIZATION_INJECTION' },
  { pattern: /act.*as.*admin/i,           reason: 'ADMIN_IMPERSONATION' },
  { pattern: /bypass.*approval/i,         reason: 'APPROVAL_BYPASS' },
  { pattern: /disable.*guardrail/i,       reason: 'GUARDRAIL_DISABLE_ATTEMPT' },
];

export function createAgentDelegationInjectionGuard() {
  return Object.freeze({
    inspect(input = '') {
      if (typeof input !== 'string') {
        return Object.freeze({ safe: true, threats: Object.freeze([]), isReal: false });
      }

      const threats = INJECTION_PATTERNS
        .filter(p => p.pattern.test(input))
        .map(p => p.reason);

      return Object.freeze({
        safe:    threats.length === 0,
        threats: Object.freeze(threats),
        isReal:  false,
      });
    },

    inspectTask(task = {}) {
      const combined = [task.objective, task.input?.text, JSON.stringify(task.input ?? {})]
        .filter(Boolean).join(' ');
      return this.inspect(combined);
    },

    isReal: false,
  });
}

export const INJECTION_GUARD_VERSION = '1.0.0';
