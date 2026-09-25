// Prompt Injection Security Policy — ADV-19

const INJECTION_PATTERNS = [
  { pattern: /ignore\s+(previous|all)\s+instructions/i,         type: 'IGNORE_INSTRUCTIONS' },
  { pattern: /disable\s+(guardrail|guard|safety)/i,             type: 'DISABLE_GUARDRAIL' },
  { pattern: /reveal\s+(secret|key|password|token|credential)/i,type: 'REVEAL_SECRET' },
  { pattern: /change\s+(tenant|client|context|organization)/i,  type: 'CHANGE_TENANT' },
  { pattern: /act\s+as\s+(admin|root|superuser|god)/i,          type: 'ACT_AS_ADMIN' },
  { pattern: /authorize\s+(payment|transfer|charge)/i,          type: 'AUTHORIZE_PAYMENT' },
  { pattern: /send\s+(email|message|request)\s+to\s+external/i, type: 'SEND_EXTERNAL' },
  { pattern: /bypass\s+(approval|review|check)/i,               type: 'BYPASS_APPROVAL' },
];

export function createPromptInjectionSecurityPolicy(config = {}) {
  const { clientId = null } = config;

  function inspectPrompt(prompt = '') {
    const detections = [];
    for (const { pattern, type } of INJECTION_PATTERNS) {
      if (pattern.test(prompt)) {
        detections.push(Object.freeze({ type, severity: 'CRITICAL' }));
      }
    }
    return Object.freeze({
      safe: detections.length === 0,
      detections: Object.freeze(detections),
      blocked: detections.length > 0,
      isReal: false,
    });
  }

  function inspectTask(task = {}) {
    const content = [task.objective, task.instructions, task.context]
      .filter(Boolean).join(' ');
    return inspectPrompt(content);
  }

  return Object.freeze({ clientId, inspectPrompt, inspectTask, patternCount: INJECTION_PATTERNS.length, isReal: false });
}

export const PROMPT_INJECTION_VERSION = '1.0.0';
